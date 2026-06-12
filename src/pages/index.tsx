import { useQuery } from "@tanstack/react-query"
import clsx from "clsx"
import { useState } from "react"
import request from "../utils/request"

const IndexPage = () => {
  const [iframeLoaded, setIframeLoaded] = useState(false)

  const { data, isPending, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await request("/api/admin/dashboard")
      return res.json() as Promise<{ token: string }>
    },
    refetchOnWindowFocus: false,
    retry: 1
  })

  const metabaseBaseUrl = import.meta.env.VITE_METABASE_SITE_URL

  // Confirma se houve erro definitivo após a tentativa de carregamento
  const hasError = !isPending && (isError || !metabaseBaseUrl || !data?.token)

  const iframeUrl =
    metabaseBaseUrl && data?.token
      ? `${metabaseBaseUrl}/embed/dashboard/${data.token}#bordered=false&titled=false`
      : ""

  return (
    <>
      <h2 className="mb-6">Painel analítico</h2>

      {/* Container Relativo: Permite que o Modal fique por cima do Skeleton */}
      <div className="relative w-full min-h-[500px]">
        {/* Modal de Erro: Aparece flutuando sobre o Skeleton com um fundo semi-transparente */}
        {hasError && (
          <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/50 backdrop-blur-sm pt-20">
            <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 text-center max-w-sm">
              <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Erro de Conexão
              </h3>
              <p className="text-gray-600 text-sm">
                Não foi possível carregar as informações do painel analítico no
                momento.
              </p>
            </div>
          </div>
        )}

        {/* Skeleton: Agora ele SÓ SOME se o Iframe carregar. Se der erro, ele fica travado na tela. */}
        {!iframeLoaded && (
          <div className="animate-pulse flex flex-col gap-6 w-full">
            {/* Linha 1: Filtros (6 botões) */}
            <div className="flex flex-wrap gap-4 border-b pb-4">
              <div className="h-10 w-36 bg-gray-200 rounded-md"></div>
              <div className="h-10 w-36 bg-gray-200 rounded-md"></div>
              <div className="h-10 w-36 bg-gray-200 rounded-md"></div>
              <div className="h-10 w-36 bg-gray-200 rounded-md"></div>
              <div className="h-10 w-36 bg-gray-200 rounded-md"></div>
              <div className="h-10 w-44 bg-gray-200 rounded-md"></div>
            </div>

            {/* Linha 2: 6 Cards de KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="h-32 bg-gray-200 rounded-lg shadow-sm"></div>
              <div className="h-32 bg-gray-200 rounded-lg shadow-sm"></div>
              <div className="h-32 bg-gray-200 rounded-lg shadow-sm"></div>
              <div className="h-32 bg-gray-200 rounded-lg shadow-sm"></div>
              <div className="h-32 bg-gray-200 rounded-lg shadow-sm"></div>
              <div className="h-32 bg-gray-200 rounded-lg shadow-sm"></div>
            </div>

            {/* Linha 3: Gráficos (1 Largo, 1 Menor) */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="h-96 w-full lg:w-2/3 bg-gray-200 rounded-lg shadow-sm"></div>
              <div className="h-96 w-full lg:w-1/3 bg-gray-200 rounded-lg shadow-sm"></div>
            </div>
          </div>
        )}

        {/* Iframe do Metabase - Se houver erro, a URL será vazia e ele nem renderiza */}
        {!hasError && iframeUrl && (
          <iframe
            src={iframeUrl}
            width="100%"
            height={2000}
            className={clsx("border-0", !iframeLoaded && "hidden")}
            title="Dashboard Analítico"
            onLoad={() => setIframeLoaded(true)}
          />
        )}
      </div>
    </>
  )
}

export default IndexPage
