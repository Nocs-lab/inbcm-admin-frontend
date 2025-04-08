import React from "react"
import useStore from "../utils/store"
import Footer from "../components/Footer"
import Header from "../components/Header"
import { Navigate, Outlet, useLocation } from "react-router"
import { Suspense } from "react"

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full">
      <div className="rounded-lg bg-gray-200 animate-pulse h-4 w-1/2 mb-4"></div>
      <div className="rounded-lg bg-gray-200 animate-pulse h-4 w-1/4 mb-4"></div>
    </div>
  )
}

const DefaultLayout: React.FC = () => {
  const { user } = useStore()
  const location = useLocation()

  // Não redirecionar se estiver tentando acessar login/solicitarAcesso
  if (!user && !["/login", "/solicitarAcesso"].includes(location.pathname)) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container py-10">
          <Suspense fallback={<LoadingSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  )
}

export default DefaultLayout
