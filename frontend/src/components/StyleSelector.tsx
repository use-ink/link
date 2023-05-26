import { SetStateAction } from "react";
import { PinkValues, AiStyles } from "../types";
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
  const styleChanged = (e: { target: { value: SetStateAction<string> } }) => {
    values.aiStyle = e.target.value.toString();
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
            value={AiStyles.Pixiv}
            control={<CustomRadio />}
            label="Pixiv"
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
            value={AiStyles.Deviant}
            control={<CustomRadio />}
            label="Deviant"
          />
          <FormControlLabel
            value={AiStyles.Pixabay}
            control={<CustomRadio />}
            label="Pixabay"
          />
          <FormControlLabel
            value={AiStyles.Artstation}
            control={<CustomRadio />}
            label="Artstation"
          />
          <FormControlLabel
            value={AiStyles.Illustration}
            control={<CustomRadio />}
            label="Illustration"
          />
        </RadioGroup>
      </FormControl>
    </div>
  );
};
