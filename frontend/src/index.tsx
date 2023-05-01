import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { LinkContractProvider } from "./contexts";
import { InkConfig, UseInkProvider } from "useink";
import { endpoint as providerUrl } from "./const";

const config: Pick<InkConfig, "config"> = {
  config: {
    dappName: "Pink Robot - AI generator and minter",
    providerUrl,
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
