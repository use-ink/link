import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { InkConfig, UseInkProvider } from "useink";
import { RococoContractsTestnet } from "useink/chains"; // TODO import not resolved by vscode
import App from "./App";
import { LinkContractProvider } from "./contexts";
import "./index.css";

const config: Pick<InkConfig, "config"> = {
  config: {
    dappName: "link! - URL shortener",
    chains: [RococoContractsTestnet],
    wallet: {
      skipAutoConnect: true,
    },
  },
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <Router>
      <UseInkProvider {...config}>
        <LinkContractProvider>
          <App />
        </LinkContractProvider>
      </UseInkProvider>
    </Router>
  </React.StrictMode>
);
