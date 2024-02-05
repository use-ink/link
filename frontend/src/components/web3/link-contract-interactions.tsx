/* eslint-disable no-console */
import { FC, useCallback, useEffect } from "react"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
import debounce from "lodash.debounce"
import { SubmitHandler, useForm } from "react-hook-form"
import * as z from "zod"
import { contractTxWithToast } from "../../utils/contract-tx-with-toast"
import { Button } from "../ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card"

const formSchema = z.object({
  url: z.string().min(1).url(),
  slug: z.string().min(5),
})

export const LinkContractInteractions: FC = () => {
  const { api, activeAccount, activeSigner } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(
    ContractIds.Link,
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "12345",
      url: "http://localhost:5173/",
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const updateCosts: (data: { slug: string; url: string }) => Promise<void> =
    useCallback(
      debounce(async ({ slug, url }: { slug: string; url: string }) => {
        if (!contract || !activeAccount || !api) return
        console.log({ contract, activeAccount })

        const shorten = contractQuery(
          api,
          activeAccount.address,
          contract,
          "shorten",
          undefined,
          [{ New: slug }, url],
        )

        const resolve = contractQuery(
          api,
          activeAccount.address,
          contract,
          "resolve",
          undefined,
          [slug],
        )

        const [shortenOutcome, resolveOutcome] = await Promise.all([
          shorten,
          resolve,
        ])

        const shortenResult = decodeOutput(shortenOutcome, contract, "shorten")
        const resolveResult = decodeOutput(resolveOutcome, contract, "resolve")
        console.log({ shortenResult, resolveResult })
      }, 2000),
      [contract, api, activeAccount],
    )
  // Callback version of watch.  It's your responsibility to unsubscribe when done.
  useEffect(() => {
    const subscription = form.watch((value) => updateCosts(value))
    return () => subscription.unsubscribe()
  }, [form, updateCosts])

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = useCallback(
    async ({ slug, url }) => {
      if (!api) {
        throw new Error("Api not available")
      }
      if (!contract) {
        throw new Error("Contract not available")
      }

      console.log({ slug, url })
      const result = await contractTxWithToast(
        api,
        activeAccount.address,
        contract,
        "shorten",
        {},
        [{ DeduplicateOrNew: slug }, url],
      )

      console.log({ result })
    },
    [activeAccount, api, contract],
  )

  if (!api) return null

  return (
    <div className="flex max-w-[24rem] grow flex-col">
      <CardHeader className="mx-[-10px] space-y-1">
        <CardTitle className="text-2xl">Shorten URLs</CardTitle>
        <CardDescription>
          Shorten & resolve URLs with the tiny.ink contract.
        </CardDescription>
      </CardHeader>

      <Card className="z-10">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full  flex-col items-start gap-3 p-3"
          >
            <div className="flex w-full flex-col gap-1">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={form.formState.isSubmitting}
                        className="text-lg"
                        placeholder={"https://use.ink/"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    will be shortened to
                  </span>
                </div>
              </div>

              <FormField
                control={form.control}
                name="slug"
                rules={{
                  validate: (value) => {
                    console.log("validate", value)
                    return "slug is taken"
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={form.formState.isSubmitting}
                        className="flex-1 text-lg"
                        placeholder={"check-this-out"}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Resulting in
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-full items-center rounded-xl bg-gray-100 px-4 text-lg">
                <a
                  href="https://tiny.ink/sug"
                  className="text-purple-400 underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://tiny.ink/sug here
                </a>
              </div>
            </div>

            <Button
              className="w-full rounded-lg font-bold"
              type="submit"
              size="lg"
              disabled={
                !form.formState.isValid ||
                form.formState.isSubmitting ||
                !activeSigner
              }
            >
              REGISTER
            </Button>
          </form>
        </Form>
      </Card>
      <Card className="z-0 mt-[-20px] bg-slate-100 px-2 pt-[20px] shadow-none">
        <div className="py-2">Add data to get cost estimation</div>
      </Card>
    </div>
  )
}
