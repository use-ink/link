import { useCallback, useEffect, useState } from "react";
import type { DispatchError } from "@polkadot/types/interfaces";
import { dryRunCallerAddress } from "../const";
import { useCallerContext, useChain } from "../contexts";
import { Estimation, ShorteningResult } from "../types";
import { ApiPromise } from "@polkadot/api";
import { BN } from "@polkadot/util";

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
  const [balance, setBalance] = useState<BN>();

  useEffect(() => {
    const getBalance = async () => {
      if (!api || !caller) return;
      const { freeBalance } = await api.derive.balances.account(caller.address);
      setBalance(freeBalance);
    };
    getBalance().catch((e) => console.error(e));
  }, [api, caller]);

  const estimate = useCallback(
    async function estimate(
      params: unknown[]
    ): Promise<Estimation | undefined> {
      try {
        if (!api || !contract) return;

        const { storageDeposit, gasRequired, result, output } =
          await contract.query["shorten"](
            dryRunCallerAddress,
            { gasLimit: -1 },
            ...params
          );

        const decodedOutput = (output?.toHuman() ?? {
          Err: "",
        }) as ShorteningResult;

        const tx = contract.tx["shorten"](
          {
            gasLimit: gasRequired,
            storageDepositLimit: storageDeposit.asCharge,
          },
          ...params
        );

        const { partialFee } = await tx.paymentInfo(dryRunCallerAddress);

        if (result.isErr) {
          return {
            gasRequired,
            storageDeposit,
            partialFee,
            result: decodedOutput,
            error: { message: decodeError(result.asErr, api) },
          };
        }

        if (result.isOk && "Err" in decodedOutput) {
          return {
            gasRequired,
            storageDeposit,
            partialFee,
            result: decodedOutput,
            error: {
              message:
                decodedOutput.Err === "SlugTooShort"
                  ? "The supplied slug is too short."
                  : "Slug unavailable. Try something else.",
            },
          };
        }

        return {
          gasRequired,
          storageDeposit,
          partialFee,
          result: decodedOutput,
          error: balance?.lt(storageDeposit.asCharge)
            ? { message: "Insufficient funds!" }
            : undefined,
        };
      } catch (e) {
        console.error(e);
      }
    },
    [api, balance, contract]
  );
  return estimate;
}
export { useDryRun };
