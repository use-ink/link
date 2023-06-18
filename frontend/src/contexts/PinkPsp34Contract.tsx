import { PropsWithChildren, createContext } from "react";
import { Call, ChainContract, useCall, useContract } from "useink";
import { psp34ContractAddress } from "../const";
import metadata from "../metadata_psp34.json";
import { Id, SupplyResult } from "../types";

interface PinkPsp34ContractState {
  pinkPsp34Contract?: ChainContract;
  totalBalance?: Call<Id[]>;
  tokenUri?: Call<string>;
  totalSupply?: Call<SupplyResult>;
  balanceOf?: Call<SupplyResult>;
  limitPerAccount?: Call<SupplyResult>;
  isWhitelistEnabled?: Call<SupplyResult>;
  isWhitelisted?: Call<SupplyResult>;
}

export const PinkPsp34ContractContext = createContext<PinkPsp34ContractState>(
  {}
);

export function PinkPsp34ContractProvider({ children }: PropsWithChildren) {
  const pinkPsp34Contract = useContract(psp34ContractAddress, metadata);
  const totalBalance = useCall<Id[]>(pinkPsp34Contract, "totalBalance");
  const tokenUri = useCall<string>(pinkPsp34Contract, "pinkMint::tokenUri");
  const totalSupply = useCall<SupplyResult>(pinkPsp34Contract, 'psp34::totalSupply');
  const balanceOf = useCall<SupplyResult>(pinkPsp34Contract, 'psp34::balanceOf');
  const limitPerAccount = useCall<SupplyResult>(pinkPsp34Contract, 'pinkMint::limitPerAccount');
  const isWhitelistEnabled = useCall<SupplyResult>(pinkPsp34Contract, 'pinkMint::isWhitelistEnabled');
  const isWhitelisted = useCall<SupplyResult>(pinkPsp34Contract, 'pinkMint::isWhitelisted');

  return (
    <PinkPsp34ContractContext.Provider
      value={{ pinkPsp34Contract, totalBalance, tokenUri, totalSupply, limitPerAccount, balanceOf, isWhitelistEnabled, isWhitelisted }}
    >
      {children}
    </PinkPsp34ContractContext.Provider>
  );
}
