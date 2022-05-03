import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Resolver from "./Resolver";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path=":slug" element={<Resolver />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
