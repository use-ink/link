import { ChainInfo } from "./components/web3/chain-info"
import { ConnectButton } from "./components/web3/connect-button"
import { LinkContractInteractions } from "./components/web3/link-contract-interactions"

function App() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-end gap-3 px-3">
          <div className="flex flex-row items-center gap-4">
            <ConnectButton />
          </div>
        </div>
      </header>
      <div className="flex-1">
        <main className="flex-1">
          <div>
            <LinkContractInteractions />
            <ChainInfo />
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
