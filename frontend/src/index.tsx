import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Resolver from "./Resolver";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FormContainer } from "./components";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
