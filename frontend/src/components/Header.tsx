import logo from "../assets/pink-logo.png";
import { AccountsDropdown } from "./AccountsDropdown";
import { XCircleIcon } from "@heroicons/react/solid";
import { useExtension } from "useink";

export const Header = () => {
  const { account, accounts, connect, disconnect } = useExtension();

  return (
    <div className="flex justify-between w-full px-8 py-4">
      <div className="flex items-center w-32">
        <img src={logo} className="pink-logo" alt="logo" />
        <h2 className="text-2xl font-bold">PinkRobot</h2>
      </div>

      <div className="flex items-center justify-end w-60">
        {account ? (
          <>
            {accounts && accounts.length > 0 ? (
              <AccountsDropdown />
            ) : (
              <div className="py-1 px-2 mt-6 text-xs">No accounts found. </div>
            )}
            <button
              onClick={disconnect}
              className="py-1 px-2 mt-6 text-xs bg-gray-800 bg-opacity-0 text-gray-300 hover:bg-gray-800 hover:bg-opacity-0"
              title="Disconnect extension"
            >
              <XCircleIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </button>
          </>
        ) : (
          <button onClick={() => connect()}>Connect</button>
        )}
      </div>
    </div>
  );
};
