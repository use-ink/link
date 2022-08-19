import { useEffect } from "react";
import { dryRunCallerAddress } from "../const";
import { useChain } from "../contexts";
import { Values, Estimation } from "../types";

interface Props {
  values: Values;
  estimation: Estimation | undefined;
  setEstimation: React.Dispatch<React.SetStateAction<Estimation | undefined>>;
}

export function CostEstimations({ values, estimation, setEstimation }: Props) {
  const { api, contract } = useChain();

  useEffect(() => {
    if (!values.url || !values.alias || !api || !contract) return;

    const params = [{ deduplicateornew: values.alias }, values.url];

    contract.query["shorten"](
      dryRunCallerAddress,
      { gasLimit: -1, storageDepositLimit: null },
      ...params
    )
      .then(({ storageDeposit, gasRequired, result }) => {
        if (result.isErr && result.asErr.isModule) {
          const decoded = api.registry.findMetaError(result.asErr.asModule);
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
  }, [api, contract, setEstimation, values.alias, values.url]);

  return estimation ? (
    <div className="estimations">
      <p>storage deposit: {estimation.storageDeposit.asCharge.toHuman()}</p>
      <p>gas required: {estimation.gasRequired.toHuman()}</p>
    </div>
  ) : null;
}
