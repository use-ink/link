use crate::minting::MintingData;

use ink::prelude::string::String as PreludeString;

use openbrush::{
    contracts::{ownable::*, psp34::extensions::enumerable::*},
    traits::{AccountId, Storage},
};

#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum Error {
    Pink(PinkError),
    Ownable(OwnableError),
}

#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum PinkError {
    CannotMintZeroTokens,
    CollectionIsFull,
    UriNotFound,
    TokenExists,
    TokenNotFound,
}

impl From<OwnableError> for Error {
    fn from(err: OwnableError) -> Self {
        Self::Ownable(err)
    }
}

impl From<PinkError> for Error {
    fn from(err: PinkError) -> Self {
        Self::Pink(err)
    }
}
/// Trait definitions for Minting internal functions.
pub trait Internal {
    /// Check amount of tokens to be minted.
    fn _check_amount(&self, mint_amount: u64) -> Result<(), Error>;

    /// Mint next token to specified account
    fn _mint(&mut self, to: AccountId) -> Result<Id, Error>;

    /// Get URI for the token Id.
    fn _token_uri(&self, token_id: u64) -> Result<PreludeString, Error>;
}

/// Helper trait for Minting
impl<T> Internal for T
where
    T: Storage<MintingData> + psp34::Internal + Storage<psp34::Data<enumerable::Balances>>,
{
    /// Check amount of tokens to be minted
    default fn _check_amount(&self, mint_amount: u64) -> Result<(), Error> {
        if mint_amount == 0 {
            return Err(PinkError::CannotMintZeroTokens.into());
        }
        if let Some(amount) = self
            .data::<MintingData>()
            .last_token_id
            .checked_add(mint_amount)
        {
            return match self.data::<MintingData>().max_supply {
                Some(max_supply) if amount <= max_supply => Ok(()),
                Some(0) | None => Ok(()),
                _ => Err(PinkError::CollectionIsFull.into()),
            };
        }

        Err(PinkError::CollectionIsFull.into())
    }

    /// Mint next token to specified account
    default fn _mint(&mut self, to: AccountId) -> Result<Id, Error> {
        let token_id = self
            .data::<MintingData>()
            .last_token_id
            .checked_add(1)
            .ok_or(PinkError::CollectionIsFull)?;

        self._mint_to(to, Id::U64(token_id))
            .map_err(|_| PinkError::TokenExists)?;

        self.data::<MintingData>().last_token_id = token_id;

        Ok(Id::U64(token_id))
    }

    /// Get URI for the token Id.
    default fn _token_uri(&self, token_id: u64) -> Result<PreludeString, Error> {
        self.data::<MintingData>()
            .nft_metadata
            .get(Id::U64(token_id))
            .and_then(|token_uri| PreludeString::from_utf8(token_uri).ok())
            .ok_or(PinkError::UriNotFound.into())
    }
}
