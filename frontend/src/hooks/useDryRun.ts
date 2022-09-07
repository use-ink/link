import { useCallback } from "react";
import type { DispatchError } from "@polkadot/types/interfaces";
import { dryRunCallerAddress } from "../const";
import { useCallerContext, useChain } from "../contexts";
import { Estimation, UIError, ShorteningResult } from "../types";
import { ApiPromise } from "@polkadot/api";

function decodeError(error: DispatchError, api: ApiPromise) {
  let message = "Unknown dispacth error";
  if (error.isModule) {
    const decoded = api?.registry.findMetaError(error.asModule);
    if (
      decoded.method === "StorageDepositLimitExhausted" ||
      decoded.method === "StorageDepositNotEnoughFunds"
    ) {
      message = "Not enough funds in the selected account.";
    } else {
      message = `${decoded?.section.toUpperCase()}.${decoded?.method}: ${
        decoded?.docs
      }`;
    }
  }
  return message;
}

function useDryRun() {
  const { caller } = useCallerContext();
  const { api, contract } = useChain();

  const estimate = useCallback(
    async function estimate(params: unknown[]): Promise<Estimation | UIError> {
      try {
        if (!api || !contract)
          return {
            message: "Not connected to Rococo or contract not found",
          };

        const { storageDeposit, gasRequired, result, output } =
          await contract.query["shorten"](
            caller?.address || dryRunCallerAddress,
            { gasLimit: -1 },
            ...params
          );

        const decodedOutput = output?.toHuman() as ShorteningResult;

        if (result.isErr) {
          return {
            message: decodeError(result.asErr, api),
          };
        }

        if (result.isOk && "Err" in decodedOutput) {
          return {
            message: "Slug unavailable. Try something else",
          };
        }

        const tx = contract.tx["shorten"](
          {
            gasLimit: gasRequired,
            storageDepositLimit: storageDeposit.asCharge,
          },
          ...params
        );

        const { partialFee } = await tx.paymentInfo(
          caller?.address || dryRunCallerAddress
        );

        return {
          gasRequired,
          storageDeposit,
          partialFee,
          result: decodedOutput,
        };
      } catch (e) {
        return {
          message: `${e}`,
        };
      }
    },
    [api, caller?.address, contract]
  );
  return estimate;
}
export { useDryRun };
