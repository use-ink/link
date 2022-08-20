import { useState, createContext, ReactNode, useContext } from "react";
import { InjectedAccount } from "../types";

type Props = {
  caller?: InjectedAccount;
  setCaller: (a: InjectedAccount | undefined) => void;
};

const CallerContext = createContext<Props | undefined>(undefined);

function CallerProvider({ children }: { children: ReactNode }) {
  const [caller, setCaller] = useState<InjectedAccount>();

  return (
    <CallerContext.Provider
      value={{
        caller,
        setCaller,
      }}
    >
      {children}
    </CallerContext.Provider>
  );
}

function useCallerContext() {
  const context = useContext(CallerContext);
  if (context === undefined) {
    throw new Error("useCallerContext must be used within a CallerProvider");
  }
  return context;
}

export { CallerProvider, useCallerContext };
