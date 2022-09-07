import { CostEstimations } from "./CostEstimations";
import { Form, Field, ErrorMessage, useFormikContext } from "formik";
import { Values } from "../types";
import { useEstimationContext } from "../contexts";

export const UrlShortenerForm = () => {
  const { isSubmitting, isValid, values } = useFormikContext<Values>();
  const { estimation } = useEstimationContext();

  const isOkToShorten =
    estimation &&
    "result" in estimation &&
    "Ok" in estimation.result &&
    estimation.result.Ok === "Shortened";

  return (
    <Form>
      <div className="group">
        <Field
          type="text"
          name="url"
          disabled={isSubmitting}
          placeholder="Url to shorten"
        />
        <ErrorMessage name="url" component="div" className="error-message" />
      </div>
      <div className="group">
        <Field type="text" name="alias" disabled={isSubmitting} />
        <ErrorMessage name="alias" component="div" className="error-message" />
      </div>
      <div className="group">
        {isValid && values.url && (
          <CostEstimations values={values} isValid={isValid} />
        )}
      </div>
      <div className="group">
        <button
          type="submit"
          disabled={isSubmitting || !isOkToShorten || !isValid}
          name="submit"
        >
          Shorten
        </button>
        <ErrorMessage name="submit" component="div" className="error-message" />
      </div>
    </Form>
  );
};
