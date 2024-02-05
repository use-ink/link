/* eslint-disable no-console */
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from "@scio-labs/use-inkathon"
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
    console.log({ slug })
    contractQuery(
      api,
      "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", // Alice
      contract,
      "resolve",
      undefined,
      [slug],
    )
      .then((outcome) => {
        const output = decodeOutput(outcome, contract, "resolve")
        if (output.isError) throw Error("Unable to query contract")
        if (output.output) {
          window.location = output.output as Location
        } else {
          // redirect and prefill
          console.log({ output })
        }
      })
      .catch((e) => {
        console.log({ e })
      })
  }, [api, contract, message, slug])
  return (
    <main>
      <h1>Resolving {slug}</h1>
    </main>
  )
}
