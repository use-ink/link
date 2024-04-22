/* eslint-disable no-console */
import PaperPlane from "@/assets/paper-plane.svg"
import Left from "@/assets/left.svg"
import Logo from "@/assets/logo.svg"
import Right from "@/assets/right.svg"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ContractIds } from "@/deployments/deployments"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from "@scio-labs/use-inkathon"
import { Copy } from "lucide-react"
import { customAlphabet } from "nanoid"
import { FC, useCallback, useMemo } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"
import { cn } from "../../utils/cn"
import { contractTxWithToast } from "../../utils/contract-tx-with-toast"

const slugParser = z
  .string()
  .min(5)
  .max(40)
  .regex(/^\w+$/, "Can not contain symbols or whitespaces")
  .trim()
  .toLowerCase()

const formSchema = z.object({
  url: z.string().url(),
  slug: slugParser,
})

export const LinkContractInteractions: FC = () => {
  const { api, activeAccount, connect, isConnected } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.Link)

  const initialSlug = useMemo(
    () => customAlphabet("abcdefghijklmnopqrstuvwxyz", 5)(),
    [],
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      slug: initialSlug,
    },
  })

  const dryRun = useCallback(
    async ({ slug, url }: { slug: string; url: string }) => {
      if (!contract || !api || !slug || !url || !activeAccount) return

      const shortenOutcome = await contractQuery(
        api,
        activeAccount?.address,
        contract,
        "shorten",
        undefined,
        [{ New: slug }, url],
      )
      const shortenResult = decodeOutput(shortenOutcome, contract, "shorten")

      if (shortenOutcome.result.isErr && shortenOutcome.result.asErr.isModule) {
        const { docs, method, section } = api.registry.findMetaError(
          shortenOutcome.result.asErr.asModule,
        )

        shortenResult.decodedOutput = `${section}.${method}: ${docs.join(" ")}`
      }

      return shortenResult
    },
    [contract, api, activeAccount],
  )

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = useCallback(
    async ({ slug, url }) => {
      if (!api) {
        throw new Error("Api not available")
      }
      if (!contract) {
        throw new Error("Contract not available")
      }
      if (!activeAccount) {
        throw new Error("Signer not available")
      }

      const outcome = await dryRun({ slug, url })
      if (outcome?.isError) {
        console.error({ outcome })
        toast.error(outcome.decodedOutput)
        return
      }

      return contractTxWithToast(
        api,
        activeAccount.address,
        contract,
        "shorten",
        {},
        [{ DeduplicateOrNew: slug }, url],
      )
    },
    [activeAccount, api, contract, dryRun],
  )

  return (
    <div className="flex w-screen min-w-[16rem] max-w-[748px] grow flex-col px-4">
      <div className="relative flex h-[200px] flex-row items-start justify-center">
        <img
          className=" absolute bottom-[-25px] left-0"
          src={Left}
          alt="Reef Left"
        />
        <img className="h-14" src={Logo} alt="Link Logo" />

        <img
          className=" absolute bottom-[-30px] right-0"
          src={Right}
          alt="Reef Right"
        />
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="z-50 flex w-full flex-col items-start gap-4 border-ink-border"
        >
          <div className="w-full rounded-md bg-ink-blue p-3">
            <div
              className={cn(
                "flex w-full flex-col gap-4 rounded-md border-4 border-ink-border bg-ink-blue p-3 opacity-30 transition-opacity",
                {
                  "opacity-100": isConnected,
                },
              )}
            >
              <FormField
                control={form.control}
                name="url"
                render={({ field, fieldState }) => (
                  <FormItem className="transition-all">
                    <FormLabel className="pl-2">URL</FormLabel>
                    <FormControl>
                      <Input
                        disabled={form.formState.isSubmitting || !isConnected}
                        className={cn({
                          "border-pink-300 focus-visible:ring-pink-600":
                            !!fieldState.error,
                        })}
                        placeholder={"https://use.ink/"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="pl-2" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="pl-2">Custom Path</FormLabel>
                    <FormControl>
                      <Input
                        disabled={form.formState.isSubmitting || !isConnected}
                        className={cn({
                          "border-pink-300 focus-visible:ring-pink-600":
                            !!fieldState.error,
                        })}
                        placeholder={"helloworld"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="pl-2" />
                  </FormItem>
                )}
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full rounded-md border-2 border-t border-ink-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className=" bg-ink-card px-2 text-lg text-ink-white">
                    shorten to
                  </span>
                </div>
              </div>

              <div className="mb-1 flex min-h-14 w-full flex-row items-center justify-between rounded-md bg-ink-white px-4 py-3 text-xl">
                <a
                  href={`https://tiny.ink/${encodeURI(
                    form.watch("slug").toLowerCase(),
                  )}`}
                  className="text-ink-text underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {`https://tiny.ink/${encodeURI(
                    form.watch("slug").toLowerCase(),
                  )}`}
                </a>

                <Copy
                  onClick={() => toast.success("Copied to Clipboard!")}
                  className="cursor-pointer stroke-ink-shadow opacity-25 hover:opacity-75"
                />
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col items-center justify-center">
            <div className="-z-10 m-[-16px] h-16 border-r-4 border-ink-shadow"></div>

            <Button
              className={cn({
                "border-pink-900 bg-pink-500 hover:bg-pink-600": !activeAccount,
              })}
              disabled={activeAccount && !form.formState.isValid}
              variant={"playful"}
              size="lg"
              type={!activeAccount ? "button" : "submit"}
              onClick={
                !activeAccount
                  ? () => {
                      if (connect) void connect()
                    }
                  : () => {}
              }
            >
              {!activeAccount ? "Connect Wallet" : "Shorten"}
              {activeAccount && (
                <img
                  src={PaperPlane}
                  alt="Paper Plane"
                  className="h-12 w-12 pl-2"
                />
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
