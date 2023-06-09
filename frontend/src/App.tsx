import "./App.css";
import { Routes, Route } from "react-router-dom";
import { PinkContainer, Loader} from "./components";
import { usePinkContract } from "./hooks";

function App() {
  const { pinkRobotContract } = usePinkContract();

  if (!pinkRobotContract) return <Loader message="Loading app..." />

  return (
    <Routes>
      <Route index element={<PinkContainer />}/>
      <Route path="/pinkrobot" element={<PinkContainer />}/>
    </Routes>
  )
}

export default App;
