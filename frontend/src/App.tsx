import { useEffect, useState } from "react";
import "./App.css";
import { Abi, ContractPromise } from "@polkadot/api-contract";
import metadata from "./metadata.json";
import { contractAddress } from "./const";
import { getAccounts } from "./util";

import Resolver from "./Resolver";
import { Routes, Route } from "react-router-dom";
import { FormContainer, Loader } from "./components";
import { InjectedAccount } from "./types";
import { useChain } from "./contexts";

function App() {
  const [contract, setContract] = useState<ContractPromise>();
  const [accounts, setAccounts] = useState<InjectedAccount[]>();
  const { api } = useChain();

  const isSignerStored = localStorage.getItem("link-signer") === "polkadot-js";

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
            contract={contract}
            accounts={accounts}
            setAccounts={setAccounts}
          />
        }
      />
      <Route path=":slug" element={<Resolver contract={contract} />} />
    </Routes>
  ) : (
    <Loader message="Loading app..." />
  );
}

export default App;
