import { useContext } from "react";
import { PinkContractContext } from "../contexts";

export const usePinkContract = () => {
  const context = useContext(PinkContractContext);

  if (context === undefined) {
    throw new Error(
      "usePinkContract must be used within a PinkContractProvider"
    );
  }

  return context;
}
