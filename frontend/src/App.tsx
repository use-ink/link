import { useEffect, useState } from "react";
import "./App.css";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Abi, ContractPromise } from "@polkadot/api-contract";
import metadata from "./metadata.json";
import { contractAddress, endpoint } from "./const";
import { getAccounts } from "./util";

import Resolver from "./Resolver";
import { Routes, Route } from "react-router-dom";
import { FormContainer, Loader } from "./components";
import { InjectedAccount } from "./types";

function App() {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [contract, setContract] = useState<ContractPromise>();
  const [accounts, setAccounts] = useState<InjectedAccount[]>();

  const isSignerStored = localStorage.getItem("link-signer") === "polkadot-js";

  useEffect(() => {
    const wsProvider = new WsProvider(endpoint);
    ApiPromise.create({ provider: wsProvider }).then((api) => setApi(api));
  }, []);

  useEffect(() => {
    if (!api || contract) return;
    const abi = api && new Abi(metadata, api.registry.getChainProperties());
    const c = new ContractPromise(api, abi, contractAddress);
    setContract(c);
  }, [api, contract]);

  useEffect(() => {
    if (isSignerStored) {
      getAccounts().then((acc) => setAccounts(acc));
    }
  }, [isSignerStored]);

  return api && contract ? (
    <Routes>
      <Route
        index
        element={
          <FormContainer
            api={api}
            contract={contract}
            accounts={accounts}
            setAccounts={setAccounts}
          />
        }
      />
      <Route
        path=":slug"
        element={<Resolver api={api} contract={contract} />}
      />
    </Routes>
  ) : (
    <Loader message="Loading app..." />
  );
}

export default App;
