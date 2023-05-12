import { Formik } from "formik";
import { initialPinkValues, PinkFormSchema } from "../const";
import { useSubmitHandler } from "../hooks";
import { Header } from "./Header";
import { SubmitResult } from "./SubmitResult";
import { GenerateForm } from "./GenerateForm";
import { useState } from "react";
import { Loader } from "./Loader";

export const PinkContainer = () => {
  const submitFn = useSubmitHandler();
  const [busyMessage, setBusyMessage] = useState<string>("");

  return (
    <div className="App">
      <Formik
        validateOnMount
        initialValues={initialPinkValues}
        validationSchema={PinkFormSchema}
        onSubmit={async (values, helpers) => {
          if (!helpers) return;

          try {
            setBusyMessage("Minting your NFT...");
            await submitFn(values, helpers);
          } catch (err) {
            // TODO do something
          } finally {
            setBusyMessage("");
            // TODO not ideal because the message will be lost during minting
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
                    <h2>Pink Robot</h2>
                    <br />
                    {finalized ? (
                      <SubmitResult
                        events={events}
                        errorMessage={errorMessage}
                      />
                    ) : (
                      <GenerateForm setIsBusy={setBusyMessage} />
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
