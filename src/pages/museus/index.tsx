import { useSuspenseQuery, useMutation, useQuery } from "@tanstack/react-query"
import { createColumnHelper } from "@tanstack/react-table"
import { Modal, Button, Loading } from "react-dsgov"
import { useModal } from "../../utils/modal"
import request from "../../utils/request"
import Table from "../../components/TableMuseus"
import { useState } from "react"
import toast from "react-hot-toast"

interface Endereco {
  municipio: string
  uf: string
  bairro: string
}

interface Museu {
  _id: string
  codIbram: string
  nome: string
  endereco: Endereco
  esferaAdministraiva: string
  regiao: string
  __v: number
}

interface ApiResponse {
  itens: Museu[]
  total: number
  page: number
  limit: number
  totalPages: number
  links: {
    first: string
    prev: string | null
    next: string | null
    last: string
  }
}

interface LastImport {
  _id?: string
  status: string
  iniciadoEm: string | null
  totalImportacoesConcluidas: number
  usuario: {
    _id?: string
    nome?: string
    email?: string
  } | null
  __v?: number
  finalizadoEm: string | null
  museusCadastrados?: number
  numeroImportados?: number
}

interface ImportStatusResponse {
  status: string
  mensagem: string
  importacaoId: string
  usuario?: {
    _id?: string
    nome?: string
    email?: string
  }
}

const TableMuseus: React.FC = () => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [importacaoId, setImportacaoId] = useState<string | null>(null)

  const { data: museusData } = useSuspenseQuery<ApiResponse>({
    queryKey: ["museus", page, limit],
    queryFn: async () => {
      const res = await request(
        `/api/admin/museus/listar-museus?page=${page}&limit=${limit}`
      )
      return await res.json()
    }
  })

  const { data: lastImportData } = useSuspenseQuery<LastImport>({
    queryKey: ["last-import"],
    queryFn: async () => {
      const res = await request("/api/admin/imports/last")
      return await res.json()
    }
  })

  const startImportMutation = useMutation({
    mutationFn: async () => {
      const response = await request("/api/admin/imports/start", {
        method: "POST"
      })
      return response.json()
    },
    onSuccess: (data: { importacaoId: string }) => {
      setImportacaoId(data.importacaoId)
    }
  })

  const { data: importStatus } = useQuery<ImportStatusResponse>({
    queryKey: ["import-status", importacaoId],
    queryFn: async () => {
      const res = await request(`/api/admin/imports/${importacaoId}/status`)
      const data = await res.json()

      if (data.status === "concluida") {
        toast.success(data.mensagem || "Importação finalizada com sucesso!", {
          duration: 9000,
          position: "top-center"
        })
        setImportacaoId(null)
      }

      if (data.status === "erro") {
        toast.error(data.mensagem || "Erro ao importar dados!", {
          duration: 9000,
          position: "top-center"
        })
        setImportacaoId(null)
      }

      return data
    },
    enabled: !!importacaoId,
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  })

  const isLoading =
    startImportMutation.isPending ||
    (!!importacaoId && importStatus?.status !== "concluida")

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "00/00/0000 às 00:00:00"

    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Data inválida"

    return (
      date.toLocaleDateString("pt-BR") +
      " às " +
      date.toLocaleTimeString("pt-BR")
    )
  }

  const columnHelper = createColumnHelper<Museu>()

  const columns = [
    columnHelper.accessor("codIbram", {
      header: "Cód. IBRAM",
      enableColumnFilter: false
    }),
    columnHelper.accessor("nome", {
      header: "Nome",
      enableColumnFilter: true
    }),
    columnHelper.accessor("esferaAdministraiva", {
      header: "Esfera Administrativa",
      enableColumnFilter: true
    }),
    columnHelper.accessor("regiao", {
      header: "Região",
      enableColumnFilter: true,
      meta: {
        filterVariant: "select"
      }
    }),
    columnHelper.accessor("endereco.uf", {
      header: "UF",
      enableColumnFilter: true,
      meta: {
        filterVariant: "select"
      }
    }),
    columnHelper.accessor("endereco.municipio", {
      header: "Município",
      enableColumnFilter: true
    }),
    columnHelper.accessor("endereco.bairro", {
      header: "Bairro",
      enableColumnFilter: true
    })
  ]

  const { openModal } = useModal((close) => (
    <Modal
      title="Importar cadastro de MuseusBR"
      showCloseButton
      onCloseButtonClick={close}
    >
      <Modal.Body>
        <div className="text-left">
          <p>Esse procedimento pode demorar alguns minutos.</p>
          <p>Deseja continuar mesmo assim?</p>
        </div>
      </Modal.Body>

      <Modal.Footer justify-content="end">
        <Button secondary small m={2} onClick={close}>
          Cancelar
        </Button>
        <Button
          primary
          small
          m={2}
          onClick={async () => {
            await startImportMutation.mutateAsync()
            close()
          }}
          loading={startImportMutation.isPending}
        >
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  ))

  return (
    <>
      <h2>Importar dados do MuseusBR</h2>
      <div className="flex flex-row-reverse justify-between items-center p-2">
        {isLoading ? (
          <button
            className="br-button flex items-center gap-2"
            type="submit"
            onClick={() => {
              openModal()
            }}
            disabled={isLoading}
          >
            <Loading size="small" />
            Importando...
          </button>
        ) : (
          <button
            className="br-button primary flex items-center gap-2"
            type="submit"
            onClick={() => {
              openModal()
            }}
          >
            <i className="fa-solid fa-cloud-arrow-up"></i>
            Importar
          </button>
        )}
      </div>

      <fieldset
        className="rounded-lg p-3"
        style={{ border: "2px solid #e0e0e0" }}
      >
        <legend className="text-lg font-extrabold px-3 m-0">
          Dados da última importação
        </legend>
        <div className="flex justify-between gap-10 p-3">
          <span>
            <span className="font-bold">Museus cadastrados: </span>
            {(
              lastImportData?.museusCadastrados ??
              museusData?.total ??
              0
            ).toLocaleString()}
          </span>
          <span>
            <span className="font-bold">Data: </span>
            {lastImportData?.finalizadoEm
              ? formatDate(lastImportData.finalizadoEm)
              : "Nenhuma importação realizada"}
          </span>
          <span>
            <span className="font-bold">Quantidade importada: </span>
            {(lastImportData?.numeroImportados ?? 0).toLocaleString()} museus
          </span>
          <span>
            <span className="font-bold">Usuário: </span>
            {lastImportData?.usuario?.nome || "N/A"}
          </span>
        </div>
      </fieldset>

      <Table
        data={museusData.itens}
        columns={columns}
        itensPagination={{
          page,
          limit,
          total: museusData.total,
          totalPages: museusData.totalPages,
          onPageChange: setPage,
          onLimitChange: (newLimit) => {
            setLimit(newLimit)
            setPage(1)
          }
        }}
      />
    </>
  )
}

export default TableMuseus
