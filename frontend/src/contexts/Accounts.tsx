import {
  useEffect,
  useState,
  createContext,
  ReactNode,
  useCallback,
  useContext,
} from "react";
import { InjectedAccount, InjectedExtension } from "../types";
import { web3Enable, web3Accounts } from "@polkadot/extension-dapp";

type Props = {
  accounts?: InjectedAccount[];
  setAccounts: (a: InjectedAccount[] | undefined) => void;
  enableAutoConnect: () => void;
  disableAutoConnect: () => void;
  initAccounts: () => Promise<void>;
  shouldAutoConnect: boolean;
  signer?: InjectedExtension;
  setSigner: (s: InjectedExtension | undefined) => void;
};

const AccountsContext = createContext<Props | undefined>(undefined);

async function getExtension() {
  const extensions = await web3Enable("link-url-shortener");
  return extensions.find((e) => e.name === "polkadot-js" || e.name === "talisman");
}

function checkAutoConnect() {
  return localStorage.getItem("link-autoconnect") === null ? false : true;
}

function enableAutoConnect() {
  const stored = checkAutoConnect();
  if (!stored) localStorage.setItem("link-autoconnect", "true");
}

function disableAutoConnect() {
  const stored = checkAutoConnect();
  if (stored) localStorage.removeItem("link-autoconnect");
}

function AccountsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<InjectedAccount[]>();
  const [signer, setSigner] = useState<InjectedExtension>();
  let shouldAutoConnect = checkAutoConnect();

  const initAccounts = useCallback(async () => {
    if (!signer) {
      const s = await getExtension();
      setSigner(s);
    } else {
      const acc = await web3Accounts();
      setAccounts(acc);
    }
  }, [signer]);

  useEffect(() => {
    if (shouldAutoConnect) {
      initAccounts().catch((e) => console.error(e));
    } else {
      setAccounts(undefined);
      setSigner(undefined);
    }
  }, [initAccounts, shouldAutoConnect, signer]);

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        setAccounts,
        enableAutoConnect,
        initAccounts,
        shouldAutoConnect,
        disableAutoConnect,
        setSigner,
        signer,
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
