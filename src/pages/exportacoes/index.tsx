import React, { useState } from "react"
import { useMutation, useSuspenseQueries } from "@tanstack/react-query"
import Table from "../../components/Table"
import { Link, useNavigate } from "react-router"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import toast from "react-hot-toast"
import request from "../../utils/request"
import { Button, Modal, Select } from "react-dsgov"
import clsx from "clsx"

interface Exportacao {
  _id: string
  status: "nao_iniciada" | "em_andamento" | "concluida" | "erro"
  iniciadoEm?: string
  finalizadoEm?: string
  numeroExportados?: number
  totalExportacoesConcluidas?: number
}

const columnHelper = createColumnHelper<Exportacao>()

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
      } // Cor de sucesso DS-Gov
    case "erro":
      return {
        text: "Erro",
        color: "text-[#e52207]",
        icon: "fa-circle-exclamation"
      } // Cor de erro DS-Gov
    default:
      return {
        text: "Desconhecido",
        color: "text-gray-500",
        icon: "fa-circle-question"
      }
  }
}

const columns = [
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const { text, color, icon } = formatStatus(info.getValue())
      return (
        <span className={clsx("font-semibold", color)}>
          <i className={`fa-solid ${icon} mr-2`}></i>
          {text}
        </span>
      )
    },
    enableColumnFilter: false
  }),
  columnHelper.accessor("iniciadoEm", {
    header: "Iniciado em",
    cell: (info) => {
      const value = info.getValue()
      if (!value)
        return <span className="text-gray-400 italic">Aguardando...</span>
      return new Date(value).toLocaleString("pt-BR")
    },
    enableColumnFilter: false
  }),
  columnHelper.accessor("finalizadoEm", {
    header: "Finalizado em",
    cell: (info) => {
      const value = info.getValue()
      if (!value)
        return <span className="text-gray-400 italic">Aguardando...</span>
      return new Date(value).toLocaleString("pt-BR")
    },
    enableColumnFilter: false
  }),
  columnHelper.accessor("numeroExportados", {
    header: "Itens Exportados",
    cell: (info) => {
      const value = info.getValue()
      return (
        <span className="font-semibold">
          {value !== undefined && value > 0 ? value : "-"}
        </span>
      )
    },
    enableColumnFilter: false
  }),
  columnHelper.display({
    id: "actions",
    header: "Ações",
    cell: (info) => (
      <div className="flex justify-start gap-2">
        <Link
          to={`/exportacoes/${info.row.original._id}`}
          className="btn text-[#1351b4]"
          title="Ver detalhes"
          aria-label={`Ver detalhes da exportação ${info.row.original._id}`}
        >
          <i className="fa-solid fa-eye fa-fw pl-2"></i>
        </Link>
      </div>
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
        throw new Error("Erro ao criar exportação")
      }
      return response.json() as Promise<Exportacao>
    },
    onSuccess: ({ _id }) => {
      navigate(`/exportacoes/${_id}`)
    }
  })

  const handleCreateExportacao = async (anoId: string) => {
    toast.promise(mutateAsync(anoId), {
      loading: "Iniciando processo de exportação...",
      success: "Exportação registrada com sucesso!",
      error: (error) => `Erro ao criar exportação: ${error.message}`
    })
  }

  const [ano, setAno] = useState<string | null>(null)
  const [openModal, setOpenModal] = useState(false)

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2>Listagem de exportações para o Tainacan</h2>
        <button
          className="btn text-xl p-3 text-[#1351b4]"
          onClick={() => setOpenModal(true)}
          title="Nova Exportação"
        >
          <i className="fa-solid fa-plus mr-2"></i> Novo
        </button>
      </div>

      <div className="overflow-x-auto">
        <Table
          columns={columns as unknown as ColumnDef<unknown>[]}
          data={exportacoes}
        />
      </div>

      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <Modal
            title="Nova exportação"
            showCloseButton
            onCloseButtonClick={() => setOpenModal(false)}
          >
            {/* CORREÇÃO DO MODAL: min-h maior e overflow-visible para o Select flutuar livremente */}
            <Modal.Body className="overflow-visible min-h-[300px]">
              <p className="mb-4 text-gray-700">
                Selecione o ano base da declaração para iniciar uma nova
                sincronização com o Tainacan.
              </p>
              <Select
                label="Ano para exportação"
                options={anos.map((ano) => ({
                  value: ano._id,
                  label: ano.ano.toString()
                }))}
                onChange={(value: string) => setAno(value)}
              />
            </Modal.Body>
            <Modal.Footer justify-content="end">
              <Button
                primary
                small
                m={2}
                onClick={() => {
                  handleCreateExportacao(ano!)
                  setOpenModal(false)
                }}
                disabled={ano === null || isPending}
              >
                {isPending ? (
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                ) : null}
                Criar exportação
              </Button>
              <Button secondary small m={2} onClick={() => setOpenModal(false)}>
                Cancelar
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </>
  )
}

export default ExportacoesPage
