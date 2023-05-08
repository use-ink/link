//! Pink minting traits

use crate::internal::Error;
use ink::prelude::string::String as PreludeString;

use openbrush::{
    contracts::psp34::extensions::enumerable::*,
    traits::{AccountId, String},
};

#[openbrush::wrapper]
pub type PinkMintRef = dyn PinkMint;

/// Trait definitions for core PinkMint functions
#[openbrush::trait_definition]
pub trait PinkMint {
    /// Mint one or more tokens.
    #[ink(message)]
    fn mint(&mut self, to: AccountId, metadata: String) -> Result<Id, Error>;

    /// Get max supply of tokens.
    #[ink(message)]
    fn max_supply(&self) -> Option<u64>;

    /// Get URI for the token Id.
    #[ink(message)]
    fn token_uri(&self, token_id: u64) -> Result<PreludeString, Error>;
}
