import { PropsWithChildren, createContext } from "react";
import { Call, ChainContract, useCall, useContract } from "useink";
import { psp34ContractAddress } from "../const";
import metadata from "../metadata_psp34.json";
import { Id } from "../types";

interface PinkPsp34ContractState {
  pinkPsp34Contract?: ChainContract;
  totalBalance?: Call<Id[]>;
  tokenUri?: Call<string>;
}

export const PinkPsp34ContractContext = createContext<PinkPsp34ContractState>(
  {}
);

export function PinkPsp34ContractProvider({ children }: PropsWithChildren) {
  const pinkPsp34Contract = useContract(psp34ContractAddress, metadata);
  const totalBalance = useCall<Id[]>(pinkPsp34Contract, "totalBalance");
  const tokenUri = useCall<string>(pinkPsp34Contract, "pinkMint::tokenUri");

  return (
    <PinkPsp34ContractContext.Provider
      value={{ pinkPsp34Contract, totalBalance, tokenUri }}
    >
      {children}
    </PinkPsp34ContractContext.Provider>
  );
}
