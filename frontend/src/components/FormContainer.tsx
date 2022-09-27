import linkLogo from "../link-logo.svg";
import { Formik } from "formik";
import { initialValues, UrlShortenerSchema } from "../const";
import { useSubmitHandler } from "../hooks";
import { UrlShortenerForm } from "./Form";
import { Header } from "./Header";
import { SubmitResult } from "./SubmitResult";
import { Loader } from ".";

export const FormContainer = () => {
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
          return isSubmitting ? (
            <Loader message="Submitting transaction..." />
          ) : (
            <>
              <Header />
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
