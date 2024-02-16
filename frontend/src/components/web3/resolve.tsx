/* eslint-disable no-console */
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from "@scio-labs/use-inkathon"
import { useEffect, useMemo } from "react"
import { ContractIds } from "../../deployments/deployments"
import LoadingGif from "../../assets/loading.gif"

const DELAY = 6000

export const Resolve: React.FC<{ slug: string }> = ({ slug }) => {
  const { api } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.Link)

  const message = useMemo(() => {
    if (!contract) return undefined
    return contract.abi.findMessage("resolve")
  }, [contract])

  const mounted = useMemo(() => {
    return Date.now()
  }, [])
  console.log({ mounted })

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
          // TODO not decoded correctly with inkv3 contract
          if (mounted + DELAY < Date.now()) {
            window.location = output.output as Location
          } else {
            setTimeout(
              () => {
                window.location = output.output as Location
              },
              DELAY - (Date.now() - mounted),
            )
          }
        } else {
          // redirect and prefill
          console.log({ output })
        }
      })
      .catch((e) => {
        console.log({ e })
      })
  }, [api, contract, message, mounted, slug])
  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center">
      <img src={LoadingGif} />
      <h1 className="text-2xl text-ink-text">Upscaling link...</h1>
      <a href="/" className="underline" target="_blank">
        Shrink your own link?
      </a>
    </main>
  )
}
