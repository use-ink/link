import * as React from "react";
import { useState } from "react";
import { Estimation, UIError } from "../types";

type Props = {
  isEstimating: boolean;
  setIsEstimating: (_: boolean) => void;
  estimation?: Estimation;
  setEstimation: (e: Estimation | undefined) => void;
  error?: UIError;
  setError: (e: UIError | undefined) => void;
};

const EstimationContext = React.createContext<Props | undefined>(undefined);

function EstimationProvider({ children }: { children: React.ReactNode }) {
  const [estimation, setEstimation] = useState<Estimation>();
  const [error, setError] = useState<UIError>();
  const [isEstimating, setIsEstimating] = useState(false);

  return (
    <EstimationContext.Provider
      value={{
        estimation,
        setEstimation,
        error,
        setError,
        isEstimating,
        setIsEstimating,
      }}
    >
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
