import type { StorageDeposit } from "@polkadot/types/interfaces";

import type { u64 } from "@polkadot/types";
import { web3Accounts } from "@polkadot/extension-dapp";

export type Estimation = {
  gasRequired: u64;
  storageDeposit: StorageDeposit;
};

export interface Values {
  url: string;
  alias: string;
}

export interface UIEvent {
  name: string;
  message: string;
}
export type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;

export type InjectedAccount = Flatten<Awaited<ReturnType<typeof web3Accounts>>>;
