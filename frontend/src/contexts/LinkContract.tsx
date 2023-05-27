import { PropsWithChildren, createContext } from "react";
import { useContract, DryRun, useDryRun, useTx, Tx, useCall, Call, ChainContract } from "useink";
import { CONTRACT_ADDRESS } from "../const";
import metadata from "../metadata.json";
import { ResolvedUrl, ShorteningResult } from "../types";
import { useTxNotifications } from "useink/notifications";

interface LinkContractState {
  link?: ChainContract; 
  shortenDryRun?: DryRun<ShorteningResult>;
  shorten?: Tx<ShorteningResult>;
  resolve?: Call<ResolvedUrl>;
  hasDuplicateSlug?: boolean;
}

export const LinkContractContext = createContext<LinkContractState>({});

export function LinkContractProvider({ children }: PropsWithChildren) {
  const link = useContract(CONTRACT_ADDRESS, metadata);
  const shortenDryRun = useDryRun<ShorteningResult>(link, 'shorten');
  const shorten = useTx(link, 'shorten');
  useTxNotifications(shorten);
  const resolve = useCall<ResolvedUrl>(link, 'resolve');

  // The current contract does not return an Result<_, Err> so we need to hack the
  // duplicate Slug error check. ink! v4 handles this better. Using ink! v4 we can simply
  // use `pickError(shortenDryRun?.result)` and check for the error type or undefined.
  const hasDuplicateSlug = shortenDryRun?.result?.ok && 
    shortenDryRun.result.value.storageDeposit.asCharge.eq(0) && 
    shortenDryRun.result.value.partialFee.gtn(0)

  return (
    <LinkContractContext.Provider value={{ link, shortenDryRun, shorten, resolve, hasDuplicateSlug }}>
      {children}
    </LinkContractContext.Provider>
  );
}