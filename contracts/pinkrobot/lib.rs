#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract]
mod pinkrobot {

    use crate::ensure;
    use ink::env::{
        call::{build_call, ExecutionInput, Selector},
        DefaultEnvironment,
    };

    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;
    // use ink::env::Result as EnvResult;
    // use ink::MessageResult;
    // type ContractResult = core::result::Result<(), ()>;

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        NotOwner,
        FailedToGetContract,
        FailedToCallContract,
        BadMintingFee,
        FailedToWithdraw,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    /// `Id` represents the identifier of the NFT. `Id::U8(1)` and `Id::U16(1)` are two different identifiers.
    #[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Clone, scale::Encode, scale::Decode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum Id {
        U8(u8),
        U16(u16),
        U32(u32),
        U64(u64),
        U128(u128),
        Bytes(Vec<u8>),
    }

    #[ink(storage)]
    pub struct Pinkrobot {
        /// Contract owner
        owner: AccountId,
        /// Mapping of contract id to contract address
        contracts_map: Mapping<u8, AccountId>,
        /// Minting price
        price: Balance,
    }

    impl Pinkrobot {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                owner: Self::env().caller(),
                contracts_map: Mapping::default(),
                price: 0,
            }
        }

        #[ink(message)]
        pub fn add_new_contract(&mut self, contract_index: u8, contract: AccountId) -> Result<()> {
            ensure!(self.env().caller() == self.owner, Error::NotOwner);
            ensure_valid_contract(contract)?;
            self.contracts_map.insert(&contract_index, &contract);
            Ok(())
        }

        #[ink(message)]
        pub fn set_price(&mut self, price: Balance) -> Result<()> {
            ensure!(self.env().caller() == self.owner, Error::NotOwner);
            self.price = price;
            Ok(())
        }

        #[ink(message)]
        pub fn get_price(&self) -> Balance {
            self.price
        }

        #[ink(message, payable)]
        pub fn pink_mint(&mut self, contract_index: u8, metadata: Vec<u8>) -> Result<()> {
            let caller = self.env().caller();
            ensure!(
                self.price == self.env().transferred_value(),
                Error::BadMintingFee
            );
            let contract = self
                .contracts_map
                .get(&contract_index)
                .ok_or(Error::FailedToGetContract)?;

            ink::env::debug_println!(
                "PinkMint::mint selector: {:x?}",
                ink::selector_bytes!("PinkMint::mint")
            );

            let _mint_result = build_call::<DefaultEnvironment>()
                .call(contract)
                .gas_limit(5000000000)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("PinkMint::mint")))
                        .push_arg(caller)
                        .push_arg(metadata),
                )
                .returns::<()>()
                .try_invoke();

            // self.process_result(_mint_result)
            ink::env::debug_println!("pink_mint_result: {:?}", _mint_result);
            Ok(())
        }

        // fn process_result(result:  ) -> Result<()> {
        //     match result {
        //         Ok(id) =>
        //         {
        //             ink::env::debug_println!("mint_result: {:?}", result);
        //             return Ok(id);
        //         }
        //         Err(err) => Err(Error::InkError(err)),
        //     }
        // }

        /// Simply returns the current value of our `bool`.
        #[ink(message)]
        pub fn get_contract(&self, contract_index: u8) -> Option<AccountId> {
            self.contracts_map.get(&contract_index)
        }

        /// Returns the current owner of the lottery
        #[ink(message)]
        pub fn owner(&self) -> AccountId {
            self.owner
        }

        /// Withdraws funds to contract owner
        #[ink(message)]
        pub fn withdraw(&mut self) -> Result<()> {
            ensure!(self.env().caller() == self.owner, Error::NotOwner);
            let balance = Self::env().balance();
            let current_balance = balance
                .checked_sub(Self::env().minimum_balance())
                .unwrap_or_default();
            Self::env()
                .transfer(self.owner, current_balance)
                .map_err(|_| Error::FailedToWithdraw)?;
            Ok(())
        }
    }

    fn ensure_valid_contract(_contract: AccountId) -> Result<()> {
        Ok(())
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::test;

        #[ink::test]
        fn add_contract_works() {
            let contract: AccountId = [0x42; 32].into();
            let mut pinkrobot = Pinkrobot::new();
            assert!(pinkrobot.add_new_contract(1, contract).is_ok());
        }

        #[ink::test]
        fn get_contract_works() {
            let contract: AccountId = [0x42; 32].into();
            let mut pinkrobot = Pinkrobot::new();
            assert!(pinkrobot.add_new_contract(1, contract).is_ok());
            assert_eq!(pinkrobot.get_contract(1), Some(contract));
        }

        #[ink::test]
        fn set_price_works() {
            let accounts = default_accounts();
            let mut pinkrobot = Pinkrobot::new();
            assert!(pinkrobot.set_price(100).is_ok());
            assert_eq!(pinkrobot.get_price(), 100);

            // Non owner fails to set price
            set_sender(accounts.bob);
            assert_eq!(pinkrobot.set_price(100), Err(Error::NotOwner));
        }

        // #[ink::test]
        // fn withdrawal_works() {
        //     let mut pinkrobot = init();
        //     let mut pinkrobot = Pinkrobot::new();
        //     let accounts = default_accounts();
        //     set_balance(accounts.bob, PRICE);
        //     set_sender(accounts.bob);

        //     // Bob fails to withdraw
        //     set_sender(accounts.bob);
        //     assert!(pinkrobot.withdraw().is_err());
        //     assert_eq!(pinkrobot.env().balance(), expected_contract_balance);

        //     // Alice (contract owner) withdraws. Existential minimum is still set
        //     set_sender(accounts.alice);
        //     assert!(pinkrobot.withdraw().is_ok());
        // }

        fn default_accounts() -> test::DefaultAccounts<ink::env::DefaultEnvironment> {
            test::default_accounts::<Environment>()
        }

        fn set_sender(sender: AccountId) {
            ink::env::test::set_caller::<Environment>(sender);
        }

        // fn set_balance(account_id: AccountId, balance: Balance) {
        //     ink::env::test::set_account_balance::<ink::env::DefaultEnvironment>(account_id, balance)
        // }
    }

    /// ink! end-to-end (E2E) tests
    ///
    /// cargo test --features e2e-tests -- --nocapture
    ///
    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        use super::*;
        use crate::pinkrobot::PinkrobotRef;
        use ink::primitives::AccountId;
        use ink_e2e::build_message;
        use openbrush::contracts::ownable::ownable_external::Ownable;
        use openbrush::contracts::psp34::psp34_external::PSP34;
        use pinkpsp34::pinkpsp34::PinkPsp34Ref;
        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        const CONTRACT_INDEX: u8 = 1;

        fn get_alice_and_bob() -> (AccountId, AccountId) {
            let alice = ink_e2e::alice::<ink_e2e::PolkadotConfig>();
            let alice_account_id_32 = alice.account_id();
            let alice_account_id = AccountId::try_from(alice_account_id_32.as_ref()).unwrap();

            let bob = ink_e2e::bob::<ink_e2e::PolkadotConfig>();
            let bob_account_id_32 = bob.account_id();
            let bob_account_id = AccountId::try_from(bob_account_id_32.as_ref()).unwrap();

            (alice_account_id, bob_account_id)
        }

        #[ink_e2e::test(additional_contracts = "pinkpsp34/Cargo.toml pinkrobot/Cargo.toml")]
        async fn e2e_init_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            let name: Vec<u8> = "PinkPsp34".as_bytes().to_vec();
            let symbol: Vec<u8> = "PP".as_bytes().to_vec();
            let token_uri: Vec<u8> = "ipfs://myIpfsUri/".as_bytes().to_vec();

            // Instantiate PinkPsp34 contract
            let pinkpsp34_constructor = PinkPsp34Ref::new(name, symbol, 10, None);
            let (alice_account_id, bob_account_id) = get_alice_and_bob();

            let pinkpsp34_account_id = client
                .instantiate(
                    "pinkpsp34",
                    &ink_e2e::alice(),
                    pinkpsp34_constructor,
                    0,
                    None,
                )
                .await
                .expect("pinkpsp34 instantiate failed")
                .account_id;

            // Instantiate pinkrobot contract
            let pinkrobot_constructor = PinkrobotRef::new();
            let pinkrobot_account_id = client
                .instantiate(
                    "pinkrobot",
                    &ink_e2e::alice(),
                    pinkrobot_constructor,
                    0,
                    None,
                )
                .await
                .expect("pinkrobot instantiate failed")
                .account_id;

            // Add pinkpsp34 contract to pinkrobot with contract_index 1
            let change_message =
                build_message::<PinkrobotRef>(pinkrobot_account_id.clone()).call(|pinkrobot| {
                    pinkrobot.add_new_contract(CONTRACT_INDEX, pinkpsp34_account_id.clone())
                });
            let _ = client
                .call(&ink_e2e::alice(), change_message, 0, None)
                .await
                .expect("calling `add_new_contract` failed");

            // Verify that Alice is the pink owner
            let owner = build_message::<PinkrobotRef>(pinkrobot_account_id.clone())
                .call(|pinkrobot| pinkrobot.owner());
            let owner_result = client
                .call_dry_run(&ink_e2e::alice(), &owner, 0, None)
                .await
                .return_value();
            assert_eq!(owner_result, alice_account_id);

            // Set Pinkrobot to be the owner of PSP34
            let change_owner = build_message::<PinkPsp34Ref>(pinkpsp34_account_id.clone())
                .call(|p| p.transfer_ownership(pinkrobot_account_id));
            client
                .call(&ink_e2e::alice(), change_owner, 0, None)
                .await
                .expect("calling `transfer_ownership` failed");

            // Verify that PinkRobot is the pinkPsp owner
            let owner =
                build_message::<PinkPsp34Ref>(pinkpsp34_account_id.clone()).call(|p| p.owner());
            let owner_result = client
                .call_dry_run(&ink_e2e::alice(), &owner, 0, None)
                .await
                .return_value();
            assert_eq!(owner_result, pinkrobot_account_id);

            // Contract owner sets price
            let price_message = build_message::<PinkrobotRef>(pinkrobot_account_id.clone())
                .call(|pinkrobot| pinkrobot.set_price(100));
            client
                .call(&ink_e2e::alice(), price_message, 0, None)
                .await
                .expect("calling `set_price` failed");

            // Bob mints a token fails since no payment was made
            let mint_message = build_message::<PinkrobotRef>(pinkrobot_account_id.clone())
                .call(|pinkrobot| pinkrobot.pink_mint(CONTRACT_INDEX, token_uri.clone()));
            let failed_mint_result = client
                .call_dry_run(&ink_e2e::bob(), &mint_message, 0, None)
                .await
                .return_value();
            println!("mint_result: {:?}", failed_mint_result);
            assert_eq!(failed_mint_result, Err(Error::BadMintingFee));

            // Bob mints a token
            let mint_message = build_message::<PinkrobotRef>(pinkrobot_account_id.clone())
                .call(|pinkrobot| pinkrobot.pink_mint(CONTRACT_INDEX, token_uri.clone()));
            client
                .call(&ink_e2e::bob(), mint_message, 100, None)
                .await
                .expect("calling `pink_mint` failed");

            // Verify that token was minted on PinkPsp34
            let balance_message = build_message::<PinkPsp34Ref>(pinkpsp34_account_id.clone())
                .call(|p| p.balance_of(bob_account_id));
            let token_balance = client
                .call_dry_run(&ink_e2e::bob(), &balance_message, 0, None)
                .await
                .return_value();
            assert_eq!(token_balance, 1);

            Ok(())
        }
    }
}

/// Evaluate `$x:expr` and if not true return `Err($y:expr)`.
///
/// Used as `ensure!(expression_to_ensure, expression_to_return_on_false)`.
#[macro_export]
macro_rules! ensure {
    ( $x:expr, $y:expr $(,)? ) => {{
        if !$x {
            return Err($y.into());
        }
    }};
}
