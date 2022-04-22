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
    use ink_storage::{Mapping, traits::SpreadAllocate};
    use ink_prelude::vec::Vec;

    #[ink(storage)]
    #[derive(SpreadAllocate)]
    pub struct Link {
        /// Slug -> URL
        urls: Mapping<Vec<u8>, Vec<u8>>,
        /// URL -> Slug
        slugs: Mapping<Vec<u8>, Vec<u8>>,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(::scale_info::TypeInfo))]
    pub enum Error {
        /// The slug is already in use for another URL.
        SlugUnavailable(Vec<u8>),
    }

    #[ink(event)]
    pub struct Shortened {
        slug: Vec<u8>,
        url: Vec<u8>,
    }

    #[ink(event)]
    pub struct SlugUnavailable {
        slug: Vec<u8>,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(::scale_info::TypeInfo))]
    pub enum Error {
        SlugUnavailable(Vec<u8>),
    }

    impl Link {
        #[ink(constructor)]
        pub fn default() -> Self {
            ink_lang::utils::initialize_contract(|_contract: &mut Self| {})
        }

        #[ink(message)]
        pub fn shorten(&mut self, slug: Vec<u8>, url: Vec<u8>) {
            if let Some(_) = self.urls.get(&slug) {
                self.env().emit_event(SlugUnavailable { slug });
                return
            }

            let slug = if let Some(slug) = self.slugs.get(&url) {
                slug
            } else {
                self.urls.insert(&slug, &url);
                self.slugs.insert(&url, &slug);
                slug
            };

            self.env().emit_event(Shortened { slug, url });
        }

        #[ink(message)]
        pub fn resolve(&self, slug: Vec<u8>) -> Option<Vec<u8>> {
            self.urls.get(slug)
        }
    }
}
