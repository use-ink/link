import { PropsWithChildren, createContext } from "react";
import { useContract, DryRun, useDryRun, useTx, Tx, useCall, Call, ChainContract } from "useink";
import { contractAddress } from "../const";
import metadata from "../metadata.json";
import { useTxNotifications } from "useink/notifications";

interface PinkContractState {
  pinkRobotContract?: ChainContract; 
  pinkMintDryRun?: DryRun<number>;
  pinkMint?: Tx<number>;
  getPrice?: Call<number>;
}

export const PinkContractContext = createContext<PinkContractState>({});

export function PinkContractProvider({ children }: PropsWithChildren) {
  const pinkRobotContract = useContract(contractAddress, metadata);
  const pinkMintDryRun = useDryRun<number>(pinkRobotContract, 'pinkMint');
  const pinkMint = useTx(pinkRobotContract, 'pinkMint');
  const getPrice = useCall<number>(pinkRobotContract, 'getPrice');

  useTxNotifications(pinkMint);

  return (
    <PinkContractContext.Provider value={{ pinkRobotContract, pinkMintDryRun, pinkMint, getPrice }}>
      {children}
    </PinkContractContext.Provider>
  );
}