import { Formik } from "formik";
import { initialPinkValues, PinkFormSchema } from "../const";
import { useSubmitHandler } from "../hooks";
import { Header } from "./Header";
import { SubmitResult } from "./SubmitResult";
import { GenerateForm } from "./GenerateForm";

export const PinkContainer = () => {
  const submitFn = useSubmitHandler();

  return (
    <div className="App">
      <Formik
        initialValues={initialPinkValues}
        validationSchema={PinkFormSchema}
        onSubmit={async (values, helpers) => {
          if (!helpers) return;
          await submitFn(values, helpers);
        }}
      >
        {({
          status: { finalized, events, errorMessage } = {},
          isSubmitting,
        }) => {
          return (
            <>
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
                    <GenerateForm />
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
