import { ScProvider, WellKnownChain } from "@polkadot/rpc-provider/substrate-connect";
import { ApiPromise } from "@polkadot/api";
import { Abi, ContractPromise } from "@polkadot/api-contract";
import * as React from "react";
import { PropsWithChildren, useEffect, useState } from "react";
import { endpoint, contractAddress } from "../const";
import jsonParachainSpec from '../chainspec.json';
import metadata from "../metadata.json";

const ChainContext = React.createContext<
  { api?: ApiPromise; contract?: ContractPromise } | undefined
>(undefined);

function ChainProvider({ children }: PropsWithChildren<{ api?: ApiPromise }>) {
  const [api, setApi] = useState<ApiPromise>();
  const [contract, setContract] = useState<ContractPromise>();

  useEffect(() => {
    const relayProvider = new ScProvider(WellKnownChain.rococo_v2_2);
    const parachainSpec = JSON.stringify(jsonParachainSpec);
    const provider = new ScProvider(parachainSpec, relayProvider);
    provider.connect()
        .then(() =>
            ApiPromise.create({ provider }).then((api) => setApi(api)));
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
