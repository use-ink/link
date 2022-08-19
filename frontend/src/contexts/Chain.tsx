import { ApiPromise, WsProvider } from "@polkadot/api";
import { Abi, ContractPromise } from "@polkadot/api-contract";
import * as React from "react";
import { PropsWithChildren, useEffect, useState } from "react";
import { endpoint, contractAddress } from "../const";
import metadata from "../metadata.json";

const ChainContext = React.createContext<
  { api?: ApiPromise; contract?: ContractPromise } | undefined
>(undefined);

function ChainProvider({ children }: PropsWithChildren<{ api?: ApiPromise }>) {
  const [api, setApi] = useState<ApiPromise>();
  const [contract, setContract] = useState<ContractPromise>();

  useEffect(() => {
    const wsProvider = new WsProvider(endpoint);
    ApiPromise.create({ provider: wsProvider }).then((api) => setApi(api));
  }, []);

  useEffect(() => {
    if (!api) return;
    const abi = new Abi(metadata, api.registry.getChainProperties());
    const c = new ContractPromise(api, abi, contractAddress);
    setContract(c);
  }, [api]);

  return (
    <ChainContext.Provider value={{ api, contract }}>
      {children}
    </ChainContext.Provider>
  );
}

function useChain() {
  const context = React.useContext(ChainContext);
  if (context === undefined) {
    throw new Error("useChain must be used within a ChainProvider");
  }
  return context;
}

export { ChainProvider, useChain };
