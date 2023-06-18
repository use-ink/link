use crate::internal::{Error, Internal, PinkError};
use crate::traits::PinkMint;

use ink::{
    prelude::{string::String as PreludeString, vec::Vec},
    storage::Mapping,
};
use openbrush::{
    contracts::{
        access_control::{self, only_role, RoleType, DEFAULT_ADMIN_ROLE},
        psp34::extensions::{enumerable::*, metadata::*},
    },
    modifiers,
    traits::{AccountId, Storage, String},
};

pub const ADMIN: RoleType = DEFAULT_ADMIN_ROLE;
pub const MINTER: RoleType = 1;
pub const WHITELIST: RoleType = 2;

pub const STORAGE_MINTING_KEY: u32 = openbrush::storage_unique_key!(MintingData);

#[derive(Default, Debug)]
#[openbrush::upgradeable_storage(STORAGE_MINTING_KEY)]
pub struct MintingData {
    pub last_token_id: u64,
    pub max_supply: Option<u64>,
    pub limit_per_account: u32,
    pub nft_metadata: Mapping<Id, String>,
    pub whitelist: Mapping<AccountId, bool>,
    pub whitelist_enabled: bool,
    pub whitelist_count: u32,
}

impl<T> PinkMint for T
where
    T: Storage<MintingData>
        + Storage<psp34::Data<enumerable::Balances>>
        + Storage<access_control::Data>
        + Storage<metadata::Data>
        + psp34::extensions::metadata::PSP34Metadata
        + psp34::Internal,
{
    /// Mint one token to the specified account.
    #[modifiers(only_role(MINTER))]
    default fn mint(&mut self, to: AccountId, metadata: String) -> Result<Id, Error> {
        self._check_amount(1)?;
        self._check_whitelisted(to)?;
        self._check_limit(to)?;
        let minted_id = self._mint(to)?;

        self.data::<MintingData>()
            .nft_metadata
            .insert(minted_id.clone(), &metadata);

        Ok(minted_id)
    }

    /// Change metadata for the token Id.
    #[modifiers(only_role(ADMIN))]
    default fn change_metadata(&mut self, token: Id, metadata: String) -> Result<(), Error> {
        if self
            .data::<MintingData>()
            .nft_metadata
            .contains(token.clone())
        {
            self.data::<MintingData>()
                .nft_metadata
                .insert(token, &metadata);
            Ok(())
        } else {
            Err(PinkError::TokenNotFound.into())
        }
    }

    /// Set max supply of tokens.
    #[modifiers(only_role(ADMIN))]
    default fn set_max_supply(&mut self, max_supply: Option<u64>) -> Result<(), Error> {
        self.data::<MintingData>().max_supply = max_supply;
        Ok(())
    }

    /// Set max amount of tokens to be minted per account.
    #[modifiers(only_role(ADMIN))]
    default fn set_limit_per_account(&mut self, limit: u32) -> Result<(), Error> {
        self.data::<MintingData>().limit_per_account = limit;
        Ok(())
    }

    /// Get max amount of tokens to be minted per account.
    default fn limit_per_account(&self) -> u32 {
        self.data::<MintingData>().limit_per_account
    }

    /// Get max supply of tokens.
    default fn max_supply(&self) -> Option<u64> {
        self.data::<MintingData>().max_supply
    }

    /// Add an account to the whitelist.
    #[modifiers(only_role(WHITELIST))]
    default fn add_to_whitelist(&mut self, user: AccountId, enabled: bool) -> Result<(), Error> {
        if !enabled && self.data::<MintingData>().whitelist.contains(&user) {
            self.data::<MintingData>().whitelist_count -= 1;
            self.data::<MintingData>().whitelist.remove(&user);
        } else if enabled && !self.data::<MintingData>().whitelist.contains(&user) {
            self.data::<MintingData>().whitelist_count += 1;
            self.data::<MintingData>().whitelist.insert(user, &enabled);
        }
        Ok(())
    }
    /// Add an account to the whitelist.
    #[modifiers(only_role(WHITELIST))]
    default fn add_to_whitelist_many(&mut self, list: Vec<AccountId>) -> Result<(), Error> {
        for user in list {
            self.add_to_whitelist(user, true)?;
        }
        Ok(())
    }

    /// Use or not use whitelist.
    #[modifiers(only_role(ADMIN))]
    default fn enable_whitelist(&mut self, enabled: bool) -> Result<(), Error> {
        self.data::<MintingData>().whitelist_enabled = enabled;
        Ok(())
    }

    /// Check if an account is whitelisted.
    default fn is_whitelisted(&self, user: AccountId) -> bool {
        self.data::<MintingData>()
            .whitelist
            .get(&user)
            .unwrap_or(false)
    }

    /// Check if whitelist is enabled.
    default fn is_whitelist_enabled(&self) -> bool {
        self.data::<MintingData>().whitelist_enabled
    }

    /// Get number of whitelisted accounts.
    default fn whitelist_count(&self) -> u32 {
        self.data::<MintingData>().whitelist_count
    }

    /// Get URI for the token Id.
    default fn token_uri(&self, token_id: u64) -> Result<PreludeString, Error> {
        self.data::<psp34::Data<enumerable::Balances>>()
            .owner_of(Id::U64(token_id.clone()))
            .ok_or(PinkError::TokenNotFound)?;

        self._token_uri(token_id)
    }
}
