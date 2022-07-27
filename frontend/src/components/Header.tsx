import logo from "../logo.svg";
import { InjectedAccount } from "../types";
import { getAccounts } from "../util";
import { AccountsDropdown } from "./AccountsDropdown";

interface Props {
  setAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  accounts?: InjectedAccount[];
  setAccounts: React.Dispatch<
    React.SetStateAction<InjectedAccount[] | undefined>
  >;
}

export const Header = ({ setAddress, setAccounts, accounts }: Props) => {
  return (
    <div className="flex justify-between w-full px-8 py-4">
      <div className="flex items-center w-32">
        <img src={logo} className="ink-logo" alt="logo" />
      </div>

      <div className="flex items-center justify-end w-32">
        {accounts && accounts.length > 0 ? (
          <AccountsDropdown accounts={accounts} setAddress={setAddress} />
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
