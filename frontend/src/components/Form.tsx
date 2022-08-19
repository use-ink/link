import { CostEstimations } from "./CostEstimations";
import { Form, Field, ErrorMessage, useFormikContext } from "formik";
import { Estimation, Values } from "../types";

interface Props {
  estimation: Estimation | undefined;
  setEstimation: React.Dispatch<React.SetStateAction<Estimation | undefined>>;
  address?: string;
}
export const UrlShortenerForm = ({ estimation, setEstimation }: Props) => {
  const { isSubmitting, isValid, values } = useFormikContext<Values>();

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
          <CostEstimations
            values={values}
            estimation={estimation}
            setEstimation={setEstimation}
          />
        )}
      </div>
      <div className="group">
        <button type="submit" disabled={isSubmitting} name="submit">
          Shorten
        </button>
        <ErrorMessage name="submit" component="div" className="error-message" />
      </div>
    </Form>
  );
};
