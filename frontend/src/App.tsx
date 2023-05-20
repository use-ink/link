import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Loader } from "./components";
import { useApi } from "useink";
import { EstimationProvider } from "./contexts";
import { PinkContainer } from "./components/PinkContainer";

function App() {
  const { api } = useApi();

  return api ? (
    <Routes>
      <Route
        index
        element={
          <EstimationProvider>
            <PinkContainer />
          </EstimationProvider>
        }
      />
    </Routes>
  ) : (
    <Loader message="Loading app..." />
  );
}

export default App;
