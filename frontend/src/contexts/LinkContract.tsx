import { ContractPromise } from "@polkadot/api-contract";
import * as React from "react";
import { PropsWithChildren } from "react";
import { useContract } from "useink";
import { contractAddress } from "../const";
import metadata from "../metadata.json";

const LinkContractContext = React.createContext<
  { contract?: ContractPromise } | undefined
>(undefined);

function LinkContractProvider({ children }: PropsWithChildren) {
  const contract = useContract(contractAddress, metadata);

  return (
    <LinkContractContext.Provider value={{ contract }}>
      {children}
    </LinkContractContext.Provider>
  );
}

function useLinkContract() {
  const context = React.useContext(LinkContractContext);

  if (context === undefined) {
    throw new Error(
      "useLinkContract must be used within a LinkContractProvider"
    );
  }

  return context;
}

export { LinkContractProvider, useLinkContract };
