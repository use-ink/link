import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import {
  PinkContractProvider,
  PinkPsp34ContractProvider,
  UIProvider,
} from "./contexts";
import { InkConfig, UseInkProvider } from "useink";
import { ShibuyaTestnet } from "useink/chains";
import { NotificationsProvider } from "useink/notifications";
import { Notifications } from "./components/Notifications";

const config: InkConfig = {
  config: {
    dappName: "Pink Robot - AI generator and minter",
    chains: [ShibuyaTestnet],
    caller: {
      default: "5EyR7vEk7DtvEWeefGcXXMV6hKwB8Ex5uvjHufm466mbjJkR",
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
        <NotificationsProvider>
          <UIProvider>
            <PinkContractProvider>
              <PinkPsp34ContractProvider>
                <App />
                <Notifications />
              </PinkPsp34ContractProvider>
            </PinkContractProvider>
          </UIProvider>
        </NotificationsProvider>
      </UseInkProvider>
    </Router>
  </React.StrictMode>
);
