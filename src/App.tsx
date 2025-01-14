import { Suspense } from "react"
import { Navigate, RouterProvider } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { Toaster } from "react-hot-toast"

import { ModalProvider } from "./utils/modal"
import router from "./utils/router"

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
        <ModalProvider>
          <RouterProvider
            router={router}
            fallbackElement={<Navigate to="/error" />}
          />
          <Toaster />
        </ModalProvider>
      </QueryClientProvider>
    </Suspense>
  )
}
