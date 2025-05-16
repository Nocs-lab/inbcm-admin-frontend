import { useSuspenseQuery } from "@tanstack/react-query"
import { createColumnHelper } from "@tanstack/react-table"
import request from "../utils/request"
import Table from "./Table"
import { useState } from "react"
import {
  museologicoFields,
  bibliograficoFields,
  arquivisticoFields
} from "./Util/fieldMappings"

const columnHelper = createColumnHelper()

const formatarNomeCampo = (campo: string) => {
  return campo
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

const CamposComErroCell = ({
  campos,
  acervo
}: {
  campos: Record<string, string>
  acervo: "museologico" | "bibliografico" | "arquivistico"
}) => {
  if (!campos || Object.keys(campos).length === 0) {
    return <span className="text-gray-400">-</span>
  }

  const fieldMapping = {
    museologico: museologicoFields,
    bibliografico: bibliograficoFields,
    arquivistico: arquivisticoFields
  }[acervo]

  return (
    <table className="w-full border-collapse text-sm">
      <colgroup>
        <col className="w-[50%]" />
        <col className="w-[50%]" />
      </colgroup>
      <tbody className="">
        {Object.entries(campos).map(([campo, erro]) => (
          <tr key={campo} className="">
            <td className="py-1">
              {fieldMapping[campo as keyof typeof fieldMapping] ||
                formatarNomeCampo(campo)}
            </td>
            <td className="py-1">{erro}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const museologicoColumns = [
  columnHelper.accessor("linha", {
    header: "Linha",
    enableColumnFilter: false,
    cell: (info) => info.getValue() + 1
  }),
  columnHelper.accessor("camposComErro", {
    header: "Nome do campo / Pendências",
    enableColumnFilter: false,
    cell: (info) => (
      <CamposComErroCell campos={info.getValue()} acervo="museologico" />
    )
  })
]

const bibliograficoColumns = [
  columnHelper.accessor("linha", {
    header: "Linha",
    enableColumnFilter: false,
    cell: (info) => info.getValue() + 1
  }),
  columnHelper.accessor("camposComErro", {
    header: "Nome do campo / Pendências",
    enableColumnFilter: false,
    cell: (info) => (
      <CamposComErroCell campos={info.getValue()} acervo="bibliografico" />
    )
  })
]

const arquivisticoColumns = [
  columnHelper.accessor("linha", {
    header: "Linha",
    enableColumnFilter: false,
    cell: (info) => info.getValue() + 1
  }),
  columnHelper.accessor("camposComErro", {
    header: "Nome do campo / Pendências",
    enableColumnFilter: false,
    cell: (info) => (
      <CamposComErroCell campos={info.getValue()} acervo="arquivistico" />
    )
  })
]

const TablePendencias: React.FC<{
  acervo: "museologico" | "bibliografico" | "arquivistico"
  idDeclaracao: string
}> = ({ idDeclaracao, acervo }) => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const { data } = useSuspenseQuery({
    queryKey: ["itens", idDeclaracao, acervo, page],
    queryFn: async () => {
      const res = await request(
        `/api/public/declaracoes/pendencias/${idDeclaracao}?tipoArquivo=${acervo}&page=${page}&limit=${limit}`
      )
      const response = await res.json()

      return {
        itens: response.pendencias ?? [],
        total: response.total ?? 0,
        totalPages: response.totalPages ?? 1,
        page: response.page ?? 1,
        limit: response.limit ?? 10
      }
    }
  })

  let columns

  if (acervo === "museologico") {
    columns = museologicoColumns
  } else if (acervo === "bibliografico") {
    columns = bibliograficoColumns
  } else {
    columns = arquivisticoColumns
  }

  return (
    <Table
      data={data.itens}
      columns={columns}
      itensPagination={{
        page,
        limit,
        total: data.total,
        totalPages: data.totalPages,
        onPageChange: setPage,
        onLimitChange: (newLimit) => {
          setLimit(newLimit)
          setPage(1)
        }
      }}
    />
  )
}

export default TablePendencias
