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
  aiModel: string;
  aiStyle: string;
  imageData: Array<Uint8Array>;
  displayImage: Array<any>;
  tokenId: Array<number>;
  networkId: NetworkId;
}

export enum ContractType {
  PinkPsp34 = 0,
  CustomUpload34 = 1,
  PinkRmrk = 2,
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

export interface NetworkInfo {
  endpoint: string;
  pinkContractAddress: string;
}
export interface Meta {
  name: string;
  description: string;
}

export enum NetworkId {
  Shibuya = 0,
  Astar = 1,
}

export enum AiStyles {
  None = "",
  Anime = "in anime style, ",
  Cartoon = "in cartoon style, ",
  Oil = "in oil painting style, ",
  Pixel = "in pixel art style, ",
  Pop = "in pop art style, ",
  Nouveau = "in Art Nouveau style, ",
  Illustration = "in Illustration style, ",
  Deviant = "in Deviant website style, ",
  Artstation = "in Artstation website style, ",
  Pixiv = "in Pixiv website style, ",
  Pixabay = "in Pixabay website style, ",
  Concept = "in Concept style, ",
  Ghibli = "in Ghibli studio style, ",
  Pixar = "in Pixar studio style, ",
}
