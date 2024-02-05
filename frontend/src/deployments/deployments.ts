import { SubstrateDeployment } from "@scio-labs/use-inkathon"
import abi from "contracts/deployments/link/link.json"
import { address } from "contracts/deployments/link/development.ts"

export enum ContractIds {
  Link = "link",
}

export const getDeployments = (networkId: string): SubstrateDeployment[] => {
  const deployments: SubstrateDeployment[] = []

  deployments.push({
    contractId: ContractIds.Link,
    networkId,
    abi,
    address,
  })

  return deployments
}
