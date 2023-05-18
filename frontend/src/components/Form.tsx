import { DryRunResult } from "./DryRunResult";
import { Form, Field, ErrorMessage, useFormikContext } from "formik";
import { Values } from "../types";
import { ChangeEvent } from "react";
import { NewUserGuide } from "./NewUserGuide";
import { useLinkContract, useUI } from "../hooks";
import { pickDecoded, pickDecodedError, pickError } from "useink/utils";
import { useWallet } from "useink";
import { Button } from "./Button";

export const UrlShortenerForm = () => {
  const { isSubmitting, isValid, values, setFieldTouched, handleChange } = useFormikContext<Values>();
  const { shortenDryRun, link } = useLinkContract();
  const { account } = useWallet();
  const { setShowConnectWallet } = useUI();

  // The contract we are using was built with ink! v3 so we must fetch the decoded value
  // using `pickDecoded()` even though the `shorten` message returns a Result<T, E> in the
  // Rust code. The compiled Wasm, however, returns `T`. Starting in ink! v4 all messages
  // that returns a Result<T, E> in Rust will compile to Wasm that returns a decoded
  // JavaScript object of the same shape: `{ Ok: T } | { Err: E }`. In these cases we can use the helper
  // funtions `pickResultOk()` and `pickResultErr()`.
  // See https://github.com/paritytech/ink/pull/1525
  const decoded = pickDecoded(shortenDryRun?.result);
  const runtimeError = pickError(shortenDryRun?.result);

  return (
    <Form>
      <div className="group">
        <Field
          type="text"
          name="url"
          disabled={isSubmitting}
          placeholder="Paste a URL to get cost estimations"
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
        {isValid && values.url && <DryRunResult values={values} />}
      </div>

      <div className="group">
        {account ? (
          <Button
            type="submit"
            disabled={isSubmitting || decoded !== 'Shortened' || !isValid}
          >
            Shorten
          </Button>
        ) : (
          <Button onClick={() => setShowConnectWallet(true)}>
            Connect Wallet
          </Button>
        )}
      </div>

      {runtimeError && link && (
        <div className="text-xs text-left mb-2 text-red-500">
          {pickDecodedError(
            shortenDryRun, 
            link, 
            {
              ContractTrapped: 'Unable to complete transaction.',
              StorageDepositLimitExhausted: 'Not enough funds in the selected account.',
              StorageDepositNotEnoughFunds: 'Not enough funds in the selected account.',
            },
            'Something went wrong.',
          )}
        </div>
      )}

      <div className="group">
        <NewUserGuide />
      </div>
    </Form>
  );
};
