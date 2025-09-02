import { useMutation, useSuspenseQueries } from "@tanstack/react-query"
import Table from "../../components/Table"
import { Link, useNavigate } from "react-router"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import toast from "react-hot-toast"
import request from "../../utils/request"
import { Button, Modal, Select } from "react-dsgov"
import { useState } from "react"

interface Exportacao {
  _id: string
  status: "nao_iniciada" | "em_andamento" | "concluida" | "erro"
  iniciadoEm?: string
  finalizadoEm?: string
  numeroExportados?: number
  totalExportacoesConcluidas?: number
}

const columnHelper = createColumnHelper<Exportacao>()

const columns = [
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      let text

      const status = info.getValue()

      switch (status) {
        case "nao_iniciada":
          text = "Não iniciada"
          break
        case "em_andamento":
          text = "Em andamento"
          break
        case "concluida":
          text = "Concluída"
          break
        case "erro":
          text = "Erro"
          break
        default:
          text = "Desconhecido"
      }

      return <span>{text}</span>
    },
    enableColumnFilter: false
  }),
  columnHelper.accessor("iniciadoEm", {
    header: "Iniciado em",
    cell: (info) => {
      const value = info.getValue()
      if (!value) return "-"
      const date = new Date(value)
      return date.toLocaleString("pt-BR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      })
    },
    enableColumnFilter: false
  }),
  columnHelper.accessor("finalizadoEm", {
    header: "Finalizado em",
    cell: (info) => {
      const value = info.getValue()
      if (!value) return "-"
      const date = new Date(value)
      return date.toLocaleString("pt-BR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      })
    },
    enableColumnFilter: false
  }),
  /*
  columnHelper.accessor("numeroExportados", {
    header: "Total de itens",
    cell: (info) => {
      const value = info.getValue()
      return value !== undefined ? value : "N/A"
    },
    enableColumnFilter: false
  }),
  columnHelper.accessor("totalExportacoesConcluidas", {
    header: "Total de itens exportados",
    cell: (info) => {
      const value = info.getValue()
      return value !== undefined ? value : "N/A"
    },
    enableColumnFilter: false
  }),
  */
  columnHelper.display({
    id: "actions",
    header: "",
    cell: (info) => (
      <Link
        to={`/exportacoes/${info.row.original._id}`}
        className="br-link text-blue-500 hover:underline"
        title="Ver detalhes"
        aria-label={`Ver detalhes da exportação ${info.row.original._id}`}
      >
        Ver Detalhes
      </Link>
    ),
    enableColumnFilter: false
  })
]

const ExportacoesPage: React.FC = () => {
  const navigate = useNavigate()

  const [{ data: exportacoes }, { data: anos }] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["exportacoes"],
        queryFn: async () => {
          const response = await request("/api/admin/exportador/exportacoes")
          if (!response.ok) {
            throw new Error("Erro ao buscar exportações")
          }
          return response.json() as Promise<Exportacao[]>
        },
        refetchInterval: 5000
      },
      {
        queryKey: ["periodos"],
        queryFn: async () => {
          const response = await request("/api/admin/anoDeclaracao/")
          return response.json() as Promise<{ _id: string; ano: number }[]>
        }
      }
    ]
  })

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (anoId: string) => {
      const response = await request("/api/admin/exportador/exportacao", {
        method: "POST",
        body: JSON.stringify({ anoId }),
        headers: { "Content-Type": "application/json" }
      })
      if (!response.ok) {
        throw new Error("Erro ao criar coleções")
      }
      return response.json() as Promise<Exportacao>
    },
    onSuccess: ({ _id }) => {
      navigate(`/exportacoes/${_id}`)
    }
  })

  const handleCreateExportacao = async (anoId: string) => {
    toast.promise(mutateAsync(anoId), {
      loading: "Criando exportação...",
      success: "Exportação criada com sucesso!",
      error: (error) => `Erro ao criar exportação: ${error.message}`
    })
  }

  const [ano, setAno] = useState<string | null>(null)

  const [openModal, setOpenModal] = useState(false)

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2>Exportações</h2>
        <button
          className="br-link text-xl p-3"
          onClick={() => setOpenModal(true)}
        >
          <i className="fa-solid fa-plus"></i> Novo
        </button>
      </div>
      <Table
        columns={columns as unknown as ColumnDef<unknown>[]}
        data={exportacoes}
      />
      <Modal
        showCloseButton
        title="Museu não associado"
        onCloseButtonClick={() => setOpenModal(false)}
        useScrim
        modalOpened={openModal}
      >
        <Modal.Body className="overflow-visible">
          <Select
            label="Selecione o ano para exportação"
            options={anos.map((ano) => ({
              value: ano._id,
              label: ano.ano.toString()
            }))}
            onChange={(value: string) => {
              setAno(value)
            }}
          />
        </Modal.Body>
        <Modal.Footer justify-content="center">
          <Button
            primary
            onClick={() => {
              handleCreateExportacao(ano!)
              setOpenModal(false)
            }}
            disabled={ano === null || isPending}
          >
            {isPending ? "Criando exportação..." : "Criar Exportação"}
          </Button>
          <Button secondary onClick={() => setOpenModal(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default ExportacoesPage
