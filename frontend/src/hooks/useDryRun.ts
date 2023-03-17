import { useCallback, useEffect, useState } from "react";
import type {
  DispatchError,
  ContractExecResult,
} from "@polkadot/types/interfaces";
import { dryRunCallerAddress } from "../const";
import { Estimation } from "../types";
import { ApiPromise } from "@polkadot/api";
import { BN } from "@polkadot/util";
import { getDecodedOutput } from "../helpers";
import { useApi, useExtension } from "useink";
import { useLinkContract } from "../contexts";

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
  const { account } = useExtension();
  const { api } = useApi();
  const { contract } = useLinkContract();
  const [balance, setBalance] = useState<BN>();

  useEffect(() => {
    const getBalance = async () => {
      if (!api || !account) return;
      const { freeBalance } = await api.derive.balances.account(
        account.address
      );
      setBalance(freeBalance);
    };
    getBalance().catch((e) => console.error(e));
  }, [api, account]);

  const estimate = useCallback(
    async function estimate(
      params: unknown[]
    ): Promise<Estimation | undefined> {
      try {
        if (!api || !contract) return;
        const message = contract.abi.findMessage("shorten");
        const inputData = message.toU8a(params);

        const { storageDeposit, gasRequired, result } =
          await api.call.contractsApi.call<ContractExecResult>(
            account?.address,
            contract.address,
            0,
            null,
            null,
            inputData
          );

        const decodedOutput = getDecodedOutput(
          result,
          message.returnType,
          contract.abi.registry
        );

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
            result: decodedOutput!,
            error: { message: decodeError(result.asErr, api) },
          };
        }

        if (result.isOk && decodedOutput && "Err" in decodedOutput) {
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
          result: decodedOutput!,
          error: balance?.lt(storageDeposit.asCharge)
            ? { message: "Insufficient funds!" }
            : undefined,
        };
      } catch (e) {
        console.error(e);
      }
    },
    [api, balance, account?.address, contract]
  );
  return estimate;
}
export { useDryRun };
