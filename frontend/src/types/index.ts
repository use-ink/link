import type { StorageDeposit } from "@polkadot/types/interfaces";

import type { u64 } from "@polkadot/types";

export type Estimation = {
  gasRequired: u64;
  storageDeposit: StorageDeposit;
};

export interface Values {
  url: string;
  alias: string;
}

export interface UIEvent {
  name: string;
  message: string;
}
