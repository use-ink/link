import { SetStateAction, useState } from "react";
import { PinkValues } from "../types";

export const ModelSelector = ({ values }: { values: PinkValues }) => {
  const [model, setModel] = useState<string>(values.aiModel);

  const modelChanged = (e: { target: { value: SetStateAction<string> } }) => {
    console.log("modelChanged", e.target.value);
    values.aiModel = e.target.value.toString();
    setModel(values.aiModel);
  };

  return (
    <div className="group">
      {/* <label htmlFor="aimodel">A.I. Model</label> */}
      <select
        name="aimodel"
        value={model}
        onChange={modelChanged}
        style={{ display: "block" }}
        title="Select an AI model. All models are Open Source. The best resolution is with the Stable Diffusion v2.1 model and that is 768 × 768px. Other models will generate 512 × 512px image."
      >
        <option value="" disabled selected>Select AI model</option>
        <option
          value="https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1"
          label="Stable Diffusion v2.1"
        ></option>
        <option
          value="https://api-inference.huggingface.co/models/andite/anything-v4.0"
          label="Anything"
        ></option>
        <option
          value="https://api-inference.huggingface.co/models/prompthero/openjourney"
          label="Open Journey"
        ></option>
        <option
          value="https://api-inference.huggingface.co/models/Joeythemonster/anything-midjourney-v-4-1"
          label="Anything MidJourney"
        ></option>
        <option
          value="https://api-inference.huggingface.co/models/lambdalabs/sd-pokemon-diffusers"
          label="Pokemon Diffusers"
        ></option>
        <option
          value="https://api-inference.huggingface.co/models/nitrosocke/Arcane-Diffusion"
          label="Arcane Diffusion"
        ></option>
        <option
          value="https://api-inference.huggingface.co/models/eimiss/EimisAnimeDiffusion_1.0v"
          label="Eimis Anime"
        ></option>
        <option
          value="https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5"
          label="Stable Diffusion v1.5"
        ></option>
        <option
          value="https://api-inference.huggingface.co/models/hakurei/waifu-diffusion"
          label="Waifu"
        ></option>
      </select>
    </div>
  );
};