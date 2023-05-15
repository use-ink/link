import { DryRunResult } from "./DryRunResult";
import { Form, Field, ErrorMessage, useFormikContext } from "formik";
import { Values } from "../types";
import { useEstimationContext } from "../contexts";
import { ChangeEvent } from "react";
import { NewUserGuide } from "./NewUserGuide";
import { useBalance, useWallet } from "useink";

export const UrlShortenerForm = () => {
  const { isSubmitting, isValid, values, setFieldTouched, handleChange } =
    useFormikContext<Values>();
  const { estimation, isEstimating } = useEstimationContext();
  const { account, accounts } = useWallet();
  const balance = useBalance(account);
  const hasFunds =
    !balance?.freeBalance.isEmpty && !balance?.freeBalance.isZero();

  const isOkToShorten =
    !isEstimating &&
    estimation &&
    estimation.result &&
    "Ok" in estimation.result &&
    estimation.result.Ok === "Shortened";

  return (
    <Form>
      <div className="group">
        <Field
          type="text"
          name="url"
          disabled={isSubmitting}
          placeholder="Paste an URL to get cost estimations"
          onChange={(e: ChangeEvent) => {
            setFieldTouched("url");
            handleChange(e);
          }}
        />
        <ErrorMessage name="url" component="div" className="error-message" />
      </div>
      <div className="group">
        <Field
          type="text"
          name="alias"
          disabled={isSubmitting}
          onChange={(e: ChangeEvent) => {
            setFieldTouched("alias");
            handleChange(e);
          }}
        />
        <ErrorMessage name="alias" component="div" className="error-message" />
      </div>
      <div className="group">
        {isValid && values.url && (
          <DryRunResult values={values} isValid={isValid} />
        )}
      </div>
      <div className="group">
        <button
          type="submit"
          disabled={
            isSubmitting || !isOkToShorten || !isValid || !accounts || !hasFunds
          }
          name="submit"
        >
          Shorten
        </button>
      </div>
      {isValid && estimation?.error && !isEstimating && (
        <div className="text-xs text-left mb-2 text-red-500">
          {estimation.error.message}
        </div>
      )}
      <div className="group">
        <NewUserGuide
          hasAccounts={!!accounts && accounts.length > 0}
          hasFunds={hasFunds}
          walletConnected={!!account}
        />
      </div>
    </Form>
  );
};
