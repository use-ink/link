import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useEstimationContext } from "../contexts";
import { useDryRun } from "../hooks";
import { Estimation, Values } from "../types";

interface Props {
  values: Values;
  isValid: boolean;
}

export function Fees({ estimation }: { estimation: Estimation }) {
  return (
    <>
      <p>storage deposit: {estimation.storageDeposit.asCharge.toHuman()}</p>
      <p>gas fee: {estimation.partialFee.toHuman()}</p>
    </>
  );
}

function Deduplicated({ slug }: { slug: string }) {
  return (
    <>
      <div>This url has already been shortened. </div>
      <div>
        <Link to={`/${slug}`}>{`${window.location.host}/${slug}`}</Link>
      </div>
    </>
  );
}

export function DryRunResult({ values, isValid }: Props) {
  const estimate = useDryRun();
  const { estimation, setEstimation } = useEstimationContext();

  useEffect(() => {
    async function getOutcome() {
      if (!isValid) return;
      const params = [{ deduplicateornew: values.alias }, values.url];
      const e = await estimate(params);
      setEstimation(e);
    }
    getOutcome().catch();
  }, [estimate, isValid, setEstimation, values.alias, values.url]);

  return estimation ? (
    <div className="estimations">
      <div>
        {"Ok" in estimation.result &&
        typeof estimation.result.Ok === "object" ? (
          <Deduplicated slug={estimation.result.Ok.Deduplicated.slug} />
        ) : (
          <Fees estimation={estimation} />
        )}
      </div>
    </div>
  ) : null;
}
