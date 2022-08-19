import { useEffect, useState } from "react";
import "./App.css";
import { getAccounts } from "./util";
import Resolver from "./Resolver";
import { Routes, Route } from "react-router-dom";
import { FormContainer, Loader } from "./components";
import { InjectedAccount } from "./types";
import { useChain } from "./contexts";

function App() {
  const [accounts, setAccounts] = useState<InjectedAccount[]>();
  const { api } = useChain();

  const isSignerStored = localStorage.getItem("link-signer") === "polkadot-js";

  useEffect(() => {
    if (isSignerStored) {
      getAccounts().then((acc) => setAccounts(acc));
    }
  }, [isSignerStored]);

  return api ? (
    <Routes>
      <Route
        index
        element={
          <FormContainer accounts={accounts} setAccounts={setAccounts} />
        }
      />
      <Route path=":slug" element={<Resolver />} />
    </Routes>
  ) : (
    <Loader message="Loading app..." />
  );
}

export default App;
