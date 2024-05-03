// Copyright 2018-2024 Use Ink (UK) Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod link {
    use ink::{
        prelude::vec::Vec,
        storage::Mapping,
    };

    /// Slugs shorter than this are rejected by [`shorten`].
    const MIN_SLUG_LENGTH: usize = 5;

    /// The result used for all messages.
    type Result<T> = core::result::Result<T, Error>;

    /// We treat a URL as bytes. We don't check if it is a valid URL at all.
    ///
    /// # Note
    ///
    /// A resolver DApp should sanitize URLs before doing a forward.
    type Url = Vec<u8>;

    /// We treat the slug as just bytes. We don't check if it represents a valid text.
    ///
    /// # Note
    ///
    /// A slug that isn't allowed to appear within an URL is pretty useless. Any
    /// sane DApp probably wouldn't allow inputting arbitrary byte patterns.
    type Slug = Vec<u8>;

    /// The in-storage representation of this contract.
    #[ink(storage)]
    #[derive(Default)]
    pub struct Link {
        /// Needed in order to resolve slugs to URLs.
        urls: Mapping<Slug, Url>,
        /// Needed in order to de-duplicate URLs when shortening.
        slugs: Mapping<Url, Slug>,
        /// The account that is allowed to upgrade this contract.
        upgrader: Option<AccountId>,
    }

    /// The error type used for all messages.
    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        /// The slug is already in use for another URL.
        SlugUnavailable,
        /// The supplied slug was too short.
        SlugTooShort,
        /// User requested to use an existing slug but the URL wasn't shortened before.
        UrlNotFound,
        // The account trying to do the upgrade doesn't match the `upgrader`.
        UpgradeDenied,
        /// The upgrade of the contract failed for some other reason than authorization.
        UpgradeFailed,
    }

    /// Used by users to specify whether an URL should be de-duplicated.
    #[derive(Debug, PartialEq, Eq, Clone)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum SlugCreationMode {
        /// Always create a new slug even if the URL was already shortened.
        New(Slug),
        /// Only use the supplied slug in case the URL wasn't shortened before.
        DeduplicateOrNew(Slug),
        /// Never create a new slug. Fail if the URL wasn't shortened before.
        Deduplicate,
    }

    /// Specifies the outcome of a [`shorten`] message.
    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum ShorteningOutcome {
        /// A new mapping from the supplied slug was created.
        Shortened,
        /// A pre-existing mapping was used.
        Deduplicated {
            /// The slug of the pre-existing mapping.
            slug: Slug,
        },
    }

    /// A new slug mapping was created.
    #[ink(event)]
    pub struct Shortened {
        /// The slug of the mapping.
        slug: Slug,
        /// The URL that the slug maps to.
        url: Url,
    }

    /// A pre-existing mapping was used.
    #[ink(event)]
    pub struct Deduplicated {
        /// The slug of the mapping.
        slug: Slug,
        /// The URL that the slug maps to.
        url: Url,
    }

    impl Link {
        /// Construct a new contract and set the caller as an upgrader.
        ///
        /// The caller will be able to upgrade this contract to use any code. This requires
        /// users of the contract to trust the upgrader. Probably a multisig should be used
        /// for that reason. A truly trustless deployment should use the [`unstoppable`]
        /// constructor.
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                upgrader: Some(Self::env().caller()),
                ..Default::default()
            }
        }

        /// Construct a new contract and don't set an upgrader.
        ///
        /// This prevents the contract from being changed and hence makes it truly
        /// unstoppable.
        #[ink(constructor)]
        pub fn unstoppable() -> Self {
            Self::default()
        }

        /// Create a a new mapping or use an existing one.
        #[ink(message)]
        pub fn shorten(
            &mut self,
            slug: SlugCreationMode,
            url: Url,
        ) -> Result<ShorteningOutcome> {
            // Deduplicate if requested by the user
            let slug = match (slug, self.slugs.get(&url)) {
                (
                    SlugCreationMode::Deduplicate | SlugCreationMode::DeduplicateOrNew(_),
                    Some(slug),
                ) => {
                    self.env().emit_event(Deduplicated {
                        slug: slug.clone(),
                        url,
                    });
                    return Ok(ShorteningOutcome::Deduplicated { slug });
                }
                (SlugCreationMode::Deduplicate, None) => return Err(Error::UrlNotFound),
                (
                    SlugCreationMode::New(slug)
                    | SlugCreationMode::DeduplicateOrNew(slug),
                    _,
                ) => slug,
            };

            // No dedup: Insert new slug
            if slug.len() < MIN_SLUG_LENGTH {
                return Err(Error::SlugTooShort);
            }
            if self.urls.insert(&slug, &url).is_some() {
                return Err(Error::SlugUnavailable);
            }
            self.slugs.insert(&url, &slug);
            self.env().emit_event(Shortened { slug, url });
            Ok(ShorteningOutcome::Shortened)
        }

        /// Resolve a slug to its mapped URL.
        #[ink(message)]
        pub fn resolve(&self, slug: Slug) -> Option<Url> {
            self.urls.get(slug)
        }

        /// Change the code of this contract.
        ///
        /// This can only be called by the upgrader specified at contract construction.
        /// The code cannot be changed in case no upgrader was set because the
        /// [`unstoppable`] constructor was used.
        #[ink(message)]
        pub fn upgrade(&mut self, code_hash: Hash) -> Result<()> {
            if self
                .upgrader
                .map(|id| id != self.env().caller())
                .unwrap_or(true)
            {
                return Err(Error::UpgradeDenied);
            }
            self.env()
                .set_code_hash(&code_hash)
                .map_err(|_| Error::UpgradeFailed)
        }
    }
    #[cfg(test)]
    mod tests {
        use ink::scale::Decode;

        use super::*;

        const SLUG: &str = "https://test1slug";
        const SLUG_TO_SHORT: &str = "test";
        const URL: &str = "https://test_slug.use.ink";

        fn default_accounts(
        ) -> ink::env::test::DefaultAccounts<ink::env::DefaultEnvironment> {
            ink::env::test::default_accounts::<Environment>()
        }

        fn set_next_caller(caller: AccountId) {
            ink::env::test::set_caller::<Environment>(caller);
        }

        #[ink::test]
        fn shorten_works() {
            let default_accounts: ink::env::test::DefaultAccounts<
                ink::env::DefaultEnvironment,
            > = default_accounts();
            set_next_caller(default_accounts.alice);

            let slug = SLUG.as_bytes().to_vec();
            let url = URL.as_bytes().to_vec();

            let mut contract = Link::new();
            assert_eq!(
                contract.shorten(SlugCreationMode::New(slug.clone()), url.clone()),
                Ok(ShorteningOutcome::Shortened)
            );
            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            let event_data = Shortened::decode(&mut emitted_events[0].data.as_slice())
                .expect("event must decode");
            assert_eq!((event_data.slug, event_data.url), (slug, url));
        }

        #[ink::test]
        fn deduplicate_shorten_works() {
            let default_accounts: ink::env::test::DefaultAccounts<
                ink::env::DefaultEnvironment,
            > = default_accounts();
            set_next_caller(default_accounts.alice);

            let slug = SLUG.as_bytes().to_vec();
            let url = URL.as_bytes().to_vec();

            let mut contract = Link::new();
            assert_eq!(
                contract.shorten(SlugCreationMode::New(slug.clone()), url.clone()),
                Ok(ShorteningOutcome::Shortened)
            );

            assert_eq!(
                contract.shorten(SlugCreationMode::Deduplicate, url.clone()),
                Ok(ShorteningOutcome::Deduplicated { slug: slug.clone() })
            );

            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            let event_data = Deduplicated::decode(&mut emitted_events[1].data.as_slice())
                .expect("event must decode");
            assert_eq!((event_data.slug, event_data.url), (slug, url));
        }

        #[ink::test]
        fn deduplicate_or_new_shorten_works() {
            let default_accounts: ink::env::test::DefaultAccounts<
                ink::env::DefaultEnvironment,
            > = default_accounts();
            set_next_caller(default_accounts.alice);

            let slug = SLUG.as_bytes().to_vec();
            let url = URL.as_bytes().to_vec();

            let mut contract = Link::new();
            assert_eq!(
                contract.shorten(
                    SlugCreationMode::DeduplicateOrNew(slug.clone()),
                    url.clone()
                ),
                Ok(ShorteningOutcome::Shortened)
            );

            assert_eq!(
                contract.shorten(
                    SlugCreationMode::DeduplicateOrNew(slug.clone()),
                    url.clone()
                ),
                Ok(ShorteningOutcome::Deduplicated { slug: slug.clone() })
            );

            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            let event_data = Shortened::decode(&mut emitted_events[0].data.as_slice())
                .expect("event must decode");
            assert_eq!(
                (event_data.slug, event_data.url),
                (slug.clone(), url.clone())
            );

            let event_data = Deduplicated::decode(&mut emitted_events[1].data.as_slice())
                .expect("event must decode");
            assert_eq!((event_data.slug, event_data.url), (slug, url));
        }

        #[ink::test]
        fn invalid_shorten_should_fail() {
            let default_accounts: ink::env::test::DefaultAccounts<
                ink::env::DefaultEnvironment,
            > = default_accounts();
            set_next_caller(default_accounts.alice);

            let slug = SLUG_TO_SHORT.as_bytes().to_vec();
            let url = URL.as_bytes().to_vec();

            let mut contract = Link::new();
            assert_eq!(
                contract.shorten(SlugCreationMode::New(slug), url),
                Err(Error::SlugTooShort)
            );
        }

        #[ink::test]
        fn unduplicated_shorten_should_fail() {
            let default_accounts: ink::env::test::DefaultAccounts<
                ink::env::DefaultEnvironment,
            > = default_accounts();
            set_next_caller(default_accounts.alice);

            let url = URL.as_bytes().to_vec();

            let mut contract = Link::new();
            assert_eq!(
                contract.shorten(SlugCreationMode::Deduplicate, url),
                Err(Error::UrlNotFound)
            );
        }

        #[ink::test]
        fn resolve_works() {
            let default_accounts: ink::env::test::DefaultAccounts<
                ink::env::DefaultEnvironment,
            > = default_accounts();
            set_next_caller(default_accounts.alice);

            let slug = SLUG.as_bytes().to_vec();
            let url = URL.as_bytes().to_vec();

            let mut contract = Link::new();
            assert_eq!(
                contract.shorten(SlugCreationMode::New(slug.clone()), url.clone()),
                Ok(ShorteningOutcome::Shortened)
            );

            set_next_caller(default_accounts.bob);
            assert_eq!(contract.resolve(slug), Some(url));
        }

        #[ink::test]
        fn invalid_resolve_should_fail() {
            let default_accounts: ink::env::test::DefaultAccounts<
                ink::env::DefaultEnvironment,
            > = default_accounts();
            set_next_caller(default_accounts.alice);

            let slug = SLUG.as_bytes().to_vec();
            let url = URL.as_bytes().to_vec();

            let mut contract = Link::new();
            assert_eq!(
                contract.shorten(SlugCreationMode::New(slug.clone()), url.clone()),
                Ok(ShorteningOutcome::Shortened)
            );

            set_next_caller(default_accounts.bob);
            assert_eq!(
                contract.resolve("https://bad_slug".as_bytes().to_vec()),
                None
            );
        }

        #[ink::test]
        fn unstoppable_works() {
            let default_accounts: ink::env::test::DefaultAccounts<
                ink::env::DefaultEnvironment,
            > = default_accounts();
            set_next_caller(default_accounts.alice);
            let mut contract = Link::unstoppable();

            let code_hash = Hash::from([0x1; 32]);
            assert_eq!(contract.upgrade(code_hash), Err(Error::UpgradeDenied));
        }
    }

    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        use super::*;
        use ink_e2e::ContractsBackend;

        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        #[ink_e2e::test]
        async fn e2e_resolve<Client: E2EBackend>(mut client: Client) -> E2EResult<()> {
            let slug = "https://test1slug".as_bytes().to_vec();
            let url = "https://test_slug.use.ink".as_bytes().to_vec();

            let mut constructor = LinkRef::new();
            let link = client
                .instantiate("link", &ink_e2e::alice(), &mut constructor)
                .submit()
                .await
                .expect("instantiate failed");
            let mut call_builder = link.call_builder::<Link>();

            // when
            let shorten =
                call_builder.shorten(SlugCreationMode::New(slug.clone()), url.clone());
            let _shorten_res = client
                .call(&ink_e2e::alice(), &shorten)
                .submit()
                .await
                .expect("shorten failed");

            let resolve = call_builder.resolve(slug);
            let resolve_res = client.call(&ink_e2e::alice(), &resolve).dry_run().await?;

            // then
            assert_eq!(resolve_res.return_value(), Some(url));

            Ok(())
        }
    }
}
