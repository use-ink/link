import { DryRunResult } from "./DryRunResult";
import { Form, Field, ErrorMessage, useFormikContext } from "formik";
import { Values } from "../types";
import {
  useEstimationContext,
  useChain,
  useAccountsContext,
  useCallerContext,
} from "../contexts";
import { ChangeEvent, useEffect, useState } from "react";
import { NewUserGuide } from "./NewUserGuide";

export const UrlShortenerForm = () => {
  const { api } = useChain();
  const { isSubmitting, isValid, values, setFieldTouched, handleChange } =
    useFormikContext<Values>();
  const { estimation, isEstimating } = useEstimationContext();
  const { accounts, shouldAutoConnect, signer } = useAccountsContext();
  const { caller } = useCallerContext();
  const [hasFunds, setHasFunds] = useState(false);

  useEffect(() => {
    const getBalance = async () => {
      if (!api || !accounts || !caller) {
        setHasFunds(false);
        return;
      }
      const { freeBalance } = await api.derive.balances.account(caller.address);
      freeBalance.isEmpty || freeBalance.isZero()
        ? setHasFunds(false)
        : setHasFunds(true);
    };
    getBalance().catch((e) => console.error(e));
  }, [api, accounts, caller]);

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
          hasAccounts={!!accounts && accounts?.length > 0}
          hasFunds={hasFunds}
          walletConnected={shouldAutoConnect && !!signer}
          address={caller?.address}
        />
      </div>
    </Form>
  );
};
