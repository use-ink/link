import { useState } from "react";
import { NameText, PinkValues } from "../types";
import { aiStyles } from "../const";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  RadioProps,
  styled,
} from "@mui/material";

const CustomRadio = styled(Radio)<RadioProps>(({ theme }) => ({
  color: "white",
  "&.Mui-checked": {
    color: "rgba(255, 105, 180, 0.9)",
  },
}));

export const StyleSelector = ({ values }: { values: PinkValues }) => {
  const [style, setStyle] = useState<string>(values.aiStyle.name);

  const styleChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStyle: NameText = aiStyles[e.target.value.toLowerCase()];
    setStyle(newStyle.name);
    values.aiStyle = newStyle;
    console.log("modelChanged", newStyle);
  };

  return (
    <div className="Group">
      <FormControl component="fieldset">
        <RadioGroup
          name={"Style"}
          value={style}
          onChange={styleChanged}
          style={{ display: "block" }}
        >
          <FormControlLabel
            value={aiStyles.none.name}
            control={<CustomRadio />}
            label={aiStyles.none.name}
          />
          <FormControlLabel
            value={aiStyles.anime.name}
            control={<CustomRadio />}
            label={aiStyles.anime.name}
          />
          <FormControlLabel
            value={aiStyles.cartoon.name}
            control={<CustomRadio />}
            label={aiStyles.cartoon.name}
          />
          <FormControlLabel
            value={aiStyles.oil.name}
            control={<CustomRadio />}
            label={aiStyles.oil.name}
          />
          <FormControlLabel
            value={aiStyles.pixel.name}
            control={<CustomRadio />}
            label={aiStyles.pixel.name}
          />
          <FormControlLabel
            value={aiStyles.pop.name}
            control={<CustomRadio />}
            label={aiStyles.pop.name}
          />
          <FormControlLabel
            value={aiStyles.nouveau.name}
            control={<CustomRadio />}
            label={aiStyles.nouveau.name}
          />
          <FormControlLabel
            value={aiStyles.ink.name}
            control={<CustomRadio />}
            label={aiStyles.ink.name}
          />
          <FormControlLabel
            value={aiStyles.disney.name}
            control={<CustomRadio />}
            label={aiStyles.disney.name}
          />
          <FormControlLabel
            value={aiStyles.ghibli.name}
            control={<CustomRadio />}
            label={aiStyles.ghibli.name}
          />
          <FormControlLabel
            value={aiStyles.pixar.name}
            control={<CustomRadio />}
            label={aiStyles.pixar.name}
          />
          <FormControlLabel
            value={aiStyles.best.name}
            control={<CustomRadio />}
            label={aiStyles.best.name}
          />
          <FormControlLabel
            value={aiStyles.deviant.name}
            control={<CustomRadio />}
            label={aiStyles.deviant.name}
          />
          <FormControlLabel
            value={aiStyles.watercolor.name}
            control={<CustomRadio />}
            label={aiStyles.watercolor.name}
          />
          <FormControlLabel
            value={aiStyles.paper.name}
            control={<CustomRadio />}
            label={aiStyles.paper.name}
          />
        </RadioGroup>
      </FormControl>
    </div>
  );
};
