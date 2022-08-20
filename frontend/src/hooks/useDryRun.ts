import { dryRunCallerAddress } from "../const";
import { useChain } from "../contexts";

function useDryRun() {
  const { api, contract } = useChain();

  return async function estimate(params: unknown[]) {
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
      if (result.isOk)
        return {
          gasRequired,
          storageDeposit,
        };
    } catch (e) {
      console.error(e);
    }
  };
}
export { useDryRun };
