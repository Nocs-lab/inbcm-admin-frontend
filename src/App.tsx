import { Suspense } from "react"

import { useRoutes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { Toaster } from "react-hot-toast"

import routes from "~react-pages"

const queryClient = new QueryClient()

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen flex items-center justify-center">
          <div
            className="br-loading medium"
            role="progressbar"
            aria-label="carregando exemplo medium exemplo"
          ></div>
        </div>
      }
    >
      <QueryClientProvider client={queryClient}>
        {useRoutes(routes)}
        <Toaster />
      </QueryClientProvider>
    </Suspense>
  )
}
