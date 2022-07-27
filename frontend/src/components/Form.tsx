import { CostEstimations } from "./CostEstimations";
import { Form, Field, ErrorMessage, useFormikContext } from "formik";
import { Estimation, Values } from "../types";
import { ApiPromise } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";

interface Props {
  api: ApiPromise;
  contract: ContractPromise;
  estimation: Estimation | undefined;
  setEstimation: React.Dispatch<React.SetStateAction<Estimation | undefined>>;
}
export const UrlShortenerForm = ({
  api,
  contract,
  estimation,
  setEstimation,
}: Props) => {
  const { isSubmitting, isValid, values } = useFormikContext<Values>();
  return (
    <Form>
      <div className="group">
        <Field type="text" name="url" disabled={isSubmitting} />
        <ErrorMessage name="url" component="div" className="error-message" />
      </div>
      <div className="group">
        <Field type="text" name="alias" disabled={isSubmitting} />
        <ErrorMessage name="alias" component="div" className="error-message" />
      </div>
      <div className="group">
        {isSubmitting ? (
          <div>Loading</div>
        ) : (
          isValid &&
          api &&
          contract &&
          values.url && (
            <CostEstimations
              registry={api.registry}
              contract={contract}
              values={values}
              estimation={estimation}
              setEstimation={setEstimation}
            />
          )
        )}
      </div>
      <button type="submit" disabled={isSubmitting}>
        Shorten
      </button>
    </Form>
  );
};
