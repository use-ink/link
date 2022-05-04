import { useEffect, useState } from "react";
import "./App.css";
import squid from "./squid.svg";
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
      {/*
      <div className="slug">Your Slug: {slug}</div>
      <div className="url">Your Resolved URL: {resolvedUrl}</div> */}
      <section className="sticky">
        <div className="squids">
          <img src={squid} className="squid" alt="logo"/>
          <img src={squid} className="squid" alt="logo"/>
          <img src={squid} className="squid" alt="logo"/>
          <img src={squid} className="squid" alt="logo"/>
          <img src={squid} className="squid" alt="logo"/>
          <img src={squid} className="squid" alt="logo"/>
          <img src={squid} className="squid" alt="logo"/>
        </div>
        <img src={squid} className="big-squid" alt="logo"/>
      </section>
      <div className='container'>
        <div className='text-info'>
          <h1>Shortened with link!</h1>
          <div className='tag-line'>
            The unstoppable link shortener build with the <a href="https://github.com/paritytech/ink" target="_blank" rel="noopener noreferrer">ink! smart contract language</a>.
            {resolvedUrl && `Redirecting to ${resolvedUrl}.`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resolver;
