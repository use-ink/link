import { useBalance, useWallet } from "useink";

export const NewUserGuide = () => {
  const { account } = useWallet();
  const balance = useBalance(account);
  const hasFunds = !balance?.freeBalance.isEmpty && !balance?.freeBalance.isZero();

  return (
    <div className="text-xs text-gray-300 text-left">
      {account && !hasFunds && (
        <p className="max-w-lg mx-auto">
          Your account balance is zero. To obtain Rococo testnet tokens (ROC) use the{" "}
            <a
              href="https://use.ink/faucet"
              rel="noopener noreferrer"
              target="_blank"
            >
            Rococo Contracts Faucet
            </a>.
        </p>
      )}
    </div>
  );
};
