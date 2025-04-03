import { Suspense, useEffect } from "react"
import useStore from "./utils/store"
import { RouterProvider } from "react-router/dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "react-hot-toast"
import { ModalProvider } from "./utils/modal"
import router from "./utils/router"
import { useTitle } from "./hooks/useTitle"

const queryClient = new QueryClient()

export default function App() {
  const { user } = useStore()
  useTitle()

  useEffect(() => {
    if (user) {
      if (user.perfil === "analyst" && location.pathname === "/") {
        location.href = "/analista"
      }
    }
  }, [user])

  return (
    <ModalProvider>
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
          <RouterProvider router={router} />
          <Toaster />
        </QueryClientProvider>
      </Suspense>
    </ModalProvider>
  )
}
