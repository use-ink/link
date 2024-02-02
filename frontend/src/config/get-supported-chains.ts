/**
 * Returns the supported chains from the environment variables.
 * If the environment variable is not set, it returns the default chain.
 */
export const getSupportedChains = (): string[] => {
  const defaultChain = import.meta.env.VITE_DEFAULT_CHAIN
  return [defaultChain]
}
