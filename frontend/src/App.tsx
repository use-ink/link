import "./App.css";
import Resolver from "./Resolver";
import { Routes, Route } from "react-router-dom";
import { FormContainer, Loader } from "./components";
import { useApi } from "useink";
import { EstimationProvider } from "./contexts";

function App() {
  const { api } = useApi("rococo-contracts-testnet") || {}; // TODO does not work without `{}` as useAPI can return undefined and not `{ api:undefined }`

  return api ? (
    <Routes>
      <Route
        index
        element={
          <EstimationProvider>
            <FormContainer />
          </EstimationProvider>
        }
      />
      <Route path=":slug" element={<Resolver />} />
    </Routes>
  ) : (
    <Loader message="Loading app..." />
  );
}

export default App;
