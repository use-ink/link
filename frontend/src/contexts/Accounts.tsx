import {
  useEffect,
  useState,
  createContext,
  ReactNode,
  useCallback,
  useContext,
} from "react";
import { InjectedAccount } from "../types";
import {
  web3Enable,
  web3Accounts,
  web3EnablePromise,
} from "@polkadot/extension-dapp";

type Props = {
  accounts?: InjectedAccount[];
  setAccounts: (a: InjectedAccount[] | undefined) => void;
  enableAutoConnect: () => void;
  disableAutoConnect: () => void;
  loadAccounts: () => void;
  shouldAutoConnect: boolean;
};

const AccountsContext = createContext<Props | undefined>(undefined);

async function getExtension() {
  const extensions = await web3Enable("link-url-shortener");
  return extensions.find((e) => e.name === "polkadot-js");
}

function checkAutoConnect() {
  return localStorage.getItem("link-autoconnect");
}

function enableAutoConnect() {
  const stored = checkAutoConnect();
  if (!stored) localStorage.setItem("link-autoconnect", "true");
}

function disableAutoConnect() {
  const stored = checkAutoConnect();
  if (stored) localStorage.removeItem("link-autoconnect");
}

const getAccounts = async () => {
  return await web3Accounts();
};

function AccountsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<InjectedAccount[]>();
  const shouldAutoConnect = checkAutoConnect();

  const loadAccounts = useCallback(() => {
    !web3EnablePromise && getExtension();
    getAccounts().then((acc) => setAccounts(acc));
  }, []);

  useEffect(() => {
    if (shouldAutoConnect) {
      loadAccounts();
    } else {
      setAccounts(undefined);
    }
  }, [loadAccounts, shouldAutoConnect]);

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        setAccounts,
        enableAutoConnect,
        loadAccounts,
        shouldAutoConnect: shouldAutoConnect ? true : false,
        disableAutoConnect,
      }}
    >
      {children}
    </AccountsContext.Provider>
  );
}

function useAccountsContext() {
  const context = useContext(AccountsContext);
  if (context === undefined) {
    throw new Error(
      "useAccountsContext must be used within an AccountsProvider"
    );
  }
  return context;
}

export { AccountsProvider, useAccountsContext };
