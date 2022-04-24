import { useEffect, useState } from "react";
import "./App.css";
import logo from "./logo.svg";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Abi, ContractPromise } from "@polkadot/api-contract";
import metadata from "./metadata.json";
import { useParams } from "react-router-dom";

const Resolver = () => {
  const { slug } = useParams();
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [api, setApi] = useState<ApiPromise | null>(null);

  useEffect(() => {
    const wsProvider = new WsProvider("ws://127.0.0.1:9944");
    ApiPromise.create({ provider: wsProvider }).then((api) => setApi(api));
  }, []);

  useEffect(() => {
    if (!api) return;
    const abi = api && new Abi(metadata, api.registry.getChainProperties());
    const contract = new ContractPromise(
      api,
      abi,
      "5DuGo1LGXFs2xW6QGwKLQxRc5wyVsh2FUHCZ4y9wov2Ma9P7"
    );
    const params = [slug];
    slug &&
      contract.query["resolve"](
        "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        { gasLimit: -1, storageDepositLimit: null },
        ...params
      ).then((response) => {
        const url = response.output?.toHuman()?.toString() || null;
        setResolvedUrl(url);
      });
  }, [api, slug]);
  return (
    <div className="App">
      <div className="top-bar">
        <img src={logo} className="ink-logo" alt="logo" />
      </div>
      <div className="slug">Your Slug: {slug}</div>
      <div className="url">Your Resolved URL: {resolvedUrl}</div>
    </div>
  );
};

export default Resolver;
