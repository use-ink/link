import logo from "../logo.svg";
import { getAccounts } from "../util";
import { AccountsDropdown } from "./AccountsDropdown";
import { useAccountsContext } from "../contexts";
import { web3EnablePromise } from "@polkadot/extension-dapp";

export const Header = () => {
  const { setAccounts } = useAccountsContext();

  return (
    <div className="flex justify-between w-full px-8 py-4">
      <div className="flex items-center w-32">
        <img src={logo} className="ink-logo" alt="logo" />
      </div>

      <div className="flex items-center justify-end w-32">
        {web3EnablePromise ? (
          <AccountsDropdown />
        ) : (
          <button
            onClick={() => {
              getAccounts().then((accounts) => {
                setAccounts(accounts);
              });
            }}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
};
