import { useEffect } from "react";
import { Link } from "react-router-dom";
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
    setEstimation(undefined);
    const params = [{ deduplicateornew: values.alias }, values.url];
    estimate(params).then((v) => setEstimation(v));
  }, [estimate, setEstimation, values.alias, values.url]);

  return estimation ? (
    <div className="estimations">
      {"Ok" in estimation.result &&
        (estimation.result.Ok === "Shortened" ? (
          <>
            <p>
              storage deposit: {estimation.storageDeposit.asCharge.toHuman()}
            </p>
            <p>gas fee: {estimation.partialFee.toHuman()}</p>
          </>
        ) : (
          <>
            <div>This url has already been shortened. </div>
            <div>
              {
                <Link
                  to={`/${estimation.result.Ok.Deduplicated.slug}`}
                >{`${window.location.host}/${estimation.result.Ok.Deduplicated.slug}`}</Link>
              }
            </div>
          </>
        ))}
      {"Err" in estimation.result && (
        <p className="mb-4">Slug unavailable. Try something else.</p>
      )}
    </div>
  ) : null;
}
