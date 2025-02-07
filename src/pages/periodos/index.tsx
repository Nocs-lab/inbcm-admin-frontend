import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from "@tanstack/react-query"
import Table from "../../components/Table"
import request from "../../utils/request"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { format } from "date-fns"
import { Link } from "react-router"
import { FaCalendar, FaEdit, FaPlus, FaTrash } from "react-icons/fa"
import { useModal } from "../../utils/modal"
import { Button, Modal } from "react-dsgov"
import toast from "react-hot-toast"

interface Ano {
  _id: string
  ano: number
  dataFimSubmissao: Date
  dataInicioSubmissao: Date
  dataInicioRetificacao: Date
  dataFimRetificacao: Date
  metaDeclaracoesEnviadas: number
}

const ActionsCell: React.FC<{ id: string }> = ({ id }) => {
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
        loading: "Deletando...",
        success: "Período deletado com sucesso",
        error: "Erro ao deletar período"
      },
      {
        style: {
          minWidth: "250px"
        }
      }
    )
  }

  const { closeModal, openModal } = useModal((close) => (
    <Modal title="Deletar período?" showCloseButton onCloseButtonClick={close}>
      <Modal.Body>Você tem certeza que deseja deletar este período?</Modal.Body>
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
      <Link to={`/periodos/${id}`} className="btn btn-sm btn-primary">
        <FaEdit />
      </Link>
      <button onClick={openModal} className="btn btn-sm text-[#1351b4]">
        <FaTrash />
      </button>
    </div>
  )
}

const columnHelper = createColumnHelper<Ano>()

const columns = [
  columnHelper.accessor("ano", {
    header: "Ano",
    enableColumnFilter: true
  }),
  columnHelper.accessor("dataInicioSubmissao", {
    header: "Início Submissão",
    cell: (info) => format(info.getValue(), "dd/MM/yyyy HH:mm"),
    enableColumnFilter: false
  }),
  columnHelper.accessor("dataFimSubmissao", {
    header: "Fim Submissão",
    cell: (info) => format(info.getValue(), "dd/MM/yyyy HH:mm"),
    enableColumnFilter: false
  }),
  columnHelper.accessor("dataInicioRetificacao", {
    header: "Início Retificação",
    cell: (info) => format(info.getValue(), "dd/MM/yyyy HH:mm"),
    enableColumnFilter: false
  }),
  columnHelper.accessor("dataFimRetificacao", {
    header: "Fim Retificação",
    cell: (info) => format(info.getValue(), "dd/MM/yyyy HH:mm"),
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
    cell: (info) => <ActionsCell id={info.getValue()} />,
    enableColumnFilter: false,
    enableSorting: false
  })
]

const Gestao: React.FC = () => {
  const { data: rawData } = useSuspenseQuery({
    queryKey: ["periodos"],
    queryFn: async () => {
      const response = await request("/api/admin/anoDeclaracao/")
      return response.json()
    }
  })

  const data = rawData.map((item: Ano) => ({
    ...item,
    ano: item.ano.toString()
  }))

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2>Períodos de submissão</h2>
        <Link
          to="/periodos/novo"
          className="btn text-xl p-3 flex items-center gap-2"
        >
          <FaCalendar />
          <FaPlus size={12} className="-ml-2 mb-1" />
          Novo
        </Link>
      </div>
      <Table columns={columns as ColumnDef<unknown>[]} data={data} />
    </>
  )
}

export default Gestao
