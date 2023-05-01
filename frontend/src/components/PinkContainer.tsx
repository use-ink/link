import { Formik } from "formik";
import { initialValues, UrlShortenerSchema } from "../const";
import { useSubmitHandler } from "../hooks";
import { Header } from "./Header";
import { SubmitResult } from "./SubmitResult";
import { GenerateForm } from "./GenerateForm";

export const PinkContainer = () => {
  const submitFn = useSubmitHandler();

  return (
    <div className="App">
      <Formik
        initialValues={initialValues}
        validationSchema={UrlShortenerSchema}
        onSubmit={async (values, helpers) => {
          if (!helpers) return;
          await submitFn(values, helpers);
        }}
      >
        {({
          status: { finalized, events, slug, errorMessage } = {},
          isSubmitting,
        }) => {
          return (
            <>
              <Header />
              <div className="content">
                <div className="form-panel">
                  <h2>Describe pink robot</h2>
                  <br />
                  {finalized ? (
                    <SubmitResult
                      events={events}
                      slug={slug}
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
