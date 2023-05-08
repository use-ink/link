#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

pub use self::pinkpsp34::{PinkPsp34, PinkPsp34Ref};

#[openbrush::contract]
pub mod pinkpsp34 {
    use ink::codegen::{EmitEvent, Env};

    use openbrush::contracts::ownable::*;
    use openbrush::contracts::psp34::extensions::burnable::*;
    use openbrush::contracts::psp34::extensions::enumerable::*;
    use openbrush::contracts::psp34::extensions::metadata::*;
    use openbrush::traits::Storage;
    use openbrush::traits::String;

    use psp34_minting::minting::*;
    use psp34_minting::traits::*;

    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct PinkPsp34 {
        #[storage_field]
        psp34: psp34::Data<enumerable::Balances>,
        #[storage_field]
        ownable: ownable::Data,
        #[storage_field]
        metadata: metadata::Data,
        #[storage_field]
        pinkmint: MintingData,
    }

    /// Event emitted when a token transfer occurs.
    #[ink(event)]
    pub struct Transfer {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
        #[ink(topic)]
        id: Id,
    }

    /// Event emitted when a token approve occurs.
    #[ink(event)]
    pub struct Approval {
        #[ink(topic)]
        from: AccountId,
        #[ink(topic)]
        to: AccountId,
        #[ink(topic)]
        id: Option<Id>,
        approved: bool,
    }

    impl PSP34 for PinkPsp34 {}
    impl PSP34Burnable for PinkPsp34 {}
    impl PSP34Enumerable for PinkPsp34 {}
    impl Ownable for PinkPsp34 {}
    impl PSP34Metadata for PinkPsp34 {}
    impl PinkMint for PinkPsp34 {}

    impl PinkPsp34 {
        #[ink(constructor)]
        pub fn new(
            name: String,
            symbol: String,
            max_supply: u64,
            owner: Option<AccountId>,
        ) -> Self {
            let mut instance = Self::default();
            let contract_owner = owner.unwrap_or(instance.env().caller());
            instance._init_with_owner(contract_owner);
            instance._set_attribute(Id::U64(0), String::from("name"), String::from(name));
            instance._set_attribute(Id::U64(0), String::from("symbol"), String::from(symbol));
            instance.pinkmint.max_supply = Some(max_supply);
            instance.pinkmint.last_token_id = 0;
            instance
        }
    }

    // Override event emission methods
    impl psp34::Internal for PinkPsp34 {
        fn _emit_transfer_event(&self, from: Option<AccountId>, to: Option<AccountId>, id: Id) {
            self.env().emit_event(Transfer { from, to, id });
        }

        fn _emit_approval_event(
            &self,
            from: AccountId,
            to: AccountId,
            id: Option<Id>,
            approved: bool,
        ) {
            self.env().emit_event(Approval {
                from,
                to,
                id,
                approved,
            });
        }
    }
    // ------------------- T E S T -----------------------------------------------------
    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::{env::test, prelude::string::String as PreludeString};
        use psp34_minting::internal::*;

        const MAX_SUPPLY: u64 = 10;
        const NAME: &str = "PinkPsp34";
        const SYMBOL: &str = "PnkP";
        const TOKEN_URI: &str = "ipfs://myIpfsUri/";
        const OWNER: [u8; 32] = [0x9; 32];

        fn init() -> PinkPsp34 {
            PinkPsp34::new(String::from(NAME), String::from(SYMBOL), MAX_SUPPLY, None)
        }

        fn init_with_owner(owner: AccountId) -> PinkPsp34 {
            PinkPsp34::new(
                String::from(NAME),
                String::from(SYMBOL),
                MAX_SUPPLY,
                Some(owner),
            )
        }

        #[ink::test]
        fn init_new_works() {
            let pink34 = init();
            assert_eq!(
                pink34.get_attribute(Id::U64(0), String::from("name")),
                Some(String::from(NAME))
            );
            assert_eq!(
                pink34.get_attribute(Id::U64(0), String::from("symbol")),
                Some(String::from(SYMBOL))
            );
            assert_eq!(pink34.max_supply(), Some(MAX_SUPPLY));
        }

