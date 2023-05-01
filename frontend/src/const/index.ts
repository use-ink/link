import * as Yup from "yup";
import { PinkValues } from "../types";

export const initialPinkValues: PinkValues = { prompt: "", ipfs: ""};

export const PinkFormSchema = Yup.object().shape({
  prompt: Yup.string()
    .min(3, "Description is too short")
    .required(),
});

// export const endpoint = "wss://rococo-contracts-rpc.polkadot.io";
export const endpoint = "wss://rpc.shibuya.astar.network";

export const contractAddress =
  "5GdHQQkRHvEEE4sDkcLkxCCumSkw2SFBJSLKzbMTNARLTXz3";
export const dryRunCallerAddress =
  "5EyR7vEk7DtvEWeefGcXXMV6hKwB8Ex5uvjHufm466mbjJkR";
  export const modelUrl = `https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4`;
  // export const modelUrl = `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2`;
  // export const modelUrl = `https://api-inference.huggingface.co/models/Joeythemonster/anything-midjourney-v-4-1`;