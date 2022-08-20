import * as React from "react";
import { useState } from "react";
import { Estimation } from "../types";

type Props = {
  estimation?: Estimation;
  setEstimation: (e: Estimation | undefined) => void;
};

const EstimationContext = React.createContext<Props | undefined>(undefined);

function EstimationProvider({ children }: { children: React.ReactNode }) {
  const [estimation, setEstimation] = useState<Estimation>();

  return (
    <EstimationContext.Provider value={{ estimation, setEstimation }}>
      {children}
    </EstimationContext.Provider>
  );
}

function useEstimationContext() {
  const context = React.useContext(EstimationContext);
  if (context === undefined) {
    throw new Error("useEstimation must be used within a EstimationProvider");
  }
  return context;
}

export { EstimationProvider, useEstimationContext };
