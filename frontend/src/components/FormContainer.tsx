import linkLogo from "../link-logo.svg";
import { Formik } from "formik";
import { UIEvent, Estimation } from "../types";
import { initialValues, UrlShortenerSchema } from "../const";
import { Link } from "react-router-dom";
import { createSubmitHandler } from "../util";
import { UrlShortenerForm } from "./Form";
import { useState } from "react";
import { ApiPromise } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import { Header } from "./Header";

interface Props {
  api: ApiPromise;
  contract: ContractPromise;
}

export const FormContainer = ({ api, contract }: Props) => {
  const [estimation, setEstimation] = useState<Estimation>();

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
              if (!estimation || !helpers) return;
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
              ) : (
                <UrlShortenerForm
                  api={api}
                  contract={contract}
                  estimation={estimation}
                  setEstimation={setEstimation}
                />
              )
            }
          </Formik>
        </div>
      </div>
    </div>
  );
};
