import linkLogo from "../link-logo.svg";
import { Formik } from "formik";
import { Estimation, InjectedAccount } from "../types";
import { initialValues, UrlShortenerSchema } from "../const";
import { useSubmitHandler } from "../util";
import { UrlShortenerForm } from "./Form";
import { useState } from "react";
import { ContractPromise } from "@polkadot/api-contract";
import { Header } from "./Header";
import { SubmitResult } from "./SubmitResult";
import { Loader } from ".";
import { useChain } from "../contexts";

interface Props {
  contract: ContractPromise;
  accounts?: InjectedAccount[];
  setAccounts: React.Dispatch<
    React.SetStateAction<InjectedAccount[] | undefined>
  >;
}

export const FormContainer = ({ contract, accounts, setAccounts }: Props) => {
  const [estimation, setEstimation] = useState<Estimation>();
  const [callerAddress, setCallerAddress] = useState<string>();
  const { api } = useChain();
  const submitFn = useSubmitHandler();
  return (
    <div className="App">
      <Formik
        initialValues={initialValues}
        validationSchema={UrlShortenerSchema}
        onSubmit={async (values, helpers) => {
          if (!estimation || !helpers || !api) return;
          if (callerAddress) {
            await submitFn(
              values,
              helpers,
              estimation,
              callerAddress,
              contract,
              api.registry
            );
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
