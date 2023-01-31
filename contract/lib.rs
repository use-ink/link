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

use ink_lang as ink;

#[ink::contract]
mod link {
    use ink_prelude::vec::Vec;
    use ink_storage::{traits::SpreadAllocate, Mapping};

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
    #[derive(SpreadAllocate)]
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
    #[cfg_attr(feature = "std", derive(::scale_info::TypeInfo))]
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
    #[cfg_attr(feature = "std", derive(::scale_info::TypeInfo))]
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
    #[cfg_attr(feature = "std", derive(::scale_info::TypeInfo))]
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
            ink_lang::utils::initialize_contract(|contract: &mut Self| {
                contract.upgrader = Some(contract.env().caller());
            })
        }

        /// Construct a new contract and don't set an upgrader.
        ///
        /// This prevents the contract from being changed and hence makes it truly
        /// unstoppable.
        #[ink(constructor)]
        pub fn unstoppable() -> Self {
            ink_lang::utils::initialize_contract(|contract: &mut Self| {
                contract.upgrader = None;
            })
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
            if self.urls.insert_return_size(&slug, &url).is_some() {
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
            ink_env::set_code_hash(&code_hash).map_err(|_| Error::UpgradeFailed)
        }
    }
}
