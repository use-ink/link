import * as Yup from "yup";
import { nanoid } from "nanoid";
import { Values } from "../types";

export const initialValues: Values = { url: "", alias: nanoid(5) };

export const UrlShortenerSchema = Yup.object().shape({
  url: Yup.string().url().required("URL is a required field"),
  alias: Yup.string()
    .min(5, "Alias is too short! (min 5 characters)")
    .max(10, "Alias is too long! (max 10 characters)")
    .required("Alias is a required field"),
});

export const endpoint = "wss://rococo-contracts-rpc.polkadot.io";
export const contractAddress =
  "5GdHQQkRHvEEE4sDkcLkxCCumSkw2SFBJSLKzbMTNARLTXz3";
export const dryRunCallerAddress =
  "5EyR7vEk7DtvEWeefGcXXMV6hKwB8Ex5uvjHufm466mbjJkR";
