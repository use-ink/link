import linkLogo from "../link-logo.svg";
import { Formik } from "formik";
import { InjectedAccount } from "../types";
import { initialValues, UrlShortenerSchema } from "../const";
import { useSubmitHandler } from "../util";
import { UrlShortenerForm } from "./Form";
import { useState } from "react";
import { Header } from "./Header";
import { SubmitResult } from "./SubmitResult";
import { Loader } from ".";
import { useEstimationContext } from "../contexts";

interface Props {
  accounts?: InjectedAccount[];
  setAccounts: React.Dispatch<
    React.SetStateAction<InjectedAccount[] | undefined>
  >;
}

export const FormContainer = ({ accounts, setAccounts }: Props) => {
  const [callerAddress, setCallerAddress] = useState<string>();
  const submitFn = useSubmitHandler();
  const { estimation } = useEstimationContext();

  return (
    <div className="App">
      <Formik
        initialValues={initialValues}
        validationSchema={UrlShortenerSchema}
        onSubmit={async (values, helpers) => {
          if (!estimation || !helpers) return;
          if (callerAddress) {
            await submitFn(values, helpers, estimation, callerAddress);
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
                    <UrlShortenerForm />
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
