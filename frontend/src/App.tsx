import { useMemo } from "react"
import { ConnectButton } from "./components/web3/connect-button"
import { Footer } from "./components/web3/footer"
import { LinkContractInteractions } from "./components/web3/link-contract-interactions"
import { Resolve } from "./components/web3/resolve"

function App() {
  const path = useMemo(() => {
    return window.location.pathname.split("/")[1]
  }, [])

  if (path) {
    return <Resolve slug={path} />
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-end gap-3 px-3">
          <div className="flex flex-row items-center gap-4">
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-between pt-10">
        <LinkContractInteractions />

        <div className="py-2">
          <Footer />
        </div>
      </main>
    </div>
  )
}

export default App
