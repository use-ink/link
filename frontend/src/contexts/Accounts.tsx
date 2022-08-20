import * as React from "react";
import { useEffect, useState } from "react";
import { InjectedAccount } from "../types";
import { getAccounts } from "../util";

type Props = {
  accounts?: InjectedAccount[];
  setAccounts: (a: InjectedAccount[] | undefined) => void;
  callerAddress?: string;
  setCallerAddress: (a: string | undefined) => void;
};

const AccountsContext = React.createContext<Props | undefined>(undefined);

function AccountsProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<InjectedAccount[]>();
  const [callerAddress, setCallerAddress] = useState<string>();

  useEffect(() => {
    const isSignerStored =
      localStorage.getItem("link-signer") === "polkadot-js";

    if (isSignerStored) {
      getAccounts().then((acc) => setAccounts(acc));
    }
  }, []);

  return (
    <AccountsContext.Provider
      value={{ accounts, setAccounts, callerAddress, setCallerAddress }}
    >
      {children}
    </AccountsContext.Provider>
  );
}

function useAccountsContext() {
  const context = React.useContext(AccountsContext);
  if (context === undefined) {
    throw new Error(
      "useAccountsContext must be used within an AccountsProvider"
    );
  }
  return context;
}

export { AccountsProvider, useAccountsContext };
