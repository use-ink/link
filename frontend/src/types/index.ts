import type {
  StorageDeposit,
  Balance,
  WeightV2,
} from "@polkadot/types/interfaces";
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";

export type Estimation = {
  gasRequired: WeightV2;
  storageDeposit: StorageDeposit;
  partialFee: Balance;
  result: ShorteningResult;
  error?: UIError;
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
export type InjectedExtension = Flatten<Awaited<ReturnType<typeof web3Enable>>>;

export type ShorteningOutcome =
  | "Shortened"
  | { Deduplicated: { slug: string } };

export type ShorteningResult = { Ok: ShorteningOutcome } | { Err: string };

export type UIError = {
  message: string;
};
