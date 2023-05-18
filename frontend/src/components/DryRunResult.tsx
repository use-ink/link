import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Values } from "../types";
import { useLinkContract } from "../hooks";
import { pickDecoded, pickTxInfo } from "useink/utils";

interface Props {
  values: Values;
}

export function DryRunResult({ values }: Props) {
  const { shortenDryRun, hasDuplicateSlug } = useLinkContract();
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function getOutcome() {
      shortenDryRun?.send([{ DeduplicateOrNew: values.alias }, values.url], { defaultCaller: true });
    }

    function debouncedDryRun() {
      if (timeoutId.current) clearTimeout(timeoutId.current);

      timeoutId.current = setTimeout(() => {
        getOutcome().catch(console.error);
        timeoutId.current = null;
      }, 300);
    }

    debouncedDryRun();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortenDryRun?.send, values.alias, values.url]);

  if (!shortenDryRun?.result) return null;

  const decoded = pickDecoded(shortenDryRun?.result);
  const txInfo = pickTxInfo(shortenDryRun?.result);

  return (
    <div className="estimations">
      <div>
        {decoded && typeof decoded === "object" ? (
          <>
            <p>This url has already been shortened.</p>
            <Link to={`/${decoded.Deduplicated.slug}`}>
              {`${window.location.host}/${decoded.Deduplicated.slug}`}
            </Link>
          </>
        ) : (
          hasDuplicateSlug ? (
            <p className="text-red-500 text-xs mt-0">
              Please choose another alias. <span className="bg-white/5 rounded-md px-2 py-1 font-semibold">{values.alias}</span> is already taken.
            </p>
          ): (
            <>
              <p>storage deposit: {txInfo ? txInfo.storageDeposit.asCharge.toHuman() : '--'}</p>
              <p>gas fee: {txInfo ? txInfo.partialFee.toHuman() : '--'}</p>
            </>
          )
        )}
      </div>
    </div>
  );
}
