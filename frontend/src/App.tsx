import { useEffect, useState } from "react";
import "./App.css";
import linkLogo from "./link-logo.svg";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Abi, ContractPromise } from "@polkadot/api-contract";

import { web3Enable, web3Accounts } from "@polkadot/extension-dapp";
import metadata from "./metadata.json";
import { Header } from "./components";
import { Formik } from "formik";
import { Estimation, UIEvent } from "./types";
import { keyring } from "@polkadot/ui-keyring";

import {
  initialValues,
  contractAddress,
  endpoint,
  UrlShortenerSchema,
} from "./const";
import { Link } from "react-router-dom";
import { createSubmitHandler } from "./util";
import { UrlShortenerForm } from "./components/Form";

let keyringLoadAll = false;

function App() {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [contract, setContract] = useState<ContractPromise>();
  const [estimation, setEstimation] = useState<Estimation>();

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

  return (
    <div className="App">
      <Header />
      <div className="content">
        <div className="form-panel">
          <img src={linkLogo} className="link-logo" alt="logo" />
          <Formik
            initialValues={initialValues}
            validationSchema={UrlShortenerSchema}
            onSubmit={async (values, helpers) => {
              if (!api || !contract || !estimation || !helpers) return;
              const submitFn = createSubmitHandler(
                contract,
                estimation,
                api.registry
              );
              await submitFn(values, helpers);
            }}
          >
            {({ status: { finalized, events, slug } = {} }) =>
              finalized ? (
                <div>
                  {slug && (
                    <Link
                      to={`/${slug}`}
                    >{`${window.location.host}/${slug}`}</Link>
                  )}
                  {events.map((ev: UIEvent, index: number) => {
                    return (
                      <div key={`${ev.name}-${index}`}>
                        <div>{ev.name}</div>
                        <div>{ev.message}</div>
                      </div>
                    );
                  })}
                </div>
              ) : api && contract ? (
                <UrlShortenerForm
                  api={api}
                  contract={contract}
                  estimation={estimation}
                  setEstimation={setEstimation}
                />
              ) : null
            }
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default App;
