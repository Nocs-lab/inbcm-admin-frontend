import { useState, useEffect } from "react"
import request from "../utils/request"
import Table from "./Table"
import { createColumnHelper } from "@tanstack/react-table"
import Input from "../components/Input"
import { Button } from "react-dsgov"
import Select from "../components/MultiSelect"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

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
  estadoInfo: {
    regiao: string
  }
  __v: number
}

interface ApiResponse {
  dados: Museu[]
  total: number
  pagina: number
  tamanho: number
}

type FiltroFormatado = {
  atributo: string
  operador: string
  tipo: string
  valores: string[]
}

const schema = z.object({
  nome: z.string().optional(),
  regiao: z.array(z.string()).optional(),
  uf: z.array(z.string()).optional(),
  municipio: z.string().optional(),
  bairro: z.string().optional(),
  esferaAdministraiva: z.array(z.string()).optional()
})

type FormData = z.infer<typeof schema>

const TableMuseus: React.FC = () => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [filtros, setFiltros] = useState<FormData>({})
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [data, setData] = useState<{
    itens: Museu[]
    total: number
    totalPages: number
  } | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur"
  })

  const columnHelper = createColumnHelper<Museu>()

  const columns = [
    columnHelper.accessor("codIbram", {
      header: "Cód. IBRAM",
      enableColumnFilter: false
    }),
    columnHelper.accessor("nome", {
      header: "Nome",
      enableColumnFilter: false
    }),
    columnHelper.accessor("esferaAdministraiva", {
      header: "Esfera Administrativa",
      enableColumnFilter: false
    }),
    columnHelper.accessor("estadoInfo.regiao", {
      header: "Região",
      enableColumnFilter: false
    }),
    columnHelper.accessor("endereco.uf", {
      header: "UF",
      enableColumnFilter: false,
      cell: (info) => info.getValue().toUpperCase()
    }),
    columnHelper.accessor("endereco.municipio", {
      header: "Município",
      enableColumnFilter: false
    }),
    columnHelper.accessor("endereco.bairro", {
      header: "Bairro",
      enableColumnFilter: false
    })
  ]

  const regiaoSelect = [
    { label: "Norte", value: "Norte" },
    { label: "Nordeste", value: "Nordeste" },
    { label: "Centro-Oeste", value: "Centro-Oeste" },
    { label: "Sudeste", value: "Sudeste" },
    { label: "Sul", value: "Sul" }
  ]

  const ufSelect = [
    { label: "AC", value: "ac" },
    { label: "AL", value: "al" },
    { label: "AM", value: "am" },
    { label: "AP", value: "ap" },
    { label: "BA", value: "ba" },
    { label: "CE", value: "ce" },
    { label: "DF", value: "df" },
    { label: "ES", value: "es" },
    { label: "GO", value: "go" },
    { label: "MA", value: "ma" },
    { label: "MG", value: "mg" },
    { label: "MS", value: "ms" },
    { label: "MT", value: "mt" },
    { label: "PA", value: "pa" },
    { label: "PB", value: "pb" },
    { label: "PE", value: "pe" },
    { label: "PI", value: "pi" },
    { label: "PR", value: "pr" },
    { label: "RJ", value: "rj" },
    { label: "RN", value: "rn" },
    { label: "RO", value: "ro" },
    { label: "RR", value: "rr" },
    { label: "RS", value: "rs" },
    { label: "SC", value: "sc" },
    { label: "SE", value: "se" },
    { label: "SP", value: "sp" },
    { label: "TO", value: "to" }
  ]

  const esferaSelect = [
    { label: "Pública", value: "PÚBLICA" },
    { label: "Privada", value: "PRIVADA" },
    { label: "Particular", value: "PARTICULAR" },
    { label: "Não Informada", value: "NÃO INFORMADA" },
    { label: "Mista", value: "MISTA" },
    { label: "Outros", value: "OUTROS" }
  ]

  const fetchData = async (dadosFiltro: FormData) => {
    setIsFetching(true)
    try {
      const filtrosFormatados: FiltroFormatado[] = []

      if (dadosFiltro.nome) {
        filtrosFormatados.push({
          atributo: "nome",
          operador: "like",
          tipo: "string",
          valores: [dadosFiltro.nome]
        })
      }

      if (dadosFiltro.regiao?.length) {
        filtrosFormatados.push({
          atributo: "regiao",
          operador: "eq",
          tipo: "string",
          valores: dadosFiltro.regiao
        })
      }

      if (dadosFiltro.uf?.length) {
        filtrosFormatados.push({
          atributo: "endereco.uf",
          operador: "eq",
          tipo: "string",
          valores: dadosFiltro.uf
        })
      }

      if (dadosFiltro.municipio) {
        filtrosFormatados.push({
          atributo: "endereco.municipio",
          operador: "like",
          tipo: "string",
          valores: [dadosFiltro.municipio]
        })
      }

      if (dadosFiltro.bairro) {
        filtrosFormatados.push({
          atributo: "endereco.bairro",
          operador: "like",
          tipo: "string",
          valores: [dadosFiltro.bairro]
        })
      }

      if (dadosFiltro.esferaAdministraiva?.length) {
        filtrosFormatados.push({
          atributo: "esferaAdministraiva",
          operador: "like",
          tipo: "string",
          valores: dadosFiltro.esferaAdministraiva
        })
      }

      const res = await request("/api/admin/museus/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pagina: page,
          tamanho: limit,
          filtros: filtrosFormatados
        })
      })

      const response: ApiResponse = await res.json()

      setData({
        itens: response.dados || [],
        total: response.total || 0,
        totalPages: Math.ceil((response.total || 0) / limit)
      })
    } catch (error) {
      setData(null)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    if (!isInitialLoad) {
      fetchData(filtros)
    }
  }, [page, limit, filtros])

  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false)
      fetchData({})
    }
  }, [])

  const onSubmit = (data: FormData) => {
    setFiltros(data)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-4">
      <fieldset
        className="rounded-lg p-3"
        style={{ border: "2px solid #e0e0e0" }}
      >
        <legend className="text-lg font-extrabold px-3 m-0">
          Filtrar museus
        </legend>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-3 gap-2 w-full p-2"
        >
          <Controller
            name="nome"
            control={control}
            render={({ field }) => (
              <Input
                type="text"
                label="Nome"
                placeholder="Digite o nome do museu"
                className="w-full"
                {...field}
              />
            )}
          />

          <Controller
            name="regiao"
            control={control}
            render={({ field }) => (
              <Select
                type="multiple"
                selectAllText="Selecionar todas"
                placeholder="Selecione as regiões"
                label="Regiões"
                options={regiaoSelect}
                value={field.value || []}
                onChange={field.onChange}
                className="w-full"
                error={errors.regiao}
              />
            )}
          />

          <Controller
            name="uf"
            control={control}
            render={({ field }) => (
              <Select
                type="multiple"
                selectAllText="Selecionar todas"
                placeholder="Selecione os estados"
                label="Estados"
                options={ufSelect}
                value={field.value || []}
                onChange={field.onChange}
                className="w-full"
                error={errors.uf}
              />
            )}
          />

          <Controller
            name="municipio"
            control={control}
            render={({ field }) => (
              <Input
                type="text"
                label="Município"
                placeholder="Digite o município"
                className="w-full"
                {...field}
              />
            )}
          />

          <Controller
            name="bairro"
            control={control}
            render={({ field }) => (
              <Input
                type="text"
                label="Bairro"
                placeholder="Digite o bairro"
                className="w-full"
                {...field}
              />
            )}
          />

          <Controller
            name="esferaAdministraiva"
            control={control}
            render={({ field }) => (
              <Select
                type="multiple"
                selectAllText="Selecionar todas"
                placeholder="Selecione a esfera administrativa"
                label="Esfera Administrativa"
                options={esferaSelect}
                value={field.value || []}
                onChange={field.onChange}
                className="w-full"
                error={errors.esferaAdministraiva}
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
                fetchData({})
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

      {!isInitialLoad && data && (
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

export default TableMuseus
