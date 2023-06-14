import { useState } from "react";
import { PinkValues, NameText } from "../types";
import { artistStyles } from "../const";

export const ArtistSelector = ({ values }: { values: PinkValues }) => {
  const [artist, setArtist] = useState<string>(values.artist.name);

  const artistChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newArtist: NameText = artistStyles[e.target.value.toLowerCase()];
    console.log("artistChanged", newArtist);
    setArtist(newArtist.name);
    values.artist = newArtist;
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
          value={artistStyles.none.name}
          label="No Artist selected"
        ></option>
        <option
          value={artistStyles.kusama.name}
          label="Yayoi Kusama"
        ></option>
        <option
          value={artistStyles.amano.name}
          label="Yoshitaka Amano"
        ></option>
        <option
          value={artistStyles.takashi.name}
          label="Takashi Murakami"
        ></option>
        <option
          value={artistStyles.hokusai.name}
          label="Katsushika Hokusai"
        ></option>
        <option
          value={artistStyles.picasso.name}
          label="Pablo Picasso"
        ></option>
        <option
          value={artistStyles.gogh.name}
          label="Vincent van Gogh"
        ></option>
        <option
          value={artistStyles.dali.name}
          label="Salvador Dali"
        ></option>
        <option
          value={artistStyles.pollock.name}
          label="Jackson Pollock"
        ></option>
        <option
          value={artistStyles.warhol.name}
          label="Andy Warhol"
        ></option>
        <option
          value={artistStyles.matisse.name}
          label="Henri Matisse"
        ></option>
        <option
          value={artistStyles.kandinsky.name}
          label="Wassily Kandinsky"
        ></option>
        <option
          value={artistStyles.munch.name}
          label="Edvard Munch"
        ></option>
        <option
          value={artistStyles.banksy.name}
          label="Banksy"
        ></option>
        <option
          value={artistStyles.haring.name}
          label="Keith Haring"
        ></option>
        <option
          value={artistStyles.basquiat.name}
          label="Jean-Michel Basquiat"
        ></option>
      </select>
    </div>
  );
};