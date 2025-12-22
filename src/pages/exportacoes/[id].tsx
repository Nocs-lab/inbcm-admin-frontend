import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { Link, useParams } from "react-router"
import request from "../../utils/request"

interface Exportacao {
  _id: string
  status: "nao_iniciada" | "em_andamento" | "concluida" | "erro"
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

const ExportacaoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  const { data, refetch } = useSuspenseQuery({
    queryKey: ["exportacao", id],
    queryFn: async () => {
      const response = await request(`/api/admin/exportador/exportacao/${id}`)
      if (!response.ok) {
        throw new Error("Erro ao buscar exportação")
      }
      return response.json() as Promise<Exportacao>
    },
    refetchInterval: 5000
  })

  let statusText = ""

  switch (data.status) {
    case "nao_iniciada":
      statusText = "Não iniciada"
      break
    case "em_andamento":
      statusText = "Em andamento"
      break
    case "concluida":
      statusText = "Concluída"
      break
    case "erro":
      statusText = "Erro"
      break
    default:
      statusText = "Desconhecido"
  }

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      const response = await request(
        `/api/admin/exportador/exportacao/${id}/criar-colecoes`,
        {
          method: "POST"
        }
      )
      if (!response.ok) {
        throw new Error("Erro ao criar coleções")
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success("Coleções criadas com sucesso!")
      refetch()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar coleções")
    }
  })

  const criarColecoes = () => {
    toast.promise(mutateAsync(), {
      loading: "Criando coleções...",
      success: "Coleções criadas com sucesso!",
      error: (error: Error) => error.message || "Erro ao criar coleções"
    })
  }

  const { mutateAsync: iniciarExportacao } = useMutation({
    mutationFn: async () => {
      const response = await request(
        `/api/admin/exportador/exportacao/${id}/exportar`,
        {
          method: "POST"
        }
      )
      if (!response.ok) {
        throw new Error("Erro ao iniciar exportação")
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success("Exportação iniciada com sucesso!")
      refetch()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao iniciar exportação")
    }
  })

  const iniciar = () => {
    toast.promise(iniciarExportacao(), {
      loading: "Iniciando exportação...",
      success: "Exportação iniciada com sucesso!",
      error: (error: Error) => error.message || "Erro ao iniciar exportação"
    })
  }

  const baixarArquivos = () => {
    toast.promise(
      (async () => {
        const response = await fetch(`/api/admin/exportador/exportacao/${id}/download`, {
          method: "GET",
          credentials: "include"
        })

        if (response.status === 401) {
          throw new Error("Sessão expirada. Recarregue a página.")
        }

        if (!response.ok) {
          throw new Error("Erro ao baixar arquivos")
        }

        const blob = await response.blob()
        let url: string | null = null
        try {
          url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `exportacao-${id}.zip`
          document.body.appendChild(a)
          a.click()
          a.remove()
        } finally {
          if (url) {
            window.URL.revokeObjectURL(url)
          }
        }
      })(),
      {
        loading: "Baixando arquivos...",
        success: "Download iniciado com sucesso!",
        error: (error: Error) =>
          error.message || "Erro ao baixar arquivos"
      }
    )
  }

  return (
    <div className="container mx-auto p-8">
      <Link to="/exportacoes" className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
      <h2>Detalhes da exportação</h2>
      <div className="grid gap-4 mt-4 grid-cols-1 md:grid-cols-2">
        <p>
          <strong>Status:</strong> {statusText}
        </p>
        <p>
          <strong>Iniciado em:</strong>{" "}
          {data.iniciadoEm
            ? new Date(data.iniciadoEm).toLocaleString("pt-BR")
            : "N/A"}
        </p>
        <p>
          <strong>Finalizado em:</strong>{" "}
          {data.finalizadoEm
            ? new Date(data.finalizadoEm).toLocaleString("pt-BR")
            : "N/A"}
        </p>
        <p>
          <strong>Usuário:</strong> {data.usuario.nome} ({data.usuario.email})
        </p>
        {/*
          <p><strong>Total de itens:</strong> {data.numeroExportados ?? "N/A"}</p>
          <p><strong>Total de itens exportados:</strong> {data.totalExportacoesConcluidas ?? "N/A"}</p>
        */}
      </div>
      <div className="mt-6 flex space-x-4">
        <button
          className="br-button primary"
          onClick={criarColecoes}
          disabled={data.colecoesCriadas || isPending}
        >
          Criar Coleções
        </button>
        <button
          className="br-button primary"
          disabled={
            !data.colecoesCriadas || data.status !== "nao_iniciada" || isPending
          }
          onClick={iniciar}
        >
          Iniciar exportação
        </button>
        <button
          className="br-button secondary"
          disabled={data.status !== "concluida"}
          onClick={baixarArquivos}
        >
          Baixar Arquivos
        </button>
      </div>
    </div>
  )
}

export default ExportacaoPage
