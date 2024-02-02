import { getDeploymentData } from '@/utils/getDeploymentData';
import { initPolkadotJs } from '@/utils/initPolkadotJs';
import { writeContractAddresses } from '@/utils/writeContractAddresses';
import { deployContract } from '@scio-labs/use-inkathon/helpers';

/**
 * Script that deploys the greeter contract and writes its address to a file.
 *
 * Parameters:
 *  - `DIR`: Directory to read contract build artifacts & write addresses to (optional, defaults to `./deployments`)
 *  - `CHAIN`: Chain ID (optional, defaults to `development`)
 *
 * Example usage:
 *  - `pnpm run deploy`
 *  - `CHAIN=alephzero-testnet pnpm run deploy`
 */
const main = async () => {
  const initParams = await initPolkadotJs();
  const { api, chain, account } = initParams;

  // Deploy greeter contract
  const { abi, wasm } = await getDeploymentData('link');

  // TODO gives ugly error if constructor is not present
  const contract = await deployContract(api, account, abi, wasm, 'new', []);

  // Write contract addresses to `{contract}/{network}.ts` file(s)
  // TODO does need `key` folder name match!
  await writeContractAddresses(chain.network, {
    link: contract,
  });
};

try {
  await main();
  process.exit(0);
} catch (error) {
  console.error(error);
  process.exit(1);
}
