import { useSuspenseQuery } from "@tanstack/react-query"
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { format } from "date-fns"
import { Link } from "react-router-dom"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Modal, Button } from "react-dsgov"
import Table from "../../components/Table"
import DefaultLayout from "../../layouts/default"
import request from "../../utils/request"

const columnHelper = createColumnHelper<{
  _id: string
  dataCriacao: Date
  anoDeclaracao: string
  retificacao: boolean
  museu_id: {
    _id: string
    nome: string
  }
  responsavelEnvio: {
    nome: string
  }
  status: string
  museologico: {
    status: string
    pendencias: string[]
  }
  bibliografico: {
    status: string
    pendencias: string[]
  }
  arquivistico: {
    status: string
    pendencias: string[]
  }
  refificacao: boolean
}>()

const columns = [
  columnHelper.accessor("retificacao", {
    header: "Tipo",
    cell: (info) => (info.getValue() ? "Retificadora" : "Original"),
    enableColumnFilter: false
  }),
  columnHelper.accessor("dataCriacao", {
    header: "Envio",
    cell: (info) => format(info.getValue(), "dd/MM/yyyy HH:mm"),
    enableColumnFilter: false
  }),
  columnHelper.accessor("anoDeclaracao", {
    header: "Ano",
    meta: {
      filterVariant: "select"
    }
  }),
  columnHelper.accessor("museu_id.nome", {
    header: "Museu",
    meta: {
      filterVariant: "select"
    }
  }),
  columnHelper.accessor("status", {
    header: "Situação",
    enableColumnFilter: false
  }),
  columnHelper.accessor("_id", {
    header: "Ações",
    enableColumnFilter: false,
    enableSorting: false,
    cell: (info) => (
      <Link to={`/declaracoes/${info.getValue()}`} className="br-link">
        <i className="fas fa-eye" aria-hidden="true"></i> Exibir
      </Link>
    )
  })
]

export default function Analista() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  const { data: museus } = useSuspenseQuery({
    queryKey: ["museus"],
    queryFn: async () => {
      const response = await request("/api/admin/museus")
      return response.json()
    }
  })

  const handleNavigation = (path: string) => {
    if (!museus || museus.length === 0) {
      setShowModal(true)
    } else {
      navigate(path)
    }
  }
  const { data } = useSuspenseQuery({
    queryKey: ["declaracoes"],
    queryFn: async () => {
      const response = await request("/api/admin/declaracoes")
      return response.json()
    }
  })

  return (
    <DefaultLayout>
      <div className="flex items-center justify-between">
        <h2>Minhas declarações</h2>
        <div>
          <Link
            to="#"
            className="btn text-xl p-3"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation("/declaracoes/novo")
            }}
          >
            <i className="fa-solid fa-file-lines p-2"></i>
            Nova declaração
          </Link>
          <Link
            to="#"
            className="btn text-xl p-3"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation("/gestao")
            }}
          >
            <i className="fa-solid fa-chart-line p-2"></i>
            Painel
          </Link>
        </div>
      </div>
      <div
        className="br-table overflow-auto"
        data-search="data-search"
        data-selection="data-selection"
        data-collapse="data-collapse"
        data-random="data-random"
      >
        <Table columns={columns as ColumnDef<unknown>[]} data={data} />
      </div>
      <div className="h-10" />

      {/* Modal */}
      <Modal
        useScrim
        showCloseButton
        title="Declarações não associadas"
        modalOpened={showModal}
        onCloseButtonClick={() => setShowModal(false)}
      >
        <Modal.Body>
          <p>
            Não há declarações associadas ao seu perfil. Entre em contato com o
            administrador do sistema solicitando esse vínculo.
          </p>
        </Modal.Body>
        <Modal.Footer justify-content="center">
          <Button primary onClick={() => setShowModal(false)}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
    </DefaultLayout>
  )
}
