import { useEffect, useState } from "react";
import "./App.css";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Abi, ContractPromise } from "@polkadot/api-contract";
import { web3Enable, web3Accounts } from "@polkadot/extension-dapp";
import metadata from "./metadata.json";
import { keyring } from "@polkadot/ui-keyring";
import { contractAddress, endpoint } from "./const";
import Resolver from "./Resolver";
import { Routes, Route } from "react-router-dom";
import { FormContainer, Loader } from "./components";

let keyringLoadAll = false;

function App() {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [contract, setContract] = useState<ContractPromise>();

  useEffect(() => {
    const wsProvider = new WsProvider(endpoint);
    ApiPromise.create({ provider: wsProvider }).then((api) => setApi(api));
  }, []);

  useEffect(() => {
    const loadAccounts = async () => {
      await web3Enable("link-url-shortener");
      let allAccounts = await web3Accounts();
      allAccounts = allAccounts.map(({ address, meta }) => ({
        address,
        meta: { ...meta, name: `${meta.name} (${meta.source})` },
      }));
      keyring.loadAll({ isDevelopment: false }, allAccounts);
    };
    if (!keyringLoadAll) {
      keyringLoadAll = true;
      loadAccounts().catch((e) => console.error(e));
    }
  }, []);

  useEffect(() => {
    if (!api || contract) return;
    const abi = api && new Abi(metadata, api.registry.getChainProperties());
    const c = new ContractPromise(api, abi, contractAddress);
    setContract(c);
  }, [api, contract]);

  return api && contract ? (
    <Routes>
      <Route index element={<FormContainer api={api} contract={contract} />} />
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
