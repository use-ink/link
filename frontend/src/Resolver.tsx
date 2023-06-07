import "./App.css";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Loader } from "./components";
import { hexToString } from 'useink/utils';
import { useLinkContract } from "./hooks";
import { AbiMessage, ContractExecResult, Registry } from "useink/core";
import { useAbiMessage } from "useink";

// useink will decode results for ink! v4 +, but this dApp was built with ink! v3 and
// requires this custom decoding function.
export function decodeURL(
  result: ContractExecResult['result'],
  message: AbiMessage,
  registry: Registry,
): string | undefined {
  if (result.isErr || !message.returnType) return

  const returnTypeName = message.returnType.lookupName || message.returnType.type
  const raw = registry.createTypeUnsafe(returnTypeName, [result.asOk.data]);

  const OptionNoneResponse = '0x00';
  if (raw.toHuman() === OptionNoneResponse) return

  const url = hexToString(raw.toHuman() as any);

  return url.substring(url.indexOf('http'));
}

const Resolver: React.FC = () => {
  const params = useParams();
  const { slug } = params;
  const { resolve, link } = useLinkContract();
  const abi = useAbiMessage(link?.contract, 'resolve');

  const resolvedUrl = useMemo(() => {
    if (resolve?.result?.ok && resolve.result.value.raw && abi && link?.contract) {
      return decodeURL(resolve.result.value.raw.result, abi, link.contract.api.registry);
    }

    return undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolve?.result]);

  useEffect(() => {
    resolvedUrl && window.location.replace(resolvedUrl);
  }, [resolvedUrl]);

  useEffect(() => {
    slug && resolve?.send([slug], { defaultCaller: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App h-screen flex flex-col justify-center">
      {resolve?.isSubmitting && <Loader message={resolvedUrl ? `Redirecting to ${resolvedUrl}` : ""} />}
      {!resolve?.isSubmitting && resolve?.result?.ok && !resolvedUrl && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-center">URL not found for <span className="bg-white/5 rounded-md p-2">{slug}</span></h1>
          <p className="mt-6">Go back to <a href="/">shortener</a>.</p>
        </div>
      )}
    </div>
  );
};

export default Resolver;