        #[ink::test]
        fn init_with_owner_works() {
            let maybe_owner: AccountId = AccountId::from(OWNER);
            let mut pink34 = init_with_owner(maybe_owner);
            let accounts = default_accounts();
            let token_uri = String::from(TOKEN_URI);

            // New owner should be set during instantiation
            assert_eq!(pink34.owner(), maybe_owner);

            // Should fail. Only maybe_owner can mint
            set_sender(accounts.alice);
            assert_eq!(
                pink34.mint(accounts.bob, token_uri.clone()),
                Err(Error::Ownable(OwnableError::CallerIsNotOwner))
            );
            assert_eq!(pink34.total_supply(), 0);

            // New owner mints for Bob works
            set_sender(maybe_owner);
            assert_eq!(pink34.mint(accounts.bob, token_uri), Ok(Id::U64(1)));
            assert_eq!(
                pink34.owners_token_by_index(accounts.bob, 0),
                Ok(Id::U64(1))
            );
            assert_eq!(pink34.total_supply(), 1);
        }

        #[ink::test]
        fn pinkmint_works() {
            let mut pink34 = init();
            let accounts = default_accounts();
            let token_uri = String::from(TOKEN_URI);
            assert_eq!(pink34.owner(), accounts.alice);

            // Should fail. Only owner can mint
            set_sender(accounts.bob);
            assert_eq!(
                pink34.mint(accounts.bob, token_uri.clone()),
                Err(Error::Ownable(OwnableError::CallerIsNotOwner))
            );
            assert_eq!(pink34.total_supply(), 0);

            // Owner mints for Bob works
            set_sender(accounts.alice);
            assert_eq!(pink34.mint(accounts.bob, token_uri), Ok(Id::U64(1)));

            // Check all the minting events
            assert_eq!(pink34.total_supply(), 1);
            assert_eq!(pink34.owner_of(Id::U64(1)), Some(accounts.bob));
            assert_eq!(pink34.balance_of(accounts.bob), 1);
            assert_eq!(
                pink34.owners_token_by_index(accounts.bob, 0),
                Ok(Id::U64(1))
            );
            assert_eq!(1, ink::env::test::recorded_events().count());
            assert_eq!(pink34.pinkmint.last_token_id, 1);
        }

        #[ink::test]
        fn change_owner_works() {
            let mut pink34 = init();
            let accounts = default_accounts();
            let token_uri = String::from(TOKEN_URI);
            assert_eq!(pink34.owner(), accounts.alice);

            // change owner to Bob
            set_sender(accounts.alice);
            assert_eq!(pink34.transfer_ownership(accounts.bob), Ok(()));
            assert_eq!(pink34.owner(), accounts.bob);

            // Bob is now the owner and can mint
            set_sender(accounts.bob);
            assert_eq!(pink34.mint(accounts.bob, token_uri.clone()), Ok(Id::U64(1)));

            // Should fail. Only owner can mint
            set_sender(accounts.alice);
            assert_eq!(
                pink34.mint(accounts.alice, token_uri),
                Err(Error::Ownable(OwnableError::CallerIsNotOwner))
            );
        }

        #[ink::test]
        fn token_uri_works() {
            let mut pink34 = init();
            let accounts = default_accounts();
            let token_uri = String::from(TOKEN_URI);

            // Owner mints for Bob works
            set_sender(accounts.alice);
            assert_eq!(pink34.mint(accounts.bob, token_uri), Ok(Id::U64(1)));

            // return error if request is for not yet minted token
            assert_eq!(
                pink34.token_uri(42),
                Err(Error::Pink(PinkError::TokenNotFound))
            );
            assert_eq!(
                pink34.token_uri(1),
                Ok(PreludeString::from(TOKEN_URI.to_owned()))
            );
        }

        fn default_accounts() -> test::DefaultAccounts<ink::env::DefaultEnvironment> {
            test::default_accounts::<Environment>()
        }

        fn set_sender(sender: AccountId) {
            ink::env::test::set_caller::<Environment>(sender);
        }
    }
}
