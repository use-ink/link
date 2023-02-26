// Copyright 2018-2022 Parity Technologies (UK) Ltd.
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

#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract]
mod link {

    use ink::{prelude::vec::Vec, storage::Mapping};

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
    pub struct Link {
        /// Needed in order to resolve slugs to URLs.
        urls: Mapping<Slug, Url>,
        /// Needed in order to de-duplicate URLs when shortening.
        slugs: Mapping<Url, Slug>,
        /// The account that is allowed to upgrade this contract.
        upgrader: Option<AccountId>,
    }

    /// The error type used for all messages.
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(
        feature = "std",
        derive(::scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
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
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(
        feature = "std",
        derive(::scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum SlugCreationMode {
        /// Always create a new slug even if the URL was already shortened.
        New(Slug),
        /// Only use the supplied slug in case the URL wasn't shortened before.
        DeduplicateOrNew(Slug),
        /// Never create a new slug. Fail if the URL wasn't shortened before.
        Deduplicate,
    }

    /// Specifies the outcome of a [`shorten`] message.
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(
        feature = "std",
        derive(::scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
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
        pub fn default() -> Self {
            let caller = Self::env().caller();
            Self {
                urls: Mapping::default(),
                slugs: Mapping::default(),
                upgrader: Some(caller),
            }
        }

        /// Construct a new contract and don't set an upgrader.
        ///
        /// This prevents the contract from being changed and hence makes it truly
        /// unstoppable.
        #[ink(constructor)]
        pub fn unstoppable() -> Self {
            Self {
                urls: Mapping::default(),
                slugs: Mapping::default(),
                upgrader: None,
            }
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
        pub fn upgrade(&mut self, code_hash: [u8; 32]) -> Result<()> {
            if self
                .upgrader
                .map(|id| id != self.env().caller())
                .unwrap_or(true)
            {
                return Err(Error::UpgradeDenied);
            }
            ink::env::set_code_hash(&code_hash).map_err(|_| Error::UpgradeFailed)
        }

        /// Get contract account owner
        #[ink(message)]
        pub fn contract_owner(&self) -> Option<AccountId> {
            self.upgrader
        }
    }

    /// This is how you'd write end-to-end (E2E) or integration tests for ink! contracts.
    ///
    /// When running these you need to make sure that you:
    /// - Compile the tests with the `e2e-tests` feature flag enabled (`--features e2e-tests`)
    /// - Are running a Substrate node which contains `pallet-contracts` in the background
    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        /// Imports all the definations from the outer scope so we can use theme here.
        use super::*;

        /// A helper function used for calling contract message
        use ink_e2e::build_message;

        /// The End-to-End test `Result` type.
        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        /// We test that we can upload and instantiate the contract using its default constructor.
        #[ink_e2e::test]
        async fn default_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            // Given
            let constructor = LinkRef::default();

            // When
            let contract_account_id = client
                .instantiate("link", &ink_e2e::alice(), constructor, 0, None)
                .await
                .expect("instantiate failed")
                .account_id;

            // Then
            let get_owner = build_message::<LinkRef>(contract_account_id.clone())
                .call(|contract| contract.contract_owner());
            let get_owner_result = client
                .call_dry_run(&ink_e2e::alice(), &get_owner, 0, None)
                .await;

            // Check the owner
            assert_eq!(
                get_owner_result.return_value(),
                Some(ink_e2e::account_id(ink_e2e::AccountKeyring::Alice))
            );

            Ok(())
        }

        #[ink_e2e::test]
        async fn unstoppable_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            // Given
            let constructor = LinkRef::unstoppable();

            // When
            let contract_account_id = client
                .instantiate("link", &ink_e2e::alice(), constructor, 0, None)
                .await
                .expect("instantiate failed")
                .account_id;

            // Then
            let get_owner = build_message::<LinkRef>(contract_account_id.clone())
                .call(|contract| contract.contract_owner());
            let get_owner_result = client
                .call_dry_run(&ink_e2e::alice(), &get_owner, 0, None)
                .await;

            // Check the owner
            assert_eq!(get_owner_result.return_value(), None,);

            Ok(())
        }

        #[ink_e2e::test]
        async fn shorten_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            // Given
            let constructor = LinkRef::default();

            // When
            let contract_account_id = client
                .instantiate("link", &ink_e2e::alice(), constructor, 0, None)
                .await
                .expect("instantiate failed")
                .account_id;

            // Given
            let new_slug = "new shorten".to_string();
            let new_url = "https://docs.imperva.com/bundle/on-premises-knowledgebase-reference-guide/page/abnormally_long_url.htm";

            let create_shorten = build_message::<LinkRef>(contract_account_id.clone())
                .call(|contract| {
                    contract.shorten(
                        SlugCreationMode::New(new_slug.clone().into()),
                        new_url.into(),
                    )
                });
            let _ = client
                .call(&ink_e2e::alice(), create_shorten, 0, None)
                .await
                .expect("create shorten failed");

            // Then
            let get_resolve = build_message::<LinkRef>(contract_account_id.clone())
                .call(|contract| contract.resolve(new_slug.clone().into()));

            let get_resolve_result = client
                .call_dry_run(&ink_e2e::alice(), &get_resolve, 0, None)
                .await;

            // Resolve a slug to its mapped URL
            assert_eq!(get_resolve_result.return_value(), Some(new_url.into()));

            Ok(())
        }
    }
}
