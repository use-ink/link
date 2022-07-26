import { useEffect, useState } from "react";
import "./App.css";
import linkLogo from "./link-logo.svg";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Abi, ContractPromise } from "@polkadot/api-contract";
import metadata from "./metadata.json";
import { Header, LinksOverview, CostEstimations } from "./components";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Estimation } from "./types";
import {
  initialValues,
  contractAddress,
  endpoint,
  UrlShortenerSchema,
} from "./const";

function App() {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [index, setIndex] = useState();
  const [contract, setContract] = useState<ContractPromise>();
  const [estimation, setEstimation] = useState<Estimation>();
  const indexFromTabs = (index: any) => {
    setIndex(index);
  };

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

  return (
    <div className="App">
      <Header indexFromTabs={indexFromTabs} />
      <div className="content">
        {index === 0 ? (
          <div className="form-panel">
            <img src={linkLogo} className="link-logo" alt="logo" />
            <Formik
              initialValues={initialValues}
              validationSchema={UrlShortenerSchema}
              onSubmit={(values, { setSubmitting }) => {
                console.log(values);
                setSubmitting(false);
              }}
            >
              {({ isSubmitting, isValid, values }) => (
                <Form>
                  <div className="group">
                    <Field type="text" name="url" />
                    <ErrorMessage
                      name="url"
                      component="div"
                      className="error-message"
                    />
                  </div>
                  <div className="group">
                    <Field type="text" name="alias" />
                    <ErrorMessage
                      name="alias"
                      component="div"
                      className="error-message"
                    />
                  </div>
                  <div className="group">
                    {isValid && contract && (
                      <CostEstimations
                        contract={contract}
                        values={values}
                        estimation={estimation}
                        setEstimation={setEstimation}
                      />
                    )}
                  </div>
                  <button type="submit" disabled={isSubmitting}>
                    Shorten
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        ) : (
          <LinksOverview />
        )}
      </div>
    </div>
  );
}

export default App;
