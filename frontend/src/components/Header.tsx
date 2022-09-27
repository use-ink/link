import logo from "../logo.svg";
import { AccountsDropdown } from "./AccountsDropdown";
import { useAccountsContext, useCallerContext } from "../contexts";
import { XCircleIcon } from "@heroicons/react/solid";

export const Header = () => {
  const {
    enableAutoConnect,
    initAccounts,
    shouldAutoConnect,
    disableAutoConnect,
    setAccounts,
    setSigner,
    signer,
    accounts,
  } = useAccountsContext();

  const { setCaller } = useCallerContext();

  return (
    <div className="flex justify-between w-full px-8 py-4">
      <div className="flex items-center w-32">
        <img src={logo} className="ink-logo" alt="logo" />
      </div>

      <div className="flex items-center justify-end w-60">
        {shouldAutoConnect && !!signer ? (
          <>
            {accounts && accounts.length > 0 ? (
              <AccountsDropdown />
            ) : (
              <div className="py-1 px-2 mt-6 text-xs">No accounts found. </div>
            )}
            <button
              onClick={() => {
                disableAutoConnect();
                setAccounts(undefined);
                setCaller(undefined);
                setSigner(undefined);
              }}
              className="py-1 px-2 mt-6 text-xs bg-gray-800 bg-opacity-0 text-gray-300 hover:bg-gray-800 hover:bg-opacity-0"
              style={{ position: "relative", left: 4 }}
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
            onClick={() => {
              enableAutoConnect();
              initAccounts();
            }}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
};
