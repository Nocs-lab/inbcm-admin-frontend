import React from "react"
import Table from "../../components/Table"
import request from "../../utils/request"
import { useQuery } from "@tanstack/react-query"
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"

interface Museus {
  codIbram: number
  nome: string
  municipio: string
  uf: string
  bairro: string
}

const fetchMuseus = async (): Promise<Museus[]> => {
  const response = await request("/api/admin/museus/listar-museus")
  if (!response.ok) {
    let errorMessage = "Museus não encontrados"
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch (e) {
      throw new Error(errorMessage)
    }
  }

  const msueus = await response.json()

  return msueus.sort((a: Museus, b: Museus) =>
    a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
  )
}

const MuseusBR: React.FC = () => {
  const { data: museuData } = useQuery<Museus[]>({
    queryKey: ["users"],
    queryFn: fetchMuseus
  })

  console.log("museuData", museuData)

  const columnHelper = createColumnHelper<Museus>()

  const columns = [
    columnHelper.accessor("codIbram", {
      header: "cód.IBRAM",
      enableColumnFilter: false
    }),
    columnHelper.accessor("nome", {
      header: "Nome",
      cell: (info) => <span>{info.getValue()}</span>,
      enableColumnFilter: false
    }),
    columnHelper.accessor("municipio", {
      header: "Município",
      cell: (info) => <span>{info.getValue()}</span>,
      enableColumnFilter: false
    }),
    columnHelper.accessor("uf", {
      header: "UF",
      cell: (info) => <span>{info.getValue()}</span>,
      enableColumnFilter: false
    }),
    columnHelper.accessor("bairro", {
      header: "Bairro",
      cell: (info) => <span>{info.getValue()}</span>,
      enableColumnFilter: false
    })
  ] as ColumnDef<Museus>[]

  return (
    <>
      <h2>Importar dados do MuseusBR</h2>
      <div className="flex flex-row-reverse justify-between items-center p-2">
        <button
          className="br-button primary flex items-center gap-2"
          type="submit"
        >
          <i className="fa-solid fa-cloud-arrow-down"></i>
          Importar
        </button>
      </div>

      <fieldset
        className="rounded-lg p-3"
        style={{ border: "2px solid #e0e0e0" }}
      >
        <legend className="text-lg font-extrabold px-3 m-0">
          Dados de importação
        </legend>
        <div className="flex justify-center gap-10 p-2">
          <label htmlFor="">
            Museus cadastrados:
            <span>{3.123}</span>
          </label>
          <label htmlFor="">
            Última importação:
            <span>06/05/2025 ás 21:10</span>
          </label>
          <label htmlFor="">
            Número de importações:
            <span>12 museus</span>
          </label>
        </div>
      </fieldset>

      <Table columns={columns as ColumnDef<Museus>[]} data={museuData || []} />
    </>
  )
}

export default MuseusBR
