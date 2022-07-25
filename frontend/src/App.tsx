import { useEffect, useState } from "react";
import "./App.css";
import linkLogo from "./link-logo.svg";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Abi, ContractPromise } from "@polkadot/api-contract";
import { formatBalance, formatNumber } from "@polkadot/util";
import metadata from "./metadata.json";
import { nanoid } from "nanoid";
import Header from "./components/Header";
import LinksOverview from "./components/LinksOverview";

type Estimation = {
  gasRequired: string;
  storageDeposit: string;
};

function App() {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState(nanoid(5));
  const [estimation, setEstimation] = useState<Estimation>();
  const [index, setIndex] = useState();

  const indexFromTabs = (index:any) => {
    setIndex(index);
  }

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
    const params = [{ new: url }, alias];
    url &&
      alias &&
      contract.query["shorten"](
        "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        { gasLimit: -1, storageDepositLimit: null },
        ...params
      ).then(({ storageDeposit, gasRequired }) => {
        storageDeposit && gasRequired
          ? setEstimation({
              gasRequired: formatNumber(gasRequired),
              storageDeposit: formatBalance(storageDeposit.asCharge),
            })
          : setEstimation(undefined);
      });
  }, [alias, api, url]);

  const handleLocalStorage = () => {
    const storedUrls = localStorage.getItem("urls");
    const urls = storedUrls ? JSON.parse(storedUrls) : [];
    urls.push(url);
    localStorage.setItem("urls", JSON.stringify(urls))
  }

  return (
    <div className="App">
      <Header indexFromTabs={indexFromTabs} />
      <div className="content">
        {index === 0
        ?
          <div className="form-panel">
            <img src={linkLogo} className="link-logo" alt="logo" />
            <form action="#">
              <label htmlFor="url">Your URL</label>
              <input
                type="text"
                id="url"
                name="url"
                placeholder="Your URL"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                }}
              />
              <label htmlFor="alias">Your Alias</label>
              <input
                type="text"
                id="alias"
                name="alias"
                placeholder="Your Alias"
                value={alias}
                onChange={(e) => {
                  setAlias(e.target.value);
                }}
              />
              {estimation && (
                <div className="estimations">
                  <p>storage deposit: {estimation.storageDeposit}</p>
                  <p>gas required: {estimation.gasRequired}</p>
                </div>
              )}
              <button
                onClick={handleLocalStorage}
              >
                Shorten
              </button>
            </form>
          </div>
        :
          <LinksOverview />
      }
      </div>
    </div>
  );
}

export default App;
