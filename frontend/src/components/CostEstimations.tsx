import { ContractPromise } from "@polkadot/api-contract";
import { Registry } from "@polkadot/types/types";
import { useEffect } from "react";
import { dryRunCallerAddress } from "../const";
import { Values, Estimation } from "../types";

interface Props {
  contract: ContractPromise;
  values: Values;
  estimation: Estimation | undefined;
  setEstimation: React.Dispatch<React.SetStateAction<Estimation | undefined>>;
  registry: Registry;
}

export function CostEstimations({
  contract,
  values,
  estimation,
  setEstimation,
  registry,
}: Props) {
  useEffect(() => {
    if (!values.url || !values.alias) return;

    const params = [{ deduplicateornew: values.alias }, values.url];

    contract.query["shorten"](
      dryRunCallerAddress,
      { gasLimit: -1, storageDepositLimit: null },
      ...params
    )
      .then(({ storageDeposit, gasRequired, result }) => {
        if (result.isErr && result.asErr.isModule) {
          const decoded = registry.findMetaError(result.asErr.asModule);
          console.error(
            `${decoded.section.toUpperCase()}.${decoded.method}: ${
              decoded.docs
            }`
          );
        }
        result.isOk &&
          setEstimation({
            gasRequired,
            storageDeposit,
          });
      })
      .catch((e) => console.log(e));
  }, [contract.query, registry, setEstimation, values.alias, values.url]);

  return estimation ? (
    <div className="estimations">
      <p>storage deposit: {estimation.storageDeposit.asCharge.toHuman()}</p>
      <p>gas required: {estimation.gasRequired.toHuman()}</p>
    </div>
  ) : null;
}
