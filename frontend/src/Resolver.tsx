import { useEffect, useState } from "react";
import "./App.css";
import { useParams, useNavigate } from "react-router-dom";
import { dryRunCallerAddress } from "./const";
import { Loader } from "./components";
import { useChain } from "./contexts";

const Resolver = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { slug } = params;
  const [resolvedUrl, setResolvedUrl] = useState<string>("");
  const { api, contract } = useChain();

  useEffect(() => {
    resolvedUrl && window.location.replace(resolvedUrl);
  }, [navigate, resolvedUrl]);

  useEffect(() => {
    if (!api || !contract || !slug) return;
    contract.query["resolve"](
      dryRunCallerAddress,
      { gasLimit: -1, storageDepositLimit: null },
      slug
    ).then(({ result, output }) => {
      if (result.isErr && result.asErr.isModule) {
        const decoded = api.registry.findMetaError(result.asErr.asModule);
        console.error(
          `${decoded.section.toUpperCase()}.${decoded.method}: ${decoded.docs}`
        );
      }
      if (result.isOk) {
        const url = output?.toHuman()?.toString() || "";
        setResolvedUrl(url);
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
