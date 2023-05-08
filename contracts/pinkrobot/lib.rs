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
        pub fn add_new_contract(&mut self, entry: u8, contract: AccountId) -> Result<()> {
            ensure!(self.env().caller() == self.owner, Error::NotOwner);
            ensure_valid_contract(contract)?;
            self.contracts_map.insert(&entry, &contract);
            Ok(())
        }

        #[ink(message)]
        pub fn set_price(&mut self, price: Balance) -> Result<()> {
            ensure!(self.env().caller() == self.owner, Error::NotOwner);
            self.price = price;
            Ok(())
        }

        #[ink(message, payable)]
        pub fn pink_mint(&mut self, entry: u8, metadata: Vec<u8>) -> Result<()> {
            let caller = self.env().caller();
            ensure!(
                self.price == self.env().transferred_value(),
                Error::BadMintingFee
            );
            ensure!(self.env().caller() == self.owner, Error::NotOwner);
            let contract = self
                .contracts_map
                .get(&entry)
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

        #[ink(message)]
        pub fn balance_of(&mut self, entry: u8, user: AccountId) -> Result<u32> {
            let contract = self
                .contracts_map
                .get(&entry)
                .ok_or(Error::FailedToGetContract)?;

            let balance = build_call::<DefaultEnvironment>()
                .call(contract)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("balance_of")))
                        .push_arg(user),
                )
                .returns::<u32>()
                .try_invoke()
                .unwrap_or_else(|err| {
                    panic!("Failed to invoke `balance_of` on {:?}: {:?}", contract, err)
                })
                .unwrap_or(0);

            ink::env::debug_println!("balance: {:?}", balance);
            Ok(balance)
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
        pub fn get_contract(&self, entry: u8) -> Option<AccountId> {
            self.contracts_map.get(&entry)
        }
    }

    fn ensure_valid_contract(_contract: AccountId) -> Result<()> {
        Ok(())
    }

    #[cfg(test)]
    mod tests {
        use super::*;

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
    }

    /// This is how you'd write end-to-end (E2E) or integration tests for ink! contracts.
    ///
    /// When running these you need to make sure that you:
    /// - Compile the tests with the `e2e-tests` feature flag enabled (`--features e2e-tests`)
    /// - Are running a Substrate node which contains `pallet-contracts` in the background
    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        use super::*;
        use crate::pinkrobot::PinkrobotRef;
        use ink_e2e::build_message;
        use pinkpsp34::pinkpsp34::PinkPsp34Ref;

        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        #[ink_e2e::test(additional_contracts = "pinkpsp34/Cargo.toml pinkrobot/Cargo.toml")]
        async fn e2e_init_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            let name: Vec<u8> = "PinkPsp34".as_bytes().to_vec();
            let symbol: Vec<u8> = "PP".as_bytes().to_vec();
            let token_uri: Vec<u8> = "ipfs://myIpfsUri/".as_bytes().to_vec();
            let user = [0x42; 32];

            // Instantiate PinkPsp34 contract
            let pinkpsp34_constructor = PinkPsp34Ref::new(name, symbol, 10, None);
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

            // Add pinkpsp34 contract to pinkrobot with index 1
            let change_message = build_message::<PinkrobotRef>(pinkrobot_account_id.clone())
                .call(|pinkrobot| pinkrobot.add_new_contract(1, pinkpsp34_account_id.clone()));
            let _ = client
                .call(&ink_e2e::alice(), change_message, 0, None)
                .await
                .expect("calling `add_new_contract` failed");

            // Verify that index 1 is pinkpsp34
            let get = build_message::<PinkrobotRef>(pinkrobot_account_id.clone())
                .call(|pinkrobot| pinkrobot.get_contract(1));
            assert_eq!(
                client
                    .call_dry_run(&ink_e2e::bob(), &get, 0, None)
                    .await
                    .return_value(),
                Some(pinkpsp34_account_id)
            );

            // Mint a token
            let change_message = build_message::<PinkrobotRef>(pinkrobot_account_id.clone())
                .call(|pinkrobot| pinkrobot.pink_mint(1, token_uri.clone()));
            let _ = client
                .call(&ink_e2e::bob(), change_message, 0, None)
                .await
                .expect("calling `pink_mint` failed");

            // Verify that token was minted on PinkPsp34
            // let get_balance_message = build_message::<PinkrobotRef>(pinkrobot_account_id.clone())
            //     .call(|pinkrobot| pinkrobot.balance_of(1, ink_e2e::bob().account_id()));
            // let balance_result = client.call_dry_run(&ink_e2e::bob(), &get_balance_message, 0, None)
            //     .await.return_value();
            // assert_eq!(
            //     1,
            //     balance_result.unwrap_or(0)
            // );

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
