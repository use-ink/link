import { ApiPromise, WsProvider } from "@polkadot/api";
import * as React from "react";
import { PropsWithChildren, useEffect, useState } from "react";
import { endpoint } from "../const";

const ChainContext = React.createContext<{ api?: ApiPromise } | undefined>(
  undefined
);

function ChainProvider({ children }: PropsWithChildren<{ api?: ApiPromise }>) {
  const [api, setApi] = useState<ApiPromise>();

  useEffect(() => {
    const wsProvider = new WsProvider(endpoint);
    ApiPromise.create({ provider: wsProvider }).then((api) => setApi(api));
  }, []);

  return (
    <ChainContext.Provider value={{ api }}>{children}</ChainContext.Provider>
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
