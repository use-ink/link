import { SetStateAction, useState } from "react";
import { PinkValues } from "../types";
import { AiStyles } from "../const";
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
          value={style}
          onChange={styleChanged}
          style={{ display: "block" }}
        >
          <FormControlLabel
            value={AiStyles.None}
            control={<CustomRadio />}
            label="None"
          />
          <FormControlLabel
            value={AiStyles.Anime}
            control={<CustomRadio />}
            label="Anime"
          />
          <FormControlLabel
            value={AiStyles.Cartoon}
            control={<CustomRadio />}
            label="Cartoon"
          />
          <FormControlLabel
            value={AiStyles.Oil}
            control={<CustomRadio />}
            label="Oil"
          />
          <FormControlLabel
            value={AiStyles.Pixel}
            control={<CustomRadio />}
            label="Pixel"
          />
          <FormControlLabel
            value={AiStyles.Pop}
            control={<CustomRadio />}
            label="Pop"
          />
          <FormControlLabel
            value={AiStyles.Nouveau}
            control={<CustomRadio />}
            label="Nouveau"
          />
          <FormControlLabel
            value={AiStyles.Ink}
            control={<CustomRadio />}
            label="Ink"
          />
          <FormControlLabel
            value={AiStyles.Disney}
            control={<CustomRadio />}
            label="Disney"
          />
          <FormControlLabel
            value={AiStyles.Ghibli}
            control={<CustomRadio />}
            label="Ghibli"
          />
          <FormControlLabel
            value={AiStyles.Pixar}
            control={<CustomRadio />}
            label="Pixar"
          />
          <FormControlLabel
            value={AiStyles.Best}
            control={<CustomRadio />}
            label="Best"
          />
          <FormControlLabel
            value={AiStyles.Deviant}
            control={<CustomRadio />}
            label="Deviant"
          />
          <FormControlLabel
            value={AiStyles.Watercolor}
            control={<CustomRadio />}
            label="Watercolor"
          />
          <FormControlLabel
            value={AiStyles.Paper}
            control={<CustomRadio />}
            label="Paper"
          />
        </RadioGroup>
      </FormControl>
    </div>
  );
};
