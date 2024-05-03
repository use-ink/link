import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from "@scio-labs/use-inkathon"
import { useEffect, useMemo } from "react"
import Lottie from "react-lottie"
import animationData from "../../assets/resolve.json"
import { ContractIds } from "../../deployments/deployments"
import { Footer } from "./footer"
import toast from "react-hot-toast"

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

  useEffect(() => {
    if (!contract || !message || !api) return

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
          window.location = `/?slug=${slug}` as any as Location
        }
      })
      .catch((e) => {
        toast.error("Unable to resolve link")
        console.log({ e })
      })
  }, [api, contract, message, mounted, slug])
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <main className="flex h-screen w-screen flex-col items-center justify-center">
        <div className="pointer-events-none">
          <Lottie
            speed={2.5}
            options={{
              loop: false,
              autoplay: true,

              animationData: animationData,

              rendererSettings: {
                preserveAspectRatio: "xMidYMid slice",
              },
            }}
            height={400}
            width={400}
          />
        </div>
        <h1 className="text-2xl text-ink-text">Upscaling link...</h1>

        <a href="/" className="underline" target="_blank">
          Shrink your own link?
        </a>
      </main>
      <div className="w-full py-2">
        <Footer />
      </div>
    </div>
  )
}
