import React from "react"
import useStore from "../utils/store"
import Footer from "../components/Footer"
import Header from "../components/Header"
import { Navigate } from "react-router"

const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useStore()

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <>
      <Header />
      <main className="container py-10">
        {children}
      </main>
      <Footer />
    </>
  )
}

export default DefaultLayout
