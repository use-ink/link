import { useCallback, useEffect, useState } from "react";
import type {
  DispatchError,
  ContractExecResult,
  Balance,
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

        // get price
        const priceMessage = contract.abi.findMessage("getPrice");
        const { result: mintResult } = await api.call.contractsApi.call<ContractExecResult>(
            account?.address,
            contract.address,
            0,
            null,
            null,
            priceMessage.toU8a([]),
          );
        console.log("mintResult value", mintResult.value.toJSON());
        const price = mintResult.value.toHuman();

        // dry run pink_mint to get gasRequired and storageDeposit
        const message = contract.abi.findMessage("pinkMint");
        console.log("params", params);
        console.log("message", message);
        const inputData = message.toU8a(params);
        console.log("inputData", inputData);

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

        const tx = contract.tx["pinkMint"](
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
            price: price,
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
          price: price,
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
