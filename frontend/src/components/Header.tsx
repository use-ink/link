import logo from "../assets/pink-logo.png";
import { AccountsDropdown } from "./AccountsDropdown";
import { useExtension } from "useink";

export const Header = () => {
  const { account, accounts, connect } = useExtension();

  return (
    <div className="flex justify-between w-full px-8 py-4">
      <div className="flex items-center">
        <img src={logo} className="pink-logo" alt="pink-robot" />
        {/* <h2 className="text-2xl font-bold">PinkRobot</h2> */}
      </div>

      <div className="flex items-center justify-end w-60">
        {account ? (
          <>
            {accounts && accounts.length > 0 ? (
              <AccountsDropdown />
            ) : (
              <div className="py-1 px-2 mt-6 text-xs">No accounts found. </div>
            )}
          </>
        ) : (
          <button onClick={() => connect()}>Connect</button>
        )}
      </div>
    </div>
  );
};
