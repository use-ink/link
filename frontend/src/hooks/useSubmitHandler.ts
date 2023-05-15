import { web3Enable, web3FromAddress } from "@polkadot/extension-dapp";
import { Values, UIEvent } from "../types";
import { FormikHelpers } from "formik";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ContractSubmittableResult } from "@polkadot/api-contract/base/Contract";
import { useEstimationContext, useLinkContract } from "../contexts";
import { useApi, useWallet } from "useink";

export const useSubmitHandler = () => {
  const { api } = useApi("rococo-contracts-testnet");
  const { account } = useWallet();
  const { contract } = useLinkContract();
  const { estimation } = useEstimationContext();

  return async (
    values: Values,
    { setSubmitting, setStatus }: FormikHelpers<Values>
  ) => {
    if (!api || !contract || !estimation || !account) return;
    await web3Enable("link!");
    const injector = await web3FromAddress(account.address);
    try {
      const tx: SubmittableExtrinsic<"promise", ContractSubmittableResult> =
        contract.tx["shorten"](
          {
            gasLimit: estimation.gasRequired,
            storageDepositLimit: estimation.storageDeposit.asCharge,
          },
          { DeduplicateOrNew: values.alias },
          values.url
        );
      const unsub = await tx.signAndSend(
        account.address,
        { signer: injector.signer },
        (result) => {
          const events: UIEvent[] = [];
          let slug = "";
          setSubmitting(true);

          if (result.isInBlock) {
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
