/* eslint-disable no-console */
import { useInkathon, useRegisteredContract } from "@scio-labs/use-inkathon"
import { useEffect, useMemo } from "react"
import { ContractIds } from "../../deployments/deployments"
export const Resolve: React.FC<{ slug: string }> = ({ slug }) => {
  const { api } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.Link)

  const message = useMemo(() => {
    if (!contract) return undefined
    return contract.abi.findMessage("resolve")
  }, [contract])

  useEffect(() => {
    if (!contract || !message || !api) return

    contract.query
      .resolve(
        "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        { gasLimit: -1, storageDepositLimit: null },
        new Uint8Array([]),
      )
      .then((outcome) => {
        console.log("outcome", outcome)

        if (outcome.result.isErr) {
          if (outcome.result.asErr.isModule) {
            const actualError = api.registry.findMetaError(
              outcome.result.asErr.asModule,
            )
            console.log("Actual Error", actualError)
          } else {
            console.log(
              "Outcome error",
              outcome.result.asErr.asModule.toHuman(),
            )
          }
        }

        if (outcome.result.isOk) {
          console.log("output:", outcome.output?.toU8a())
          // message.
          // const returnTypeName =
          //   message.returnType.lookupName || message.returnType.type
          // const codec = api.registry.createTypeUnsafe(returnTypeName, [
          //   result.asOk.data,
          // ])
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }, [api, contract, message, slug])
  return (
    <main>
      <h1>Resolving {slug}</h1>
    </main>
  )
}
