import { createColumnHelper } from "@tanstack/react-table"
import request from "../utils/request"
import Table from "./Table"
import { useState } from "react"
import {
  museologicoFields,
  bibliograficoFields,
  arquivisticoFields
} from "./Util/fieldMappings"
import { Button } from "react-dsgov"
//import Input from "../components/Input"
import Select from "../components/MultiSelect"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

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
    <table className="w-full border-collapse">
      <colgroup>
        <col className="w-[50%]" />
        <col className="w-[50%]" />
      </colgroup>
      <tbody>
        {Object.entries(campos).map(([campo, erro]) => (
          <tr key={campo}>
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

const schema = z.object({
  linha: z.string().optional(),
  nomeCampo: z.string().optional(),
  pendencias: z.array(z.string()).optional()
})

type FormData = z.infer<typeof schema>

const TablePendencias: React.FC<{
  acervo: "museologico" | "bibliografico" | "arquivistico"
  idDeclaracao: string
}> = ({ idDeclaracao, acervo }) => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filtros, setFiltros] = useState<FormData>({})

  const {
    //register,
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur"
  })

  type Pendencia = {
    linha: number
    camposComErro: Record<string, string>
  }

  const [data, setData] = useState<{
    itens: Pendencia[]
    total: number
    totalPages: number
  } | null>(null)
  const [isFetching, setIsFetching] = useState(false)

  type FiltroFormatado = {
    atributo: string
    operador: string
    tipo: string
    valores: string[]
  }

  const fetchData = async (dadosFiltro: FormData) => {
    setIsFetching(true)
    try {
      const filtrosFormatados: FiltroFormatado[] = []

      if (dadosFiltro.pendencias?.length) {
        filtrosFormatados.push({
          atributo: "camposComErro",
          operador: "eq",
          tipo: "string",
          valores: dadosFiltro.pendencias
        })
      }

      // if (dadosFiltro.linha) {
      //   filtrosFormatados.push({
      //     atributo: "linha",
      //     operador: "eq",
      //     tipo: "string",
      //     valores: [dadosFiltro.linha]
      //   })
      // }

      // if (dadosFiltro.nomeCampo) {
      //   filtrosFormatados.push({
      //     atributo: "camposComErro",
      //     operador: "eq",
      //     tipo: "string",
      //     valores: [dadosFiltro.nomeCampo]
      //   })
      // }

      const res = await request(
        `/api/admin/declaracoes/pendencias/${idDeclaracao}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            tipoArquivo: acervo,
            pagina: page,
            tamanho: limit,
            filtros: filtrosFormatados
          })
        }
      )

      const response = await res.json()
      setData({
        itens: response.conteudo || [],
        total: response.totalElementos || 0,
        totalPages: Math.ceil((response.totalElementos || 0) / limit)
      })
    } catch (error) {
      setData(null)
    } finally {
      setIsFetching(false)
    }
  }

  const onSubmit = (data: FormData) => {
    setFiltros(data)
    setPage(1)
    fetchData(data)
  }

  let columns

  if (acervo === "museologico") {
    columns = [
      columnHelper.accessor("linha", {
        header: "Linha",
        cell: (info) => info.getValue() + 1,
        enableColumnFilter: false
      }),
      columnHelper.accessor("camposComErro", {
        header: "Nome do campo / Pendências",
        cell: (info) => (
          <CamposComErroCell campos={info.getValue()} acervo="museologico" />
        ),
        enableColumnFilter: false
      })
    ]
  } else if (acervo === "bibliografico") {
    columns = [
      columnHelper.accessor("linha", {
        header: "Linha",
        cell: (info) => info.getValue() + 1,
        enableColumnFilter: false
      }),
      columnHelper.accessor("camposComErro", {
        header: "Nome do campo / Pendências",
        cell: (info) => (
          <CamposComErroCell campos={info.getValue()} acervo="bibliografico" />
        ),
        enableColumnFilter: false
      })
    ]
  } else {
    columns = [
      columnHelper.accessor("linha", {
        header: "Linha",
        cell: (info) => info.getValue() + 1,
        enableColumnFilter: false
      }),
      columnHelper.accessor("camposComErro", {
        header: "Nome do campo / Pendências",
        cell: (info) => (
          <CamposComErroCell campos={info.getValue()} acervo="arquivistico" />
        ),
        enableColumnFilter: false
      })
    ]
  }

  const tipoPendencia = [
    { label: "Campo vazio", value: "Campo vazio" },
    { label: "Não localizado", value: "Não localizado" }
  ]

  return (
    <div className="flex flex-col gap-4">
      <fieldset
        className="rounded-lg p-3"
        style={{ border: "2px solid #e0e0e0" }}
      >
        <legend className="text-lg font-extrabold px-3 m-0">Filtros</legend>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-3 gap-2 w-full p-2"
        >
          {/* <Input
            type="text"
            label="Linha"
            placeholder="Digite a linha"
            className="w-full"
            {...register("linha")}
          />
          <Input
            type="text"
            label="Nome do campo"
            placeholder="Digite o nome do campo"
            className="w-full"
            {...register("nomeCampo")}
          /> */}
          <Controller
            name="pendencias"
            control={control}
            render={({ field }) => (
              <Select
                type="multiple"
                selectAllText="Selecionar todas"
                placeholder="Selecione as pendências"
                label="Pendências"
                options={tipoPendencia}
                value={field.value || []}
                onChange={field.onChange}
                className="w-full"
                error={errors.pendencias}
              />
            )}
          />
          <div className="col-span-3 flex justify-end gap-2 pt-2">
            <Button
              type="button"
              onClick={() => {
                reset()
                setFiltros({})
                setPage(1)
                setData(null)
              }}
            >
              Limpar Filtros
            </Button>

            <Button type="submit" loading={isFetching}>
              Aplicar Filtros
            </Button>
          </div>
        </form>
      </fieldset>

      {data && (
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
          isLoading={isFetching}
        />
      )}
    </div>
  )
}

export default TablePendencias
