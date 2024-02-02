/* eslint-disable no-console */
import { FC, useCallback } from "react"

import { ContractIds } from "@/deployments/deployments"
import { zodResolver } from "@hookform/resolvers/zod"
import LinkContract from "@inkathon/contracts/typed-contracts/contracts/link"
import {
  useInkathon,
  useRegisteredContract,
  useRegisteredTypedContract,
} from "@scio-labs/use-inkathon"
import { SubmitHandler, useForm } from "react-hook-form"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import * as z from "zod"
import { Button } from "../ui/button"
import { contractTxWithToast } from "../../utils/contract-tx-with-toast"

const formSchema = z.object({
  url: z.string().min(1),
  slug: z.string().min(1),
})
export const LinkContractInteractions: FC = () => {
  const { api, activeAccount, activeSigner } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(
    ContractIds.Link,
  )
  const { typedContract } = useRegisteredTypedContract(
    ContractIds.Link,
    LinkContract,
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "1234",
      url: "http://localhost:5173/",
    },
  })

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = useCallback(
    async ({ slug, url }) => {
      if (!api) {
        throw new Error("Api not available")
      }
      if (!contract) {
        throw new Error("Contract not available")
      }
      if (!activeAccount) {
        throw new Error("Account not available")
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
    <div className="flex max-w-[22rem] grow flex-col gap-4">
      <h2 className="text-center font-mono text-gray-400">
        link! Smart Contract
      </h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-row items-center gap-4"
        >
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Shorting URL</FormLabel>
                <FormControl>
                  <Input placeholder={"https://use.ink/"} {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Slug</FormLabel>
                <FormControl>
                  <Input placeholder={"https://use.ink/"} {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            SUBMIT
          </Button>
        </form>
      </Form>

      {/* Contract Address */}
      <p className="text-center font-mono text-xs text-gray-600">
        {contract ? contractAddress : "Loading…"}
      </p>
    </div>
  )
}
