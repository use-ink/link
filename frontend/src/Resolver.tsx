import { useEffect, useState } from "react";
import "./App.css";
import squid from "./squid.svg";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Abi, ContractPromise } from "@polkadot/api-contract";
import metadata from "./metadata.json";
import { useParams, useNavigate } from "react-router-dom";
import { callerAddress, contractAddress, endpoint } from "./const";

const Resolver = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { slug } = params;
  const [resolvedUrl, setResolvedUrl] = useState<string>("");
  const [api, setApi] = useState<ApiPromise | null>(null);

  useEffect(() => {
    const wsProvider = new WsProvider(endpoint);
    ApiPromise.create({ provider: wsProvider }).then((api) => setApi(api));
  }, []);

  useEffect(() => {
    resolvedUrl && window.location.replace(resolvedUrl);
  }, [navigate, resolvedUrl]);

  useEffect(() => {
    if (!api) return;
    const abi = api && new Abi(metadata, api.registry.getChainProperties());
    const contract = new ContractPromise(api, abi, contractAddress);
    slug &&
      contract.query["resolve"](
        callerAddress,
        { gasLimit: -1, storageDepositLimit: null },
        slug
      ).then(({ result, output }) => {
        if (result.isErr && result.asErr.isModule) {
          const decoded = api.registry.findMetaError(result.asErr.asModule);
          console.error(
            `${decoded.section.toUpperCase()}.${decoded.method}: ${
              decoded.docs
            }`
          );
        }
        if (result.isOk) {
          const url = output?.toHuman()?.toString() || "";
          console.log("url", url);
          console.log("output", output);
          setResolvedUrl(url);
        }
      });
  }, [api, slug]);
  return (
    <div className="App">
      {/*
      <div className="slug">Your Slug: {slug}</div>
      <div className="url">Your Resolved URL: {resolvedUrl}</div> */}
      <section className="sticky">
        <div className="squids">
          <img src={squid} className="squid" alt="logo" />
          <img src={squid} className="squid" alt="logo" />
          <img src={squid} className="squid" alt="logo" />
          <img src={squid} className="squid" alt="logo" />
          <img src={squid} className="squid" alt="logo" />
          <img src={squid} className="squid" alt="logo" />
          <img src={squid} className="squid" alt="logo" />
        </div>
        <img src={squid} className="big-squid" alt="logo" />
      </section>
      <div className="container">
        <div className="text-info">
          <h1>Shortened with link!</h1>
          <div className="tag-line">
            The unstoppable link shortener build with the{" "}
            <a
              href="https://github.com/paritytech/ink"
              target="_blank"
              rel="noopener noreferrer"
            >
              ink! smart contract language
            </a>
            .<div>{resolvedUrl && `Redirecting to ${resolvedUrl}.`}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resolver;
