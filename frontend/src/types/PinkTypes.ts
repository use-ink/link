import { RustResult } from "useink/utils";

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
  price: any;
  total: any;
}

export enum ContractType {
  PinkPsp34 = 0,
  CustomUpload34 = 1,
  PinkRmrk = 2,
}

// export type InjectedAccount = Flatten<Awaited<ReturnType<typeof web3Accounts>>>;
// export type InjectedExtension = Flatten<Awaited<ReturnType<typeof web3Enable>>>;

export type MintingResult = { Ok: number } | { Err: string };


export interface NetworkInfo {
  name: string;
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

export type SupplyResult = RustResult<{ value: number }, { err: { e: string } }>;