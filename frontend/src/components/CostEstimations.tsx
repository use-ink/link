import { useEffect } from "react";
import { useDryRun } from "../hooks";
import { Values, Estimation } from "../types";

interface Props {
  values: Values;
  estimation: Estimation | undefined;
  setEstimation: React.Dispatch<React.SetStateAction<Estimation | undefined>>;
}

export function CostEstimations({ values, estimation, setEstimation }: Props) {
  const estimate = useDryRun();

  useEffect(() => {
    if (!values.url || !values.alias) return;
    const params = [{ deduplicateornew: values.alias }, values.url];
    estimate(params).then((v) => setEstimation(v));
  }, [estimate, setEstimation, values.alias, values.url]);

  return estimation ? (
    <div className="estimations">
      <p>storage deposit: {estimation.storageDeposit.asCharge.toHuman()}</p>
      <p>gas required: {estimation.gasRequired.toHuman()}</p>
    </div>
  ) : null;
}
