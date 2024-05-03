# Polkadot DApp Template (WIP)

## Todo

- ~~fix api types~~
- use [`@polkadot/typegen`](https://polkadot.js.org/docs/api/examples/promise/typegen) instead of `@polkadot/api-augment`
- allow for passing status callback?
- ~~context guards which assure `api`, `currentAccount` etc is set~~
- eager connect?
- rotate RPCs
- ~~RPC from url~~
- check if pallet is available
- describe decisions in README


## Goals

(**Note: Work in Progress**)

- don't use centralized services
- don't require a deployed backend
- production ready settings
- decentralized deployment possible
- runnable locally
- best typescript experience possible
- light client first
- use state for art tools for DApps in the Polkadot Ecosystem
- reasonable bundle size

## Stack

- typescript
- vite
- tailwindcss
- shadcn/ui
- react-query
- polkadotjs/api
- (polkadotjs/api-augment)

## Built in Components

- `<Web3Provider />`
- `<ApiProvider />`

## Typegen

(**Note: Work in Progress**)

```json
{
  "scripts": {
    "typegen": "pnpm typegen:defs && pnpm typegen:meta",
    "typegen:defs": "polkadot-types-from-defs --package sample-polkadotjs-typegen/interfaces --input ./src/interfaces --endpoint ./metadata.json",
    "typegen:meta": "polkadot-types-from-chain --package sample-polkadotjs-typegen/interfaces --endpoint ./metadata.json --output ./src/interfaces",
    "metadata": "curl -H \"Content-Type: application/json\" -d '{\"id\":\"1\", \"jsonrpc\":\"2.0\", \"method\": \"state_getMetadata\", \"params\":[]}' http://localhost:9944 > metadata.json"
  }
}
```
