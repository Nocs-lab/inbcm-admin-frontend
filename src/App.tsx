import { Suspense, useEffect } from "react"
import useStore from "./utils/store"
import { useRoutes, useNavigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { Toaster } from "react-hot-toast"

import routes from "~react-pages"
import { ModalProvider } from "./utils/modal"

const queryClient = new QueryClient()

export default function App() {
  const navigate = useNavigate()
  const { user } = useStore()

  useEffect(() => {
    if (user) {
      if (user.perfil === "analyst" && location.pathname === "/") {
        navigate("/analista", { replace: true })
      }
    }
  }, [user, navigate])

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
          {useRoutes(routes)}
          <Toaster />
        </QueryClientProvider>
      </Suspense>
    </ModalProvider>
  )
}
