import { useState } from "react";
import { NameText, PinkValues } from "../types";
import { aiModels } from "../const";

export const ModelSelector = ({ values }: { values: PinkValues }) => {
  const [model, setModel] = useState<string>(values.aiModel.name);

  const modelChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newModel: NameText = aiModels[e.target.value.toLowerCase()];
    console.log("modelChanged", newModel);
    setModel(newModel.name);
    values.artist = newModel;
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
          value={aiModels.stablediffusion.name}
          label="Stable Diffusion v2.1"
        ></option>
        <option
          value={aiModels.anything.name}
          label="Anything"
        ></option>
        <option
          value={aiModels.openjourney.name}
          label="Open Journey"
        ></option>
        <option
          value={aiModels.anythingmidjourney.name}
          label="Anything MidJourney"
        ></option>
        <option
          value={aiModels.pokemondiffusers.name}
          label="Pokemon Diffusers"
        ></option>
        <option
          value={aiModels.arcanediffusion.name}
          label="Arcane Diffusion"
        ></option>
        <option
          value={aiModels.eimisanime.name}
          label="Eimis Anime"
        ></option>
        <option
          value={aiModels.waifu.name}
          label="Waifu"
        ></option>
      </select>
    </div>
  );
};