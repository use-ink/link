import type {
  StorageDeposit,
  Balance,
  WeightV2,
} from "@polkadot/types/interfaces";
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";
import type { u64} from '@polkadot/types-codec';

export type Estimation = {
  gasRequired: WeightV2;
  storageDeposit: StorageDeposit;
  partialFee: Balance;
  result: MintingResult;
  error?: UIError;
  price: Balance;
  total: Balance;
};

export interface PinkValues {
  prompt: string;
  contractType: number;
  ipfs: string;
  aimodel: string;
  imageData: Uint8Array;
  aiImage: any;
}

export interface UIEvent {
  name: string;
  message: string;
}

export type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;

export type InjectedAccount = Flatten<Awaited<ReturnType<typeof web3Accounts>>>;
export type InjectedExtension = Flatten<Awaited<ReturnType<typeof web3Enable>>>;

export type MintingResult = { Ok: u64 } | { Err: string };

export type UIError = {
  message: string;
};
