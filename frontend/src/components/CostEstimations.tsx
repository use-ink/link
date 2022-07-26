import { ContractPromise } from "@polkadot/api-contract";
import { callerAddress } from "../const";
import { Values, Estimation } from "../types";

interface Props {
  contract: ContractPromise;
  values: Values;
  estimation: Estimation | undefined;
  setEstimation: React.Dispatch<React.SetStateAction<Estimation | undefined>>;
}

export function CostEstimations({
  contract,
  values,
  estimation,
  setEstimation,
}: Props) {
  if (!values.url || !values.alias) return null;

  const params = [{ new: values.url }, values.alias];

  contract.query["shorten"](
    callerAddress,
    { gasLimit: -1, storageDepositLimit: null },
    ...params
  )
    .then(({ storageDeposit, gasRequired }) => {
      setEstimation({
        gasRequired: gasRequired.toHuman(),
        storageDeposit: storageDeposit.asCharge.toHuman(),
      });
    })
    .catch((e) => console.log(e));

  return (
    <div className="estimations">
      <p>storage deposit: {estimation?.storageDeposit}</p>
      <p>gas required: {estimation?.gasRequired}</p>
    </div>
  );
}
