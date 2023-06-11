import { Formik } from "formik";
import { connectedNetwork, initialPinkValues, PinkFormSchema } from "../const";
import { useMintHandler, useUI } from "../hooks";
import { Header } from "./Header";
import { SubmitResult } from "./SubmitResult";
import { GenerateForm } from "./GenerateForm";
import { useState } from "react";
import { Loader } from "./Loader";
import { GenerateCustomUploadForm } from "./GenerateCustomUploadForm";
import { ContractType } from "../types";
import { Error } from "./Error";
import { ConnectWallet } from "./ConnectWallet";
// import { PinkTabs } from "./PinkTabs";

export const PinkContainer = () => {
  const submitFn = useMintHandler();
  const { showConnectWallet, setShowConnectWallet } = useUI();
  const [busyMessage, setBusyMessage] = useState<string>("");
  const [tab, setTab] = useState<ContractType>(ContractType.PinkPsp34);
  const [error, setError] = useState<string>("");

  const notBusyAnymore = () => setBusyMessage("");
  const handleError = (error: string) => setError(error);
  const handleCloseError = () => setError("");

  return (
    <div className="App">
      <ConnectWallet show={showConnectWallet} onClose={() => setShowConnectWallet(false)} />
      <Formik
        validateOnMount
        initialValues={initialPinkValues}
        validationSchema={PinkFormSchema}
        onSubmit={async (values, helpers) => {
          if (!helpers) return;

          try {
            setBusyMessage(`Minting your NFT on ${connectedNetwork}...`);
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
                  {/* <div className="group">
                    <PinkTabs tab={tab} setTab={setTab} />
                  </div> */}
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
