import linkLogo from "../link-logo.svg";
import { Formik } from "formik";
import { Estimation, InjectedAccount } from "../types";
import { initialValues, UrlShortenerSchema } from "../const";
import { createSubmitHandler } from "../util";
import { UrlShortenerForm } from "./Form";
import { useState } from "react";
import { ApiPromise } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import { Header } from "./Header";
import { SubmitResult } from "./SubmitResult";
import { Loader } from ".";

interface Props {
  api: ApiPromise;
  contract: ContractPromise;
  accounts?: InjectedAccount[];
  setAccounts: React.Dispatch<
    React.SetStateAction<InjectedAccount[] | undefined>
  >;
}

export const FormContainer = ({
  api,
  contract,
  accounts,
  setAccounts,
}: Props) => {
  const [estimation, setEstimation] = useState<Estimation>();
  const [callerAddress, setCallerAddress] = useState<string>();
  return (
    <div className="App">
      <Formik
        initialValues={initialValues}
        validationSchema={UrlShortenerSchema}
        onSubmit={async (values, helpers) => {
          if (!estimation || !helpers) return;
          if (callerAddress) {
            const submitFn = createSubmitHandler(
              contract,
              estimation,
              api.registry,
              callerAddress
            );
            await submitFn(values, helpers);
          } else {
            helpers.setErrors({
              alias: "No accounts found. Connect signer extension.",
            });
          }
        }}
      >
        {({
          status: { finalized, events, slug, errorMessage } = {},
          isSubmitting,
        }) => {
          return isSubmitting ? (
            <Loader message="Submitting transaction..." />
          ) : (
            <>
              <Header
                setAddress={setCallerAddress}
                accounts={accounts}
                setAccounts={setAccounts}
              />
              <div className="content">
                <div className="form-panel">
                  <img src={linkLogo} className="link-logo" alt="logo" />{" "}
                  {finalized ? (
                    <SubmitResult
                      events={events}
                      slug={slug}
                      errorMessage={errorMessage}
                    />
                  ) : (
                    <UrlShortenerForm
                      api={api}
                      contract={contract}
                      estimation={estimation}
                      setEstimation={setEstimation}
                      address={callerAddress}
                    />
                  )}
                </div>
              </div>
            </>
          );
        }}
      </Formik>
    </div>
  );
};
