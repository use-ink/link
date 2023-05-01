import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useEstimationContext } from "../contexts";
import { useDryRun } from "../hooks";
import { Estimation, PinkValues } from "../types";

interface Props {
  values: PinkValues;
  isValid: boolean;
}

function Fees({ estimation }: { estimation: Estimation }) {
  return (
    <>
      <p>storage: {estimation.storageDeposit.asCharge.toHuman()}</p>
      <p>gas: {estimation.partialFee.toHuman()}</p>
      <p>price: {estimation.price}</p>
      <p>total: {estimation.partialFee.toNumber() + estimation.price}</p>
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
  const { estimation, setEstimation, setIsEstimating } = useEstimationContext();
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsEstimating(true);

    async function getOutcome() {
      if (!isValid) return;
      const params = [{ deduplicateornew: values.prompt }, values.ipfs];
      const e = await estimate(params);
      setEstimation(e);
      setIsEstimating(false);
    }
    function debouncedDryRun() {
      if (timeoutId.current) clearTimeout(timeoutId.current);
      timeoutId.current = setTimeout(() => {
        getOutcome().catch((err) => console.error(err));
        timeoutId.current = null;
      }, 300);
    }

    debouncedDryRun();
  }, [
    estimate,
    isValid,
    setEstimation,
    setIsEstimating,
    values.prompt,
    values.ipfs,
  ]);

  return estimation ? (
    <div className="estimations">
      <div>
        {estimation.result && "Ok" in estimation.result &&
          typeof estimation.result.Ok === "object" ? (
          <Deduplicated slug={estimation.result.Ok.Deduplicated.slug} />
        ) : (
          <Fees estimation={estimation} />
        )}
      </div>
    </div>
  ) : null;
}
