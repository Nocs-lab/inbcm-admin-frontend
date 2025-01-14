import { Navigate } from "react-router"

export default function Rrror404() {
  return (
    <Navigate
      to="/error?status=404"
      state={{ message: "Página não encontrada" }}
    />
  )
}
