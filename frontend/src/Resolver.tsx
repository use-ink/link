import { useEffect, useState } from "react";
import type { ContractExecResult } from "@polkadot/types/interfaces";
import { hexToString } from "@polkadot/util";
import "./App.css";
import { useParams, useNavigate } from "react-router-dom";
import { dryRunCallerAddress } from "./const";
import { Loader } from "./components";
import { useLinkContract } from "./contexts";
import { getReturnTypeName } from "./helpers";
import { useApi } from "useink";

const Resolver = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { slug } = params;
  const [resolvedUrl, setResolvedUrl] = useState<string>("");
  const { api } = useApi("rococo-contracts-testnet");
  const { contract } = useLinkContract();

  useEffect(() => {
    resolvedUrl && window.location.replace(resolvedUrl);
  }, [navigate, resolvedUrl]);

  useEffect(() => {
    if (!api || !contract || !slug) return;
    const message = contract.abi.findMessage("resolve");
    const inputData = message.toU8a([slug]);
    api.call.contractsApi
      .call<ContractExecResult>(
        dryRunCallerAddress,
        contract.address,
        0,
        null,
        null,
        inputData
      )
      .then(({ result }) => {
        if (result.isErr && result.asErr.isModule) {
          const decoded = api.registry.findMetaError(result.asErr.asModule);
          console.error(
            `${decoded.section.toUpperCase()}.${decoded.method}: ${
              decoded.docs
            }`
          );
        }
        if (result.isOk) {
          const returnTypeName = getReturnTypeName(message.returnType);
          const r = (
            message.returnType
              ? contract.registry
                  .createTypeUnsafe(returnTypeName, [result.asOk.data])
                  .toHuman()
              : "()"
          ) as string;
          const url = hexToString(r);
          const sanitized = url.substring(url.indexOf("http"));
          setResolvedUrl(sanitized);
        }
      });
  }, [api, contract, slug]);

  return (
    <div className="App">
      <Loader message={resolvedUrl ? `Redirecting to ${resolvedUrl}` : ""} />
    </div>
  );
};

export default Resolver;
