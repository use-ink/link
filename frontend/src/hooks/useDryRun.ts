import { useCallback } from "react";
import { dryRunCallerAddress } from "../const";
import { useChain } from "../contexts";
import { Estimation } from "../types";

function useDryRun() {
  const { api, contract } = useChain();

  const estimate = useCallback(
    async function estimate(
      params: unknown[]
    ): Promise<Estimation | undefined> {
      if (!contract) return;
      try {
        const { storageDeposit, gasRequired, result } = await contract.query[
          "shorten"
        ](
          dryRunCallerAddress,
          { gasLimit: -1, storageDepositLimit: null },
          ...params
        );
        if (result.isErr && result.asErr.isModule) {
          const decoded = api?.registry.findMetaError(result.asErr.asModule);
          console.error(
            `${decoded?.section.toUpperCase()}.${decoded?.method}: ${
              decoded?.docs
            }`
          );
        }
        if (result.isOk) {
          const tx = contract.tx["shorten"](
            {
              gasLimit: gasRequired,
              storageDepositLimit: storageDeposit.asCharge,
            },
            ...params
          );

          const { partialFee } = await tx.paymentInfo(dryRunCallerAddress);

          return {
            gasRequired,
            storageDeposit,
            partialFee,
          };
        }
      } catch (e) {
        console.error(e);
      }
    },
    [api?.registry, contract]
  );
  return estimate;
}
export { useDryRun };
