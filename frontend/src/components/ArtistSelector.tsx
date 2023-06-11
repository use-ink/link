import { SetStateAction, useState } from "react";
import { PinkValues } from "../types";
import { ArtistStyles } from "../const";

export const ArtistSelector = ({ values }: { values: PinkValues }) => {
  const [artist, setArtist] = useState<string>(values.artist);

  const artistChanged = (e: { target: { value: SetStateAction<string> } }) => {
    console.log("artistChanged", e.target.value);
    values.artist = e.target.value.toString();
    setArtist(values.artist);
  };

  return (
    <div className="group">
      {/* <label htmlFor="artist">Artist</label> */}
      <select
        name="artist"
        value={artist}
        onChange={artistChanged}
        style={{ display: "block" }}
        title="Select an Artist style. You can also enter any other Artist style in the prompt field."
      >
        <option value="" disabled >Select an Artist style</option>
        <option
          value={ArtistStyles.None}
          label="No Artist selected"
        ></option>
        <option
          value={ArtistStyles.Kusama}
          label="Yayoi Kusama"
        ></option>
        <option
          value={ArtistStyles.Amano}
          label="Yoshitaka Amano"
        ></option>
        <option
          value={ArtistStyles.Takashi}
          label="Takashi Murakami"
        ></option>
        <option
          value={ArtistStyles.Hokusai}
          label="Katsushika Hokusai"
        ></option>
        <option
          value={ArtistStyles.Picasso}
          label="Pablo Picasso"
        ></option>
        <option
          value={ArtistStyles.Gogh}
          label="Vincent van Gogh"
        ></option>
        <option
          value={ArtistStyles.Dali}
          label="Salvador Dali"
        ></option>
        <option
          value={ArtistStyles.Pollock}
          label="Jackson Pollock"
        ></option>
        <option
          value={ArtistStyles.Warhol}
          label="Andy Warhol"
        ></option>
        <option
          value={ArtistStyles.Matisse}
          label="Henri Matisse"
        ></option>
        <option
          value={ArtistStyles.Kandinsky}
          label="Wassily Kandinsky"
        ></option>
        <option
          value={ArtistStyles.Munch}
          label="Edvard Munch"
        ></option>
        <option
          value={ArtistStyles.Banksy}
          label="Banksy"
        ></option>
        <option
          value={ArtistStyles.Haring}
          label="Keith Haring"
        ></option>
        <option
          value={ArtistStyles.Basquiat}
          label="Jean-Michel Basquiat"
        ></option>
      </select>
    </div>
  );
};