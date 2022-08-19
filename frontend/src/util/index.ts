import { BN } from "bn.js";
import {
  web3FromAddress,
  web3Enable,
  web3Accounts,
} from "@polkadot/extension-dapp";
import { Estimation, Values, UIEvent } from "../types";
import { FormikHelpers } from "formik";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ContractSubmittableResult } from "@polkadot/api-contract/base/Contract";
import { useChain } from "../contexts";

export const useSubmitHandler = () => {
  const { api, contract } = useChain();

  return async (
    values: Values,
    { setSubmitting, setStatus }: FormikHelpers<Values>,
    estimation: Estimation,
    callerAddress: string
  ) => {
    if (!api || !contract) return;

    const injector = await web3FromAddress(callerAddress);
    try {
      const tx: SubmittableExtrinsic<"promise", ContractSubmittableResult> =
        contract.tx["shorten"](
          {
            gasLimit: new BN(estimation.gasRequired).addn(1),
            storageDepositLimit: estimation.storageDeposit.asCharge,
          },
          { DeduplicateOrNew: values.alias },
          values.url
        );
      const unsub = await tx.signAndSend(
        callerAddress,
        { signer: injector.signer },
        async (result) => {
          const events: UIEvent[] = [];
          let slug = "";
          setSubmitting(true);

          if (result.isFinalized) {
            result.contractEvents?.forEach(({ event, args }) => {
              slug = args[0].toHuman()?.toString() || "";
              events.push({
                name: event.identifier,
                message: `${event.docs.join()}`,
              });
            });
            result.events.forEach(({ event }) => {
              let message = "";
              if (event.section === "balances") {
                const data = event.data.toHuman() as {
                  who: string;
                  amount: string;
                };

                message = `Amount: ${data.amount}`;
              }
              event.method !== "ContractEmitted" &&
                events.push({
                  name: `${event.section}:${event.method}`,
                  message,
                });
            });
            if (!result.dispatchError) {
              setStatus({ finalized: true, events, errorMessage: "", slug });
            } else {
              let message = "Unknown Error";
              if (result.dispatchError.isModule) {
                const decoded = api.registry.findMetaError(
                  result.dispatchError.asModule
                );
                message = `${decoded.section.toUpperCase()}.${
                  decoded.method
                }: ${decoded.docs}`;
              }
              setStatus({
                finalized: true,
                events,
                errorMessage: message,
              });
            }
            setSubmitting(false);
            unsub && unsub();
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  };
};

export const getAccounts = async () => {
  const extensions = await web3Enable("link-url-shortener");
  const supportedExtension = extensions.find((e) => e.name === "polkadot-js");
  const isSignerStored = localStorage.getItem("link-signer") === "polkadot-js";
  let accounts;

  if (supportedExtension) {
    accounts = await web3Accounts();
    !isSignerStored && localStorage.setItem("link-signer", "polkadot-js");
  }

  return accounts;
};
