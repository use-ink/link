import { SubstrateDeployment } from "@scio-labs/use-inkathon"
import abi from "contracts/deployments/link/link.json"
import { address as linkDevelopment } from "contracts/deployments/link/development.ts"
import { address as linkPopNetwork } from "contracts/deployments/link/pop-network"

export enum ContractIds {
  Link = "link",
}

const DEVELOPMENT_DEPLOYMENTS = {
  contractId: ContractIds.Link,
  networkId: "development",
  abi: abi,
  address: linkDevelopment,
}

const POP_NETWORK_DEPLOYMENTS = {
  contractId: ContractIds.Link,
  networkId: "pop-network-testnet",
  abi: abi,
  address: linkPopNetwork,
}

export const getDeployments = (): SubstrateDeployment[] => {
  const deployments: SubstrateDeployment[] = []

  deployments.push(POP_NETWORK_DEPLOYMENTS)
  deployments.push(DEVELOPMENT_DEPLOYMENTS)

  return deployments
}
