import { Formik } from "formik";
import { initialPinkValues, PinkFormSchema } from "../const";
import { useSubmitHandler } from "../hooks";
import { Header } from "./Header";
import { SubmitResult } from "./SubmitResult";
import { GenerateForm } from "./GenerateForm";
import { useState } from "react";
import { Loader } from "./Loader";
import { Tab, Tabs } from "@mui/material";
import { GenerateCustomUploadForm } from "./GenerateCustomUploadForm";
import { ContractType } from "../types";
import { Error } from "./Error";

export const PinkContainer = () => {
  const submitFn = useSubmitHandler();
  const [busyMessage, setBusyMessage] = useState<string>("");
  const [tab, setTab] = useState<ContractType>(ContractType.PinkPsp34);
  const [error, setError] = useState<string>("");

  const notBusyAnymore = () => setBusyMessage("");
  const handleError = (error: string) => setError(error);
  const handleCloseError = () => setError("");

  const handleTabChange = (
    event: React.SyntheticEvent,
    newTab: ContractType
  ) => {
    if (newTab !== null) {
      setTab(newTab);
    }
  };

  return (
    <div className="App">
      <Formik
        validateOnMount
        initialValues={initialPinkValues}
        validationSchema={PinkFormSchema}
        onSubmit={async (values, helpers) => {
          if (!helpers) return;

          try {
            setBusyMessage("Minting your NFT on...");
            await submitFn(values, helpers);
          } catch (err: any) {
            setError(err.toString());
            notBusyAnymore();
          }
        }}
      >
        {({
          status: { finalized, events, errorMessage } = {},
          isSubmitting,
        }) => {
          return (
            <>
              <div
                className={`${busyMessage || isSubmitting ? "hide" : "show"}`}
              >
                <Header />
                <div className="content">
                  <div className="group">
                    <Tabs value={tab} onChange={handleTabChange} centered>
                      <Tab
                        label="Pink robot"
                        value={ContractType.PinkPsp34}
                        style={{ backgroundColor: "transparent" }}
                      />
                      <Tab
                        label="Custom image"
                        value={ContractType.CustomUpload34}
                        style={{ backgroundColor: "transparent" }}
                      />
                    </Tabs>
                  </div>
                  <div className="form-panel">
                    {finalized ? (
                      <SubmitResult
                        events={events}
                        errorMessage={errorMessage}
                        hideBusyMessage={notBusyAnymore}
                      />
                    ) : (
                      <>
                        {tab === ContractType.PinkPsp34 && (
                          <GenerateForm
                            setIsBusy={setBusyMessage}
                            handleError={handleError}
                          />
                        )}
                        {tab === ContractType.CustomUpload34 && (
                          <GenerateCustomUploadForm
                            setIsBusy={setBusyMessage}
                            handleError={handleError}
                          />
                        )}
                      </>
                    )}
                  </div>
                  <Error
                    open={!!error}
                    onClose={handleCloseError}
                    message={error}
                  />
                </div>
              </div>
              <div
                className={`${busyMessage || isSubmitting ? "show" : "hide"}`}
              >
                <Loader message={busyMessage} />
              </div>
            </>
          );
        }}
      </Formik>
    </div>
  );
};
