import { useParams } from "react-router-dom";
import "./App.css";
import logo from "./logo.svg";

const Resolver = () => {
  const { id } = useParams();
  return (
    <div className="App">
      <div className="top-bar">
        <img src={logo} className="ink-logo" alt="logo" />
      </div>
      <div className="content">{id}</div>
    </div>
  );
};

export default Resolver;
