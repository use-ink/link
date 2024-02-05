import { UseInkathonProvider } from "@scio-labs/use-inkathon"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import { TooltipProvider } from "./components/ui/tooltip"
import { getDeployments } from "./deployments/deployments.ts"
import "./global.css"

const queryClient = new QueryClient()
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UseInkathonProvider
          appName="link!"
          connectOnInit={true}
          defaultChain={"development"}
          deployments={Promise.resolve(getDeployments("development"))}
        >
          <App />
        </UseInkathonProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
