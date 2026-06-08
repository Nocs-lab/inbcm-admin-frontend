import React from "react"
import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { Link, useParams } from "react-router"
import request from "../../utils/request"
import clsx from "clsx"

interface Exportacao {
  _id: string
  status: "nao_iniciada" | "em_andamento" | "concluida" | "erro"
  erro?: string
  iniciadoEm?: string
  finalizadoEm?: string
  usuario: {
    nome: string
    email: string
  }
  numeroExportados?: number
  totalExportacoesConcluidas?: number
  colecoesCriadas: boolean
}

const formatStatus = (status: string) => {
  switch (status) {
    case "nao_iniciada":
      return {
        text: "Não iniciada",
        color: "text-gray-500",
        icon: "fa-circle-pause"
      }
    case "em_andamento":
      return {
        text: "Em andamento",
        color: "text-[#1351b4]",
        icon: "fa-spinner fa-spin"
      }
    case "concluida":
      return {
        text: "Concluída",
        color: "text-[#0b7016]",
        icon: "fa-circle-check"
      } // Verde Oficial DS-Gov
    case "erro":
      return {
        text: "Erro",
        color: "text-[#e52207]",
        icon: "fa-circle-exclamation"
      } // Vermelho Oficial DS-Gov
    default:
      return {
        text: "Desconhecido",
        color: "text-gray-500",
        icon: "fa-circle-question"
      }
  }
}

const ExportacaoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  const { data, refetch } = useSuspenseQuery({
    queryKey: ["exportacao", id],
    queryFn: async () => {
      const response = await request(`/api/admin/exportador/exportacao/${id}`)
      if (!response.ok) throw new Error("Erro ao buscar exportação")
      return response.json() as Promise<Exportacao>
    },
    refetchInterval: (query) => {
      const estadoAtual = query.state.data as Exportacao | undefined
      if (estadoAtual && estadoAtual.status === "em_andamento") {
        return 3000
      }
      return false
    }
  })

  const {
    text: statusText,
    color: statusColor,
    icon: statusIcon
  } = formatStatus(data.status)

  const { mutateAsync: mutateColecoes, isPending: isPendingColecoes } =
    useMutation({
      mutationFn: async () => {
        const response = await request(
          `/api/admin/exportador/exportacao/${id}/criar-colecoes`,
          { method: "POST" }
        )
        if (!response.ok)
          throw new Error("Erro ao preparar coleções no Tainacan")
        return response.json()
      },
      onSuccess: () => {
        toast.success("Coleções preparadas com sucesso!")
        refetch()
      },
      onError: (error: Error) => {
        toast.error(error.message || "Erro ao preparar coleções")
      }
    })

  const criarColecoes = () => {
    toast.promise(mutateColecoes(), {
      loading: "Preparando estrutura no Tainacan...",
      success: "Estrutura pronta!",
      error: (error: Error) => error.message || "Erro ao criar coleções"
    })
  }

  const { mutateAsync: iniciarExportacao, isPending: isPendingExportacao } =
    useMutation({
      mutationFn: async () => {
        const response = await request(
          `/api/admin/exportador/exportacao/${id}/exportar`,
          { method: "POST" }
        )
        if (!response.ok) throw new Error("Erro ao iniciar exportação")
        return response.json()
      },
      onSuccess: () => {
        toast.success("Sincronização em background iniciada!")
        refetch()
      },
      onError: (error: Error) => {
        toast.error(error.message || "Erro ao iniciar exportação")
      }
    })

  const iniciar = () => {
    toast.promise(iniciarExportacao(), {
      loading: "Enviando comando para o servidor...",
      success: "Exportação em andamento!",
      error: (error: Error) => error.message || "Erro ao iniciar exportação"
    })
  }

  const baixarArquivos = () => {
    toast.promise(
      (async () => {
        const response = await fetch(
          `/api/admin/exportador/exportacao/${id}/download`,
          {
            method: "GET",
            credentials: "include"
          }
        )
        if (response.status === 401)
          throw new Error("Sessão expirada. Recarregue a página.")
        if (!response.ok) throw new Error("Erro ao baixar arquivos")

        const blob = await response.blob()
        let url: string | null = null
        try {
          url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `exportacao-inbcm-${id}.zip`
          document.body.appendChild(a)
          a.click()
          a.remove()
        } finally {
          if (url) window.URL.revokeObjectURL(url)
        }
      })(),
      {
        loading: "Compactando base de dados...",
        success: "Download pronto!",
        error: (error: Error) => error.message || "Erro ao baixar arquivos"
      }
    )
  }

  const isEmAndamentoGeral =
    data.status === "em_andamento" || isPendingColecoes || isPendingExportacao

  return (
    <div className="container mx-auto p-8">
      <Link
        to="/exportacoes"
        className="text-lg text-[#1351b4] mb-6 inline-block font-medium"
      >
        <i className="fas fa-arrow-left mr-2" aria-hidden="true"></i>
        Voltar
      </Link>

      <h2 className="mt-4 mb-6 text-gray-800">Painel de sincronização</h2>

      {/* Alerta de Sincronização em Background (Padrão DS-Gov Info) */}
      {data.status === "em_andamento" && (
        <div className="br-message info mb-6" role="alert">
          <div className="icon">
            <i className="fas fa-info-circle fa-lg" aria-hidden="true"></i>
          </div>
          <div className="content">
            <span className="message-title">Sincronização em andamento. </span>
            <span className="message-body">
              Os lotes de dados estão sendo enviados ao Tainacan em background.
              O desempenho do sistema não será afetado.
            </span>
          </div>
        </div>
      )}

      {/* Alerta de Erro */}
      {data.status === "erro" && data.erro && (
        <div className="br-message danger mb-6" role="alert">
          <div className="icon">
            <i className="fas fa-times-circle fa-lg" aria-hidden="true"></i>
          </div>
          <div className="content">
            <span className="message-title">Falha no processamento: </span>
            <span className="message-body">{data.erro}</span>
          </div>
        </div>
      )}

      <fieldset
        className="rounded-lg p-3"
        style={{ border: "2px solid #e0e0e0" }}
      >
        <legend className="text-lg font-extrabold px-3 m-0">
          Detalhes da exportação (ID: {data._id.substring(0, 6)}...)
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full p-4">
          <div>
            <label className="block text-sm text-gray-500 font-semibold mb-1">
              Status atual
            </label>
            <div className={`text-lg font-semibold ${statusColor}`}>
              <i className={`fa-solid ${statusIcon} mr-2`}></i>
              {statusText}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-500 font-semibold mb-1">
              Operador responsável
            </label>
            <div className="text-gray-800 font-medium">
              <i className="fa-solid fa-user-shield text-gray-400 mr-2"></i>
              {data.usuario.nome}{" "}
              <span className="text-sm font-normal text-gray-500">
                ({data.usuario.email})
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-500 font-semibold mb-1">
              Início da operação
            </label>
            <div className="text-gray-800">
              <i className="fa-regular fa-clock text-gray-400 mr-2"></i>
              {data.iniciadoEm ? (
                new Date(data.iniciadoEm).toLocaleString("pt-BR")
              ) : (
                <span className="text-gray-400 italic">Aguardando início</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-500 font-semibold mb-1">
              Conclusão da operação
            </label>
            <div className="text-gray-800">
              <i className="fa-solid fa-flag-checkered text-gray-400 mr-2"></i>
              {data.finalizadoEm ? (
                new Date(data.finalizadoEm).toLocaleString("pt-BR")
              ) : (
                <span className="text-gray-400 italic">
                  Aguardando finalização
                </span>
              )}
            </div>
          </div>

          {data.status === "concluida" && (
            <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-200">
              <label className="block text-sm text-gray-500 font-semibold mb-1">
                Total de itens de acervo exportados
              </label>
              <div className="text-2xl text-[#1351b4] font-extrabold">
                {data.numeroExportados}{" "}
                <span className="text-base font-normal text-gray-600">
                  registros validados no Tainacan
                </span>
              </div>
            </div>
          )}
        </div>
      </fieldset>

      <fieldset
        className="rounded-lg p-3 mt-6"
        style={{ border: "2px solid #e0e0e0" }}
      >
        <legend className="text-lg font-extrabold px-3 m-0">
          Ações de sincronização
        </legend>
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <p className="text-sm text-gray-600 m-0 max-w-lg">
            Siga os passos para publicar o acervo no portal Tainacan. O processo
            ocorre em lote.
          </p>

          <div className="flex flex-wrap gap-3 justify-end">
            <button
              className={clsx(
                "br-button secondary",
                isPendingColecoes && "loading"
              )}
              onClick={criarColecoes}
              disabled={data.colecoesCriadas || isEmAndamentoGeral}
            >
              <i className="fa-solid fa-layer-group pr-2"></i>
              1. Preparar coleções
            </button>

            <button
              className={clsx(
                "br-button primary",
                isPendingExportacao && "loading"
              )}
              disabled={
                !data.colecoesCriadas ||
                data.status !== "nao_iniciada" ||
                isEmAndamentoGeral
              }
              onClick={iniciar}
            >
              <i className="fa-solid fa-cloud-arrow-up pr-2"></i>
              2. Sincronizar
            </button>

            <button
              className="br-button"
              style={{ border: "1px solid #ccc", background: "white" }}
              disabled={data.status !== "concluida"}
              onClick={baixarArquivos}
            >
              <i className="fa-solid fa-file-zipper pr-2 text-gray-600"></i>
              Baixar CSV
            </button>
          </div>
        </div>
      </fieldset>
    </div>
  )
}

export default ExportacaoPage
