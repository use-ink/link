import logo from "../logo.svg";
import { AccountsDropdown } from "./AccountsDropdown";
import { useAccountsContext } from "../contexts";

export const Header = () => {
  const { enableAutoConnect, loadAccounts, shouldAutoConnect } =
    useAccountsContext();

  return (
    <div className="flex justify-between w-full px-8 py-4">
      <div className="flex items-center w-32">
        <img src={logo} className="ink-logo" alt="logo" />
      </div>

      <div className="flex items-center justify-end w-60">
        {shouldAutoConnect ? (
          <AccountsDropdown />
        ) : (
          <button
            onClick={() => {
              enableAutoConnect();
              loadAccounts();
            }}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
};
