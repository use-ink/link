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
        <option value="" disabled>
          Select an Artist style
        </option>
        <option value={artistStyles.none.name}>No Artist selected</option>
        <option value={artistStyles.kusama.name}>Yayoi Kusama</option>
        <option value={artistStyles.amano.name}>Yoshitaka Amano</option>
        <option value={artistStyles.takashi.name}>Takashi Murakami</option>
        <option value={artistStyles.hokusai.name}>Katsushika Hokusai</option>
        <option value={artistStyles.picasso.name}>Pablo Picasso</option>
        <option value={artistStyles.gogh.name}>Vincent van Gogh</option>
        <option value={artistStyles.dali.name}>Salvador Dali</option>
        <option value={artistStyles.pollock.name}>Jackson Pollock</option>
        <option value={artistStyles.warhol.name}>Andy Warhol</option>
        <option value={artistStyles.matisse.name}>Henri Matisse</option>
        <option value={artistStyles.kandinsky.name}>Wassily Kandinsky</option>
        <option value={artistStyles.munch.name}>Edvard Munch</option>
        <option value={artistStyles.banksy.name}>Banksy</option>
        <option value={artistStyles.haring.name}>Keith Haring</option>
        <option value={artistStyles.basquiat.name}>Jean-Michel Basquiat</option>
      </select>
    </div>
  );
};
