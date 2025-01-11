import DefaultLayout from "../layouts/default"
import Input from "../components/Input"
import { Link } from "react-router-dom"
import Table from "../components/Table"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"

interface Museu {
  name: string
  regiao: string
  uf: string
}

const PerfilPage = () => {
  const columnHelper = createColumnHelper<Museu>()

  const columns: ColumnDef<Museu>[] = [
    columnHelper.accessor("name", {
      header: "Nome",
      cell: (info) => info.getValue(),
      accessorFn: (row) => row.name
    }),
    columnHelper.accessor("regiao", {
      header: "Região",
      cell: (info) => info.getValue(),
      accessorFn: (row) => row.regiao
    }),
    columnHelper.accessor("uf", {
      header: "UF",
      cell: (info) => info.getValue(),
      accessorFn: (row) => row.uf
    })
  ]

  const data: Museu[] = [
    {
      name: "Casa da Cultura José Gonçalves de Minas",
      regiao: "Nordeste",
      uf: "RN"
    },
    { name: "Museu de Esportes", regiao: "Norte", uf: "AM" },
    { name: "Museu Histórico Municipal Família Pires", regiao: "Sul", uf: "SC" }
  ]

  return (
    <DefaultLayout>
      <Link to="/" className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
      <h2>Meu perfil</h2>
      <div className="container mx-auto p-6 bg-white rounded-lg">
        <form className="space-y-6">
          <div>
            <div className="grid grid-cols-3 gap-2 w-full">
              <Input
                type="text"
                label="Nome"
                placeholder="Digite o nome"
                className="w-full"
                value={"Thiago Campos"}
              />
              <Input
                type="email"
                label="Email"
                placeholder="Digite o email"
                className="w-full"
                value={"thiago@gmail.com"}
              />
            </div>
          </div>
          <div className="br-table overflow-auto">
            <Table
              data={data}
              columns={columns}
              showSearch={false}
              showSelectedBar={false}
              className="justify-center"
            />
          </div>
          <div className="flex space-x-4 justify-end">
            <Link to="/" className="br-button secondary mt-5">
              Voltar
            </Link>
            <button className="br-button primary mt-5" type="submit">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  )
}

export default PerfilPage
