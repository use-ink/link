import { SubstrateDeployment } from "@scio-labs/use-inkathon"
import abi from "contracts/deployments/link/link.json"
import { address } from "contracts/deployments/link/development.ts"
import ROCOCO_ABI from "./rococo.json"
export const ROCOCO_CONTRACT_ADDRESS =
  "5GdHQQkRHvEEE4sDkcLkxCCumSkw2SFBJSLKzbMTNARLTXz3"

export enum ContractIds {
  Link = "link",
}

const ROCOCO_DEPLOYMENTS = {
  contractId: ContractIds.Link,
  networkId: "rococo",
  abi: ROCOCO_ABI,
  address: ROCOCO_CONTRACT_ADDRESS,
}

const DEVELOPMENT_DEPLOYMENTS = {
  contractId: ContractIds.Link,
  networkId: "development",
  abi: abi,
  address: address,
}

export const getDeployments = (): SubstrateDeployment[] => {
  const deployments: SubstrateDeployment[] = []

  deployments.push(ROCOCO_DEPLOYMENTS)
  deployments.push(DEVELOPMENT_DEPLOYMENTS)

  return deployments
}
