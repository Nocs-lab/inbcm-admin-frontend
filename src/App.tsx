import { Suspense } from "react"

import { useRoutes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import routes from "~react-pages"

const queryClient = new QueryClient()

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QueryClientProvider client={queryClient}>
        {useRoutes(routes)}
      </QueryClientProvider>
    </Suspense>
  )
}
