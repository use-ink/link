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
    use ink_storage::{
        traits::SpreadAllocate,
        Mapping,
    };

    const MIN_SLUG_LENGTH: usize = 5;

    type Result<T> = core::result::Result<T, Error>;
    type Url = Vec<u8>;
    type Slug = Vec<u8>;

    #[ink(storage)]
    #[derive(SpreadAllocate)]
    pub struct Link {
        /// Slug -> URL
        urls: Mapping<Slug, Url>,
        /// URL -> Slug
        slugs: Mapping<Url, Slug>,
        /// The account that is allowed to upgrade this contract.
        upgrader: AccountId,
    }

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
        /// The upgrade of the contract failed.
        UpgradeFailed,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(::scale_info::TypeInfo))]
    pub enum SlugCreationMode {
        New(Slug),
        DeduplicateOrNew(Slug),
        Deduplicate,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(::scale_info::TypeInfo))]
    pub enum ShorteningOutcome {
        Shortened,
        Deduplicated { slug: Slug },
    }

    #[ink(event)]
    pub struct Shortened {
        slug: Slug,
        url: Url,
    }

    #[ink(event)]
    pub struct Deduplicated {
        slug: Slug,
        url: Url,
    }

    impl Link {
        #[ink(constructor)]
        pub fn default() -> Self {
            ink_lang::utils::initialize_contract(|contract: &mut Self| {
                contract.upgrader = contract.env().caller();
            })
        }

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
                    return Ok(ShorteningOutcome::Deduplicated { slug })
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
                return Err(Error::SlugTooShort)
            }
            if let Some(_) = self.urls.get(&slug) {
                return Err(Error::SlugUnavailable)
            }
            self.urls.insert(&slug, &url);
            self.slugs.insert(&url, &slug);
            self.env().emit_event(Shortened { slug, url });
            Ok(ShorteningOutcome::Shortened)
        }

        #[ink(message)]
        pub fn resolve(&self, slug: Slug) -> Option<Url> {
            self.urls.get(slug)
        }

        #[ink(message)]
        pub fn upgrade(&mut self, code_hash: [u8; 32]) -> Result<()> {
            if self.env().caller() != self.upgrader {
                return Err(Error::UpgradeDenied)
            }
            ink_env::set_code_hash(&code_hash).map_err(|_| Error::UpgradeFailed)
        }
    }
}
