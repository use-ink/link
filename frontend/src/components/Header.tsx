import { Button } from ".";
import { useUI } from "../hooks";
import logo from "../logo.svg";
import { AccountsDropdown } from "./AccountsDropdown";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { useWallet } from "useink";

export const Header = () => {
  const { account, accounts, disconnect } = useWallet();
  const { setShowConnectWallet } = useUI();

  return (
    <div className="flex justify-between w-full px-8 py-4">
      <div className="flex items-center justify-between w-full">
        <img src={logo} className="ink-logo" alt="logo" />

        {!account ? (
          <Button onClick={() => setShowConnectWallet(true)}>
            Connect Wallet
          </Button>
        ) : (
          <div className="flex items-center justify-end">
            {accounts && accounts.length > 0 && (
              <AccountsDropdown />
            )}
            <button
              onClick={disconnect}
              className="py-1 px-2 text-xs bg-gray-800 bg-opacity-0 text-gray-300 hover:bg-gray-800 hover:bg-opacity-0 relative left-[4px]"
              title="disconnect wallet"
            >
              <XCircleIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
