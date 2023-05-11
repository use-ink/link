import * as Yup from "yup";
import { PinkValues } from "../types";
import robot_bestia from "../robot-bestia.jpeg";
import BN from "bn.js";


export const PinkFormSchema = Yup.object().shape({
  prompt: Yup.string()
    .min(3, "Description is too short")
    .required(),
});

// export const endpoint = "wss://rococo-contracts-rpc.polkadot.io";
export const endpoint = "wss://rpc.shibuya.astar.network";

export const BN_ZERO = new BN(0);

export const contractAddress =
  "X7oW2aZHThoXG9GyurDgfgieXfquDJ6znWnMDxfUsNrodba";

export const dryRunCallerAddress =
  "5DPDFJi6rcooALEpR5gSbR8jgUU6YerEHRkAv3Sk8MDoRTke";

// export const DEFAULT_MODEL = `https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4`;
// export const DEFAULT_MODEL = `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2`;
export const DEFAULT_MODEL = `https://api-inference.huggingface.co/models/Joeythemonster/anything-midjourney-v-4-1`;

export const PINK_DESCRIPTION = "The collection of Pink Robots generated by AI";
export const initialPinkValues: PinkValues = { prompt: "", contractType: 0, ipfs: "ipfs//", aimodel: DEFAULT_MODEL, aiImage: robot_bestia };