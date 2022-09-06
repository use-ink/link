import { useEffect } from "react";
import { useEstimationContext } from "../contexts";
import { useDryRun } from "../hooks";
import { Values } from "../types";

interface Props {
  values: Values;
}

export function CostEstimations({ values }: Props) {
  const estimate = useDryRun();
  const { estimation, setEstimation } = useEstimationContext();

  useEffect(() => {
    if (!values.url || !values.alias) return;
    const params = [{ deduplicateornew: values.alias }, values.url];
    estimate(params).then((v) => setEstimation(v));
  }, [estimate, setEstimation, values.alias, values.url]);

  return estimation ? (
    <div className="estimations">
      <p>storage deposit: {estimation.storageDeposit.asCharge.toHuman()}</p>
      <p>gas fee: {estimation.partialFee.toHuman()}</p>
    </div>
  ) : null;
}
