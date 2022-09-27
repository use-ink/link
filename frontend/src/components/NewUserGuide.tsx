export const NewUserGuide = ({
  hasAccounts,
  hasFunds,
  walletConnected,
}: {
  hasAccounts: boolean;
  hasFunds: boolean;
  walletConnected: boolean;
}) => {
  return (
    <div className="user-guide">
      {!walletConnected && (
        <div className="mb-2">
          <p>Wallet not connected.</p>
          <p>
            Make sure you have a{" "}
            <a
              href="https://polkadot.js.org/extension/"
              target="_blank"
              rel="noopener noreferrer"
            >
              signer extension
            </a>{" "}
            installed.
          </p>
        </div>
      )}
      {walletConnected && !hasAccounts && (
        <div className="mb-2">
          <p>No Substrate accounts found.</p>
          <p>You can import or create one in the extension.</p>
        </div>
      )}
      {hasAccounts && !hasFunds && (
        <>
          <div className="mb-1">
            <p className="mb-1">Account balance is zero.</p>
            To obtain Rococo testnet tokens (ROC) join our Matrix chat room{" "}
            <a
              href="https://matrix.to/#/#rococo-faucet:matrix.org"
              rel="noopener noreferrer"
              target="_blank"
            >
              #rococo-faucet:matrix.org
            </a>{" "}
            and post the following command
          </div>
          <div>
            {" "}
            <code>!drip YOUR_SS_58_ADDRESS:1002</code>
          </div>
        </>
      )}
    </div>
  );
};
