/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getSupportedChains } from "./get-supported-chains"
import { getURL } from "./get-url"

/**
 * Environment Variables defined in `.env.local`.
 * See `env.local.example` for documentation.
 */
export const env = {
  url: getURL(),
  isProduction: import.meta.env.PRODUCTION_MODE === "true",
  defaultChain: import.meta.env.VITE_DEFAULT_CHAIN,
  supportedChains: getSupportedChains(),
}
