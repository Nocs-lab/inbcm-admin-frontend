import React from "react"
import useStore from "../utils/store"
import Footer from "../components/Footer"
import Header from "../components/Header"
import { Navigate } from "react-router"

const DefaultLayout: React.FC<{
  children: React.ReactNode
  title?: string
}> = ({ children, title }) => {
  const { user } = useStore()

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container py-10">
          <h2>{title}</h2>
          {children}
        </main>
        <Footer />
      </div>
    </>
  )
}

export default DefaultLayout
