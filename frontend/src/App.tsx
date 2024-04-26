import { useMemo } from "react"
import { ConnectButton } from "./components/web3/connect-button"
import { Footer } from "./components/web3/footer"
import { LinkContractInteractions } from "./components/web3/link-contract-interactions"
import { Resolve } from "./components/web3/resolve"

function App() {
  const path = useMemo(() => {
    return window.location.pathname.split("/")[1]
  }, [])
  console.log({ path, query: window.location.search })

  if (path) {
    return <Resolve slug={path} />
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full p-2">
        <div className="flex items-center justify-end">
          <ConnectButton />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-between pt-10">
        <LinkContractInteractions />
      </main>

      <div className="w-full py-2">
        <Footer />
      </div>
    </div>
  )
}

export default App
