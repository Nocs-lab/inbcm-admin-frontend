import { useLocation } from "react-router"
import { Link, useSearchParams } from "react-router-dom"

export default function Error() {
  const location = useLocation()
  const [params] = useSearchParams()
  const statusText = params.get("status")
  const status = statusText ? parseInt(statusText) : null
  const { message } = location.state as {
    message: string
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">Erro {status}</h1>
        <p className="text-lg font-semibold text-gray-500">
          {status
            ? (message ?? "Ocorreu um erro inesperado")
            : "Ocorreu um erro inesperado"}
        </p>
        <p>Por favor, tente novamente mais tarde.</p>
        <Link to="/" className="br-link">
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  )
}
