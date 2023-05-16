import { Formik } from "formik";
import { initialPinkValues, PinkFormSchema } from "../const";
import { useSubmitHandler } from "../hooks";
import { Header } from "./Header";
import { SubmitResult } from "./SubmitResult";
import { GenerateForm } from "./GenerateForm";
import { useState } from "react";
import { Loader } from "./Loader";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { GenerateCustomUploadForm } from "./GenerateCustomUploadForm";

export enum ContractType {
  PinkRobot = 0,
  Upload = 1,
}

export const PinkContainer = () => {
  const submitFn = useSubmitHandler();
  const [busyMessage, setBusyMessage] = useState<string>("");
  const [tab, setTab] = useState<ContractType>(ContractType.PinkRobot);

  const notBusyAnymore = () => setBusyMessage("");

  const handleTabChange = (
    event: React.MouseEvent<HTMLElement>,
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
          } catch (err) {
            // TODO do something - show error message
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
                  <div className="form-panel">
                    {finalized ? (
                      <SubmitResult
                        events={events}
                        errorMessage={errorMessage}
                        hideBusyMessage={notBusyAnymore}
                      />
                    ) : (
                      <>
                        <div className="group">
                          <ToggleButtonGroup
                            color="primary"
                            value={tab}
                            exclusive={true}
                            onChange={handleTabChange}
                          >
                            <ToggleButton value={ContractType.PinkRobot}>
                              Pink Robot
                            </ToggleButton>
                            <ToggleButton value={ContractType.Upload}>
                              Custom Image
                            </ToggleButton>
                          </ToggleButtonGroup>
                        </div>
                        { tab === ContractType.PinkRobot && <GenerateForm setIsBusy={setBusyMessage} />}
                        { tab === ContractType.Upload && <GenerateCustomUploadForm setIsBusy={setBusyMessage} />}
                      </>
                    )}
                  </div>
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
