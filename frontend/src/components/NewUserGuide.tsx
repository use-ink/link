import { useBalance, useWallet } from "useink";

export const NewUserGuide = () => {
  const { account } = useWallet();
  const balance = useBalance(account);
  const hasFunds = !balance?.freeBalance.isEmpty && !balance?.freeBalance.isZero();

  return (
    <div className="text-xs text-gray-300 text-left">
      {account && !hasFunds && (
        <p className="max-w-lg mx-auto">
          Your account balance is zero. Get ROC tokens{" "}
            <a
              href={`https://use.ink/faucet?acc=${account.address}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              here
            </a>.
        </p>
      )}
    </div>
  );
};
