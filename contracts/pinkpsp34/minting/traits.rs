//! Pink minting traits

use crate::internal::Error;
use ink::prelude::{string::String as PreludeString, vec::Vec};

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

    /// Change metadata for the token Id.
    #[ink(message)]
    fn change_metadata(&mut self, token: Id, metadata: String) -> Result<(), Error>;

    /// Set max supply of tokens.
    #[ink(message)]
    fn set_max_supply(&mut self, max_supply: Option<u64>) -> Result<(), Error>;

    /// Set max amount of tokens to be minted per account.
    #[ink(message)]
    fn set_limit_per_account(&mut self, limit: u32) -> Result<(), Error>;

    /// Get max amount of tokens to be minted per account.
    #[ink(message)]
    fn limit_per_account(&self) -> u32;

    /// Add an account to the whitelist.
    #[ink(message)]
    fn add_to_whitelist(&mut self, user: AccountId, enabled: bool) -> Result<(), Error>;

    /// Add list of accounts to the whitelist.
    #[ink(message)]
    fn add_to_whitelist_many(&mut self, list: Vec<AccountId>) -> Result<(), Error>;

    /// Use or not use whitelist.
    #[ink(message)]
    fn enable_whitelist(&mut self, enabled: bool) -> Result<(), Error>;

    /// Check if an account is whitelisted.
    #[ink(message)]
    fn is_whitelisted(&self, user: AccountId) -> bool;

    /// Check if whitelist is enabled.
    #[ink(message)]
    fn is_whitelist_enabled(&self) -> bool;

    /// Get number of whitelisted accounts.
    #[ink(message)]
    fn whitelist_count(&self) -> u32;

    /// Get max supply of tokens.
    #[ink(message)]
    fn max_supply(&self) -> Option<u64>;

    /// Get URI for the token Id.
    #[ink(message)]
    fn token_uri(&self, token_id: u64) -> Result<PreludeString, Error>;
}
