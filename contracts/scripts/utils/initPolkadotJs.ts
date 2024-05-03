import { ApiPromise, Keyring } from '@polkadot/api';
import { IKeyringPair } from '@polkadot/types/types/interfaces';
import { BN } from '@polkadot/util';
import { getSubstrateChain } from '@scio-labs/use-inkathon/chains';
import { getBalance, initPolkadotJs as initApi } from '@scio-labs/use-inkathon/helpers';
import { SubstrateChain, SubstrateExplorer } from '@scio-labs/use-inkathon/types';
import * as dotenv from 'dotenv';

// Dynamically load environment from `.env.{chainId}`
const chainId = process.env.CHAIN || 'development';
dotenv.config({ path: `.env.${chainId}` });

/**
 * Initialize Polkadot.js API with given RPC & account from given URI.
 */
export type InitParams = {
  chain: SubstrateChain;
  api: ApiPromise;
  keyring: Keyring;
  account: IKeyringPair;
  decimals: number;
  prefix: number;
  toBNWithDecimals: (_: number | string) => BN;
};
export const initPolkadotJs = async (): Promise<InitParams> => {
  const accountUri = process.env.ACCOUNT_URI || '//Alice';
  let chain: SubstrateChain | undefined = undefined;
  if (chainId === 'pop-network') {
    chain = {
      network: 'pop-network',
      name: 'Pop Network',
      ss58Prefix: 42,
      rpcUrls: ['wss://rpc1.paseo.popnetwork.xyz', 'wss://rpc2.paseo.popnetwork.xyz'],
      explorerUrls: {
        [SubstrateExplorer.PolkadotJs]: `https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc1.paseo.popnetwork.xyz`,
      },
      testnet: true,
      faucetUrls: ['https://faucet.polkadot.io/'],
    };
  } else {
    chain = getSubstrateChain(chainId);
  }

  if (!chain) throw new Error(`Chain '${chainId}' not found`);

  // Initialize api
  const { api } = await initApi(chain, { noInitWarn: true });

  // Print chain info
  const network = (await api.rpc.system.chain())?.toString() || '';
  const version = (await api.rpc.system.version())?.toString() || '';
  console.log(`Initialized API on ${network} (${version})`);

  // Get decimals & prefix
  const decimals = api.registry.chainDecimals?.[0] || 12;
  const prefix = api.registry.chainSS58 || 42;
  const toBNWithDecimals = (n: number | string) => new BN(n).mul(new BN(10).pow(new BN(decimals)));

  // Initialize account & set signer
  const keyring = new Keyring({ type: 'sr25519' });
  const account = keyring.addFromUri(accountUri);
  const balance = await getBalance(api, account.address);
  console.log(`Initialized Account: ${account.address} (${balance.balanceFormatted})\n`);

  return { api, chain, keyring, account, decimals, prefix, toBNWithDecimals };
};
