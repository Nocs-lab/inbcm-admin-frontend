import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from "@tanstack/react-query"
import Table from "../../components/Table"
import request from "../../utils/request"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Link } from "react-router"
import { FaCalendar, FaEdit, FaPlus, FaTrash } from "react-icons/fa"
import { useModal } from "../../utils/modal"
import { Button, Modal } from "react-dsgov"
import toast from "react-hot-toast"
import { useState, useMemo } from "react"
import clsx from "clsx"

interface Ano {
  _id: string
  ano: number
  dataFimSubmissao: Date
  dataInicioSubmissao: Date
  dataInicioRetificacao: Date
  dataFimRetificacao: Date
  metaDeclaracoesEnviadas: number
  declaracaoVinculada: boolean
}

const ActionsCell: React.FC<{ id: string; declaracaoVinculada: boolean }> = ({
  id,
  declaracaoVinculada
}) => {
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      const response = await request(`/api/admin/anoDeclaracao/${id}`, {
        method: "DELETE"
      })
      return response.json()
    },
    onMutate: () => {
      closeModal()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periodos"] })
    }
  })

  const handleDeleteUser = async () => {
    toast.promise(
      mutateAsync(),
      {
        loading: "Apagando...",
        success: "Período apagado com sucesso",
        error: "Erro ao apgar período"
      },
      {
        style: {
          minWidth: "250px"
        }
      }
    )
  }

  const { closeModal, openModal } = useModal((close) => (
    <Modal title="Apagar período?" showCloseButton onCloseButtonClick={close}>
      <Modal.Body>Você tem certeza que deseja apagar este período?</Modal.Body>
      <Modal.Footer justify-content="end">
        <Button primary small m={2} onClick={handleDeleteUser}>
          Confirmar
        </Button>
        <Button secondary small m={2} onClick={close}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  ))

  return (
    <div className="flex gap-2">
      <Link to={`/configuracoes/${id}`} className="btn btn-sm btn-primary">
        <FaEdit />
      </Link>
      <button
        onClick={openModal}
        className="btn btn-sm text-[#1351b4]"
        disabled={declaracaoVinculada}
      >
        <FaTrash />
      </button>
    </div>
  )
}

const columnHelper = createColumnHelper<Ano>()

const Gestao: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"emails" | "submissao">(
    "submissao"
  )

  const { data: rawData } = useSuspenseQuery({
    queryKey: ["periodos"],
    queryFn: async () => {
      const response = await request("/api/admin/anoDeclaracao/")
      return response.json()
    }
  })

  const data = useMemo(
    () =>
      rawData.map((item: Ano) => ({
        ...item,
        ano: item.ano.toString()
      })),
    [rawData]
  )

  const columns = useMemo(
    () =>
      [
        ...(activeTab === "submissao"
          ? [
              columnHelper.accessor("ano", {
                header: "Ano",
                enableColumnFilter: true
              }),
              columnHelper.accessor("dataInicioSubmissao", {
                header: "Início Submissão",
                cell: (info) =>
                  format(info.getValue(), "dd/MM/yyyy HH:mm", { locale: ptBR }),
                enableColumnFilter: false
              }),
              columnHelper.accessor("dataFimSubmissao", {
                header: "Fim Submissão",
                cell: (info) =>
                  format(info.getValue(), "dd/MM/yyyy HH:mm", { locale: ptBR }),
                enableColumnFilter: false
              }),
              columnHelper.accessor("dataInicioRetificacao", {
                header: "Início Retificação",
                cell: (info) =>
                  format(info.getValue(), "dd/MM/yyyy HH:mm", { locale: ptBR }),
                enableColumnFilter: false
              }),
              columnHelper.accessor("dataFimRetificacao", {
                header: "Fim Retificação",
                cell: (info) =>
                  format(info.getValue(), "dd/MM/yyyy HH:mm", { locale: ptBR }),
                enableColumnFilter: false
              }),
              columnHelper.accessor("metaDeclaracoesEnviadas", {
                header: "Meta",
                cell: (info) => info.getValue(),
                enableColumnFilter: false,
                enableSorting: false
              }),
              columnHelper.accessor("_id", {
                header: "Ações",
                cell: (info) => (
                  <ActionsCell
                    id={info.getValue()}
                    declaracaoVinculada={info.row.original.declaracaoVinculada}
                  />
                ),
                enableColumnFilter: false,
                enableSorting: false
              })
            ]
          : [])
      ] as ColumnDef<Ano>[],
    [activeTab]
  )

  return (
    <>
      <h2>Configurações do sistema</h2>

      <div className="br-tab small">
        <nav className="tab-nav">
          <ul>
            <li
              className={clsx(
                "tab-item",
                activeTab === "submissao" && "active"
              )}
            >
              <button type="button" onClick={() => setActiveTab("submissao")}>
                <span className="name">Submissões</span>
              </button>
            </li>
            <li
              className={clsx("tab-item", activeTab === "emails" && "active")}
            >
              <button type="button" onClick={() => setActiveTab("emails")}>
                <span className="name">E-mails</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {activeTab === "submissao" && (
        <div>
          <div className="flex flex-row-reverse justify-between items-center mb-4 p-2">
            <Link
              to="/configuracoes/novo"
              className="btn text-xl p-3 flex items-center gap-2"
            >
              <FaCalendar />
              <FaPlus size={12} className="-ml-2 mb-1" />
              Novo
            </Link>
          </div>

          <div className="relative">
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <Table
                    columns={columns as ColumnDef<unknown>[]}
                    data={data}
                    className="min-w-[800px] md:min-w-full"
                  />
                </div>
              </div>
            </div>

            {/* Indicador de scroll para mobile */}
            <div className="md:hidden text-center mt-2 text-sm text-gray-500">
              <span className="animate-pulse">← Arraste para ver mais →</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "emails" && (
        <div>
          {/* Conteúdo da aba de emails */}
          <p>Conteúdo da aba de emails aqui</p>
        </div>
      )}
    </>
  )
}

export default Gestao
