import { web3FromAddress } from "@polkadot/extension-dapp";
import { PinkValues, UIEvent } from "../types";
import { FormikHelpers } from "formik";
import { ApiBase, SubmittableExtrinsic } from "@polkadot/api/types";
import { ContractSubmittableResult } from "@polkadot/api-contract/base/Contract";
import { useEstimationContext, useLinkContract } from "../contexts";
import { useApi, useExtension } from "useink";
import { ApiPromise } from "@polkadot/api";
import { WeightV2 } from "@polkadot/types/interfaces";

const doubleGasLimit = (
  api: ApiPromise | ApiBase<'promise'>,
  weight: WeightV2
): WeightV2 => {
  return api.registry.createType('WeightV2', {
    refTime: weight.refTime.toBn().muln(2),
    proofSize: weight.proofSize.toBn().muln(2),
  }) as WeightV2;
};

export const useSubmitHandler = () => {
  const { api } = useApi();
  const { account } = useExtension();
  const { contract } = useLinkContract();
  const { estimation } = useEstimationContext();

  return async (
    values: PinkValues,
    { setSubmitting, setStatus }: FormikHelpers<PinkValues>
  ) => {
    if (!api || !contract || !estimation || !account) return;

    const injector = await web3FromAddress(account.address);
    console.log("PinkValues", values);
    console.log("Estimations", estimation);
    console.log("Estimations.storageDeposit", estimation.storageDeposit.asCharge.toNumber());

    // const newLimit = doubleGasLimit(api, estimation.gasRequired);

    try {
      const tx: SubmittableExtrinsic<"promise", ContractSubmittableResult> =
        contract.tx["pinkMint"](
          {
            gasLimit: estimation.gasRequired,
            storageDepositLimit: estimation.storageDeposit.asCharge,
            value: estimation.price,
          },
          values.contractType,
          values.ipfs
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
                message = `${decoded.section.toUpperCase()}.${decoded.method
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
