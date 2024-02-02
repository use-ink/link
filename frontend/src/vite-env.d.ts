/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEFAULT_RPC: string
  // more env variables...
  readonly VITE_DEFAULT_CHAIN: string
  readonly VITE_PRODUCTION_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
