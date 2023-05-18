import { useContext } from "react";
import { LinkContractContext } from "../contexts";

export const useLinkContract = () => {
  const context = useContext(LinkContractContext);

  if (context === undefined) {
    throw new Error(
      "useLinkContract must be used within a LinkContractProvider"
    );
  }

  return context;
}
