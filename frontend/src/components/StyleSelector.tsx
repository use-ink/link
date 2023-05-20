import { SetStateAction, useState } from "react";
import { PinkValues, AiStyles } from "../types";
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@material-ui/core";

export const StyleSelector = ({ values }: { values: PinkValues }) => {
  const [style, setStyle] = useState<string>(values.aiStyle);

  const styleChanged = (e: { target: { value: SetStateAction<string> } }) => {
    values.aiStyle = e.target.value.toString();
    setStyle(values.aiStyle);
    console.log("modelChanged", values.aiStyle);
  };


  return (
    <div className="Group">
      <FormControl component="fieldset">
        <RadioGroup
          name={"Style"}
          value={values.aiStyle}
          onChange={styleChanged}
          style={{ display: "block" }}
        >
          <FormControlLabel value={AiStyles.None} control={<Radio />} label="None" />
          <FormControlLabel value={AiStyles.Anime} control={<Radio />} label="Anime" />
          <FormControlLabel value={AiStyles.Cartoon} control={<Radio />} label="Cartoon" />
          <FormControlLabel value={AiStyles.Oil} control={<Radio />} label="Oil" />
          <FormControlLabel value={AiStyles.Pixel} control={<Radio />} label="Pixel" />
          <FormControlLabel value={AiStyles.Pop} control={<Radio />} label="Pop" />
          <FormControlLabel value={AiStyles.Nouveau} control={<Radio />} label="Nouveau" />
          <FormControlLabel value={AiStyles.Pixiv} control={<Radio />} label="Pixiv" />
          <FormControlLabel value={AiStyles.Ghibli} control={<Radio />} label="Ghibli" />
          <FormControlLabel value={AiStyles.Pixar} control={<Radio />} label="Pixar" />
          <FormControlLabel value={AiStyles.Deviant} control={<Radio />} label="Deviant" />
          <FormControlLabel value={AiStyles.Pixabay} control={<Radio />} label="Pixabay" />
          <FormControlLabel value={AiStyles.Artstation} control={<Radio />} label="Artstation" />
          <FormControlLabel value={AiStyles.Illustration} control={<Radio />} label="Illustration" />
        </RadioGroup>
      </FormControl>
    </div>
  );
}