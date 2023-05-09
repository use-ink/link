import * as Yup from "yup";
import { PinkValues } from "../types";

export const initialPinkValues: PinkValues = { prompt: "", contractType: 0, ipfs: "ipfs//"};

export const PinkFormSchema = Yup.object().shape({
  prompt: Yup.string()
    .min(3, "Description is too short")
    .required(),
});

// export const endpoint = "wss://rococo-contracts-rpc.polkadot.io";
export const endpoint = "wss://rpc.shibuya.astar.network";

export const contractAddress =
  "X7oW2aZHThoXG9GyurDgfgieXfquDJ6znWnMDxfUsNrodba";
export const dryRunCallerAddress =
  "5DPDFJi6rcooALEpR5gSbR8jgUU6YerEHRkAv3Sk8MDoRTke";
  export const modelUrl = `https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4`;
  // export const modelUrl = `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2`;
  // export const modelUrl = `https://api-inference.huggingface.co/models/Joeythemonster/anything-midjourney-v-4-1`;