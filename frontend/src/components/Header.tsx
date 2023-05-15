import { XCircleIcon } from "@heroicons/react/solid";
import { useEffect, useMemo } from "react";
import { useInstalledWallets, useWallet } from "useink";
import logo from "../logo.svg";
import { AccountsDropdown } from "./AccountsDropdown";

export const Header = () => {
  const { account, accounts, connect, disconnect, isConnected } = useWallet();
  const wallets = useInstalledWallets();
  const extensionToUse = useMemo(() => wallets[0], [wallets]);

  console.log({ extensionToUse, account, isConnected });

  useEffect(() => {
    disconnect();
  }, [disconnect]);

  return (
    <div className="flex justify-between w-full px-8 py-4">
      <div className="flex items-center w-32">
        <img src={logo} className="ink-logo" alt="logo" />
      </div>

      <div className="flex items-center justify-end w-60">
        {account ? (
          <>
            {accounts && accounts.length > 0 ? (
              <AccountsDropdown />
            ) : (
              <div className="py-1 px-2 mt-6 text-xs">No accounts found.</div>
            )}
            <button
              onClick={disconnect}
              className="py-1 px-2 mt-6 text-xs bg-gray-800 bg-opacity-0 text-gray-300 hover:bg-gray-800 hover:bg-opacity-0 relative left-[4px]"
              title="disconnect extension"
            >
              <XCircleIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </button>
          </>
        ) : (
          <button
            disabled={!extensionToUse}
            onClick={() => {
              console.log(`Using Wallet: ${extensionToUse!.extensionName}`);
              connect(extensionToUse!.extensionName);
            }}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
};
