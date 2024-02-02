import { SubstrateDeployment } from "@scio-labs/use-inkathon"
// import abi from "@inkathon/contracts/deployments/greeter/greeter.json"
import { address } from "@inkathon/contracts/deployments/link/development.ts"
import abi from "./link.json"
import { Abi } from "@polkadot/api-contract"
export enum ContractIds {
  Link = "link",
}

export const getDeployments = async (
  networkId: string,
): Promise<SubstrateDeployment[]> => {
  const deployments: SubstrateDeployment[] = []

  console.log({ abi })

  // TODO this breaks
  // // for (const contractId of Object.values(ContractIds)) {
  // //   const abi = await import(
  // //     `../../../contracts/deployments/${contractId}/${networkId}.json`
  // //   )
  // //   const { address } = await import(
  // //     `../../../contracts/deployments/${contractId}/${networkId}.ts`
  // //   )
  // //   console.log({ abi, address })
  // //   deployments.push({ contractId, networkId, abi, address })
  // // }

  // const test = new Abi(abi)
  // console.log({ test })
  // deployments.push({
  //   contractId: ContractIds.Link,
  //   networkId,
  //   abi: test,
  //   address,
  // })

  return deployments
}
