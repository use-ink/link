#![cfg_attr(not(feature = "std"), no_std, no_main)]
#![feature(min_specialization)]

pub use self::pinkpsp34::PinkPsp34Ref;
#[openbrush::contract]
pub mod pinkpsp34 {
    use ink::codegen::{EmitEvent, Env};
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;

    use openbrush::contracts::psp34;
    use openbrush::contracts::{
        access_control::*,
        psp34::extensions::{burnable::*, enumerable::*, metadata::*},
    };

    use openbrush::traits::{Storage, String};

    use psp34_minting::minting::*;
    use psp34_minting::traits::*;

    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct PinkPsp34 {
        #[storage_field]
        psp34: psp34::Data<enumerable::Balances>,
        #[storage_field]
        access: access_control::Data,
        #[storage_field]
        metadata: metadata::Data,
        #[storage_field]
        pinkmint: MintingData,
        holders: Mapping<AccountId, Vec<Id>>,
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
    impl AccessControl for PinkPsp34 {}
    impl PSP34Metadata for PinkPsp34 {}
    impl PinkMint for PinkPsp34 {}

    impl PinkPsp34 {
        #[ink(constructor)]
        pub fn new(name: String, symbol: String, max_supply: u64) -> Self {
            let mut instance = Self::default();
            let contract_owner = instance.env().caller();
            instance._init_with_admin(contract_owner);
            instance._set_attribute(Id::U64(0), String::from("name"), String::from(name));
            instance._set_attribute(Id::U64(0), String::from("symbol"), String::from(symbol));
            instance.pinkmint.max_supply = Some(max_supply);
            instance.pinkmint.limit_per_account = 2;
            instance
        }

        #[ink(message)]
        pub fn total_balance(&self, holder: AccountId) -> Vec<Id> {
            self.holders.get(&holder).unwrap_or(Vec::new())
        }

        /// Modifies the code which is used to execute calls to this contract address (`AccountId`).
        ///
        /// We use this to upgrade the contract logic. We don't do any authorization here, any caller
        /// can execute this method. In a production contract you would do some authorization here.
        #[ink(message)]
        pub fn set_code(&mut self, code_hash: [u8; 32]) {
            ink::env::set_code_hash(&code_hash).unwrap_or_else(|err| {
                panic!(
                    "Failed to `set_code_hash` to {:?} due to {:?}",
                    code_hash, err
                )
            });
            ink::env::debug_println!("Switched code hash to {:?}.", code_hash);
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

    // Override transfer
    impl psp34::Transfer for PinkPsp34 {
        fn _before_token_transfer(
            &mut self,
            from: Option<&AccountId>,
            to: Option<&AccountId>,
            id: &Id,
        ) -> Result<(), PSP34Error> {
            if from.is_some() {
                // Transfer or burning. Remove from `from`
                let current_owner =
                    from.ok_or(PSP34Error::Custom(String::from("ErrorUnwrappingFrom")))?;
                let mut holder_vec = self.holders.get(current_owner).unwrap_or(Vec::new());
                let index = holder_vec
                    .iter()
                    .position(|a| *a == *id)
                    .ok_or(PSP34Error::Custom(String::from("ErrorUnwrappingHolderVec")))?;
                holder_vec.remove(index);
                self.holders.insert(current_owner, &holder_vec);
            }

            if to.is_some() {
                // Mint or Transfer. Add to `to`
                let destination =
                    to.ok_or(PSP34Error::Custom(String::from("ErrorUnwrappingTo")))?;
                let mut holder_vec = self.holders.get(destination).unwrap_or(Vec::new());
                holder_vec.push(id.clone());
                self.holders.insert(destination, &holder_vec);
            }

            Ok(())
        }
    }

    // ------------------- T E S T -----------------------------------------------------
    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::{env::test, prelude::string::String as PreludeString};
        use psp34_minting::internal::*;
        use psp34_minting::traits::PinkMint;

        const MAX_SUPPLY: u64 = 10;
        const NAME: &str = "PinkPsp34";
        const SYMBOL: &str = "PnkP";
        const TOKEN_URI: &str = "ipfs://myIpfsUri/";

        fn init() -> PinkPsp34 {
            let accounts = default_accounts();
            let mut pink34 = PinkPsp34::new(String::from(NAME), String::from(SYMBOL), MAX_SUPPLY);
            _ = pink34.grant_role(MINTER, accounts.alice);
            pink34
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
        fn pinkmint_works() {
            let mut pink34 = init();
            let accounts = default_accounts();
            let token_uri = String::from(TOKEN_URI);

            // Should fail. Only owner can mint
            set_sender(accounts.bob);
            assert_eq!(
                pink34.mint(accounts.bob, token_uri.clone()),
                Err(AccessControlError::MissingRole.into())
            );
            assert_eq!(pink34.total_supply(), 0);

            // Owner mints for Bob works
            set_sender(accounts.alice);
            assert_eq!(pink34.set_limit_per_account(1), Ok(()));
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
        fn change_metadata_works() {
            let mut pink34 = init();
            let accounts = default_accounts();
            let token_uri = String::from(TOKEN_URI);
            const TOKEN_NEW: &str = "new";
            let token_new = String::from(TOKEN_NEW);

            // Should fail. Only owner can change metadata
            set_sender(accounts.bob);
            assert_eq!(
                pink34.change_metadata(Id::U64(1), token_uri.clone()),
                Err(AccessControlError::MissingRole.into())
            );

            // Owner changes metadata
            set_sender(accounts.alice);
            assert_eq!(pink34.set_limit_per_account(1), Ok(()));
            assert_eq!(pink34.mint(accounts.bob, token_uri.clone()), Ok(Id::U64(1)));
            assert_eq!(
                pink34.change_metadata(Id::U64(1), token_new.clone()),
                Ok(())
            );
            assert_eq!(
                pink34.change_metadata(Id::U64(42), token_new.clone()),
                Err(Error::Pink(PinkError::TokenNotFound))
            );
            assert_eq!(pink34.token_uri(1), Ok(PreludeString::from(TOKEN_NEW)));
        }

        #[ink::test]
        fn access_control_works() {
            let mut pink34 = init();
            let accounts = default_accounts();
            let token_uri = String::from(TOKEN_URI);

            // Owner mints for Bob works
            set_sender(accounts.alice);
            assert_eq!(pink34.set_limit_per_account(1), Ok(()));
            assert_eq!(pink34.mint(accounts.bob, token_uri.clone()), Ok(Id::U64(1)));

            // Should fail. Only owner can mint
            set_sender(accounts.bob);
            assert_eq!(
                pink34.mint(accounts.bob, token_uri.clone()),
                Err(AccessControlError::MissingRole.into())
            );
            assert_eq!(pink34.total_supply(), 1);

            // Owner mints for Bob works
            set_sender(accounts.alice);
            assert_eq!(pink34.set_limit_per_account(2), Ok(()));
            assert_eq!(pink34.mint(accounts.bob, token_uri.clone()), Ok(Id::U64(2)));
            assert_eq!(pink34.total_supply(), 2);

            // Charlie is contributor and can mint
            assert_eq!(pink34.set_limit_per_account(2), Ok(()));
            set_sender(accounts.charlie);
            assert_eq!(
                pink34.mint(accounts.charlie, token_uri.clone()),
                Err(AccessControlError::MissingRole.into())
            );
            // Alice gives Minter role to Charlie
            set_sender(accounts.alice);
            assert!(pink34.grant_role(MINTER, accounts.charlie).is_ok());
            assert_eq!(pink34.mint(accounts.charlie, token_uri), Ok(Id::U64(3)));
        }

        #[ink::test]
        fn total_balance_works() {
            let mut pink34 = init();
            let accounts = default_accounts();
            let token_uri = String::from(TOKEN_URI);

            // Owner mints two for Bob
            set_sender(accounts.alice);
            assert_eq!(pink34.set_limit_per_account(2), Ok(()));
            assert_eq!(pink34.mint(accounts.bob, token_uri.clone()), Ok(Id::U64(1)));
            assert_eq!(pink34.total_balance(accounts.bob), vec![Id::U64(1)]);
            assert_eq!(pink34.mint(accounts.bob, token_uri), Ok(Id::U64(2)));
            assert_eq!(
                pink34.total_balance(accounts.bob),
                vec![Id::U64(1), Id::U64(2)]
            );

            // Bob transfers one to Charlie
            set_sender(accounts.bob);
            assert_eq!(
                pink34.transfer(accounts.charlie, Id::U64(1), vec![]),
                Ok(())
            );
            assert_eq!(pink34.total_balance(accounts.bob), vec![Id::U64(2)]);
            assert_eq!(pink34.total_balance(accounts.charlie), vec![Id::U64(1)]);

            // Bob burns last one
            assert_eq!(pink34.burn(accounts.bob, Id::U64(2)), Ok(()));
            assert_eq!(pink34.total_balance(accounts.bob), vec![]);
            assert_eq!(pink34.balance_of(accounts.bob), 0);
        }

        #[ink::test]
        fn set_max_supply_works() {
            let mut pink34 = init();
            let accounts = default_accounts();

            // Bob fails to change max supply
            set_sender(accounts.bob);
            assert_eq!(
                pink34.set_max_supply(Some(320)),
                Err(AccessControlError::MissingRole.into())
            );

            // Alice changes max supply
            set_sender(accounts.alice);
            assert_eq!(pink34.set_max_supply(Some(321)), Ok(()));
            assert_eq!(pink34.max_supply(), Some(321));
        }

        #[ink::test]
        fn set_limit_per_account_works() {
            let mut pink34 = init();
            let accounts = default_accounts();

            // Bob fails to change limit
            set_sender(accounts.bob);
            assert_eq!(
                pink34.set_limit_per_account(42),
                Err(AccessControlError::MissingRole.into())
            );

            // Alice changes max supply
            set_sender(accounts.alice);
            assert_eq!(pink34.set_limit_per_account(42), Ok(()));
            assert_eq!(pink34.limit_per_account(), 42);

            // Alice mints fails to mint over limit for Bob
            assert_eq!(pink34.set_limit_per_account(2), Ok(()));
            assert!(pink34.mint(accounts.bob, String::from(TOKEN_URI)).is_ok());
            assert!(pink34.mint(accounts.bob, String::from(TOKEN_URI)).is_ok());
            assert_eq!(
                pink34.mint(accounts.bob, String::from(TOKEN_URI)),
                Err(Error::Pink(PinkError::MintingLimit))
            );
        }

        #[ink::test]
        fn whitelisting_works() {
            let mut pink34 = init();
            let accounts = default_accounts();
            let token_uri = String::from(TOKEN_URI);

            // Bob fails to add to whitelist
            set_sender(accounts.bob);
            assert_eq!(
                pink34.add_to_whitelist(accounts.bob, true),
                Err(AccessControlError::MissingRole.into())
            );

            // Alice is ADMIN and she enables whitelist
            set_sender(accounts.alice);
            assert!(pink34.enable_whitelist(true).is_ok());
            assert_eq!(pink34.is_whitelist_enabled(), true);

            // Add Charlie to have WHITELIST role
            assert!(pink34.grant_role(WHITELIST, accounts.charlie).is_ok());

            // Charlie adds Bob to whitelist
            set_sender(accounts.charlie);
            assert_eq!(pink34.add_to_whitelist(accounts.bob, true), Ok(()));
            assert_eq!(pink34.is_whitelisted(accounts.bob), true);
            assert_eq!(pink34.whitelist_count(), 1);

            // Alice mints for Bob works. Bob is on whitelist
            set_sender(accounts.alice);
            assert_eq!(pink34.set_limit_per_account(1), Ok(()));
            assert_eq!(pink34.mint(accounts.bob, token_uri), Ok(Id::U64(1)));

            // Alice mint for Django fails. Django is not on whitelist.
            assert_eq!(
                pink34.mint(accounts.django, String::from(TOKEN_URI)),
                Err(Error::Pink(PinkError::NotWhitelisted))
            );

            // Charlie removes Bob from whitelist
            set_sender(accounts.charlie);
            assert_eq!(pink34.add_to_whitelist(accounts.bob, false), Ok(()));
            assert_eq!(pink34.is_whitelisted(accounts.bob), false);
            assert_eq!(pink34.whitelist_count(), 0);

            // Charlie adds list of accounts to whitelist
            set_sender(accounts.charlie);
            assert_eq!(
                pink34.add_to_whitelist_many(vec![accounts.eve, accounts.frank]),
                Ok(())
            );
            assert_eq!(pink34.whitelist_count(), 2);

            // Alice mints for Bob fails. Bob is removed from whitelist.
            set_sender(accounts.alice);
            assert_eq!(
                pink34.mint(accounts.bob, String::from(TOKEN_URI)),
                Err(Error::Pink(PinkError::NotWhitelisted))
            );

            // Disable whitelist and mint for Bob works
            assert!(pink34.enable_whitelist(false).is_ok());
            assert_eq!(pink34.set_limit_per_account(2), Ok(()));
            assert_eq!(
                pink34.mint(accounts.bob, String::from(TOKEN_URI)),
                Ok(Id::U64(2))
            );
        }

        #[ink::test]
        fn token_uri_works() {
            let mut pink34 = init();
            let accounts = default_accounts();
            let token_uri = String::from(TOKEN_URI);

            // Owner mints for Bob works
            set_sender(accounts.alice);
            assert_eq!(pink34.set_limit_per_account(1), Ok(()));
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
