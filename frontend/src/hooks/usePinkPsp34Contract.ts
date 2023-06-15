import { useContext } from "react";
import { PinkPsp34ContractContext } from "../contexts";

export const usePinkPsp34Contract = () => {
  const context = useContext(PinkPsp34ContractContext);

  if (context === undefined) {
    throw new Error(
      "usePinkPsp34Contract must be used within a PinkPsp34ContractProvider"
    );
  }

  return context;
}
