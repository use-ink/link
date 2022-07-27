import { BN } from "bn.js";
import { ContractPromise } from "@polkadot/api-contract";
import { web3FromAddress } from "@polkadot/extension-dapp";
import { Registry } from "@polkadot/types/types";
import { Estimation, Values, UIEvent } from "../types";
import { FormikHelpers } from "formik";
import { callerAddress } from "../const";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ContractSubmittableResult } from "@polkadot/api-contract/base/Contract";

export const createSubmitHandler =
  (contract: ContractPromise, estimation: Estimation, registry: Registry) =>
  async (
    values: Values,
    { setSubmitting, setStatus }: FormikHelpers<Values>
  ) => {
    console.log("submitting");
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
            if (!result.isError) {
              setStatus({ finalized: true, events, error: null, slug });
            } else {
              let message = "Unknown Error";
              if (result.dispatchError?.isModule) {
                const decoded = registry.findMetaError(
                  result.dispatchError.asModule
                );
                message = `${decoded.section.toUpperCase()}.${
                  decoded.method
                }: ${decoded.docs}`;
                console.log(message);
              }
              setStatus({
                finalized: true,
                events,
                error: new Error(message),
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
