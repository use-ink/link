import "./App.css";
import Resolver from "./Resolver";
import { Routes, Route } from "react-router-dom";
import { FormContainer, Loader } from "./components";
import { AccountsProvider, EstimationProvider, useChain } from "./contexts";

function App() {
  const { api } = useChain();

  return api ? (
    <Routes>
      <Route
        index
        element={
          <AccountsProvider>
            <EstimationProvider>
              <FormContainer />
            </EstimationProvider>
          </AccountsProvider>
        }
      />
      <Route path=":slug" element={<Resolver />} />
    </Routes>
  ) : (
    <Loader message="Loading app..." />
  );
}

export default App;
