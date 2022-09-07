import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useEstimationContext } from "../contexts";
import { useDryRun } from "../hooks";
import { Estimation, Values } from "../types";

interface Props {
  values: Values;
  isValid: boolean;
}

function Shortened({ estimation }: { estimation: Estimation }) {
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
        {<Link to={`/${slug}`}>{`${window.location.host}/${slug}`}</Link>}
      </div>
    </>
  );
}

export function CostEstimations({ values, isValid }: Props) {
  const estimate = useDryRun();
  const { estimation, setEstimation, setError, error } = useEstimationContext();

  useEffect(() => {
    async function getOutcome() {
      if (!isValid) return;
      setEstimation(undefined);
      setError(undefined);
      const params = [{ deduplicateornew: values.alias }, values.url];
      const e = await estimate(params);
      if ("message" in e) {
        setError(e);
      } else {
        setEstimation(e);
      }
    }
    getOutcome().catch();
  }, [estimate, isValid, setError, setEstimation, values.alias, values.url]);

  return estimation ? (
    <div className="estimations">
      {"result" in estimation &&
        "Ok" in estimation.result &&
        (estimation.result.Ok === "Shortened" ? (
          <Shortened estimation={estimation} />
        ) : (
          <Deduplicated slug={estimation.result.Ok.Deduplicated.slug} />
        ))}
    </div>
  ) : error ? (
    <p className="estimations mb-4">{error.message}</p>
  ) : null;
}
