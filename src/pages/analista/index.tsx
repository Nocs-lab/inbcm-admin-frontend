import { useState, useMemo } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { format } from "date-fns"
import { useNavigate } from "react-router"
import { Button } from "react-dsgov"
import Table from "../../components/Table"
import request from "../../utils/request"
import clsx from "clsx"

interface Declaracao {
  _id: string
  dataCriacao: Date
  dataEnvioAnalise: Date
  dataFimAnalise: Date
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
}

export default function Declaracoes() {
  const [activeTab, setActiveTab] = useState<
    "Em análise" | "Em conformidade" | "Não conformidade" | "all"
  >("Em análise")

  const navigate = useNavigate()

  const { data } = useSuspenseQuery({
    queryKey: ["declaracoes"],
    queryFn: async () => {
      const response = await request("/api/public/declaracoes")
      return response.json()
    }
  })

  const columnHelper = createColumnHelper<Declaracao>()

  const columns = [
    columnHelper.accessor("retificacao", {
      header: "Tipo",
      cell: (info) => (info.getValue() ? "Retificadora" : "Original"),
      enableColumnFilter: false
    }),
    columnHelper.accessor("dataEnvioAnalise", {
      header: "Envio",
      cell: (info) => {
        const date = info.getValue()
        return date
          ? format(new Date(date), "dd/MM/yyyy HH:mm")
          : "__ /__ /____ --:--"
      },
      enableColumnFilter: false
    }),
    ...(activeTab !== "Em análise"
      ? [
          columnHelper.accessor("dataFimAnalise", {
            header: "Data de Conclusão",
            cell: (info) => {
              const date = info.getValue()
              return date
                ? format(new Date(date), "dd/MM/yyyy HH:mm")
                : "__ /__ /____ --:--"
            },
            enableColumnFilter: false
          })
        ]
      : []),
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
    columnHelper.accessor("_id", {
      header: () => <div className="text-center">Ações</div>,
      enableColumnFilter: false,
      enableSorting: false,
      cell: (info) => (
        <div className="justify-start">
          {activeTab === "Em análise" && (
            <Button
              small
              onClick={() => navigate(`/analista/${info.getValue()}`)}
              className="!font-thin analise"
            >
              <i className="fa-solid fa-magnifying-glass-arrow-right p-2"></i>
              Analisar
            </Button>
          )}
          <Button
            small
            onClick={() => navigate(`/declaracoes/${info.getValue()}`)}
            className="!font-thin analise"
          >
            <i className="fa-solid fa-timeline p-2"></i>Histórico
          </Button>
        </div>
      )
    })
  ] as ColumnDef<Declaracao>[]

  const declaracaoCounts = useMemo(() => {
    if (!data)
      return { analise: 0, conformidade: 0, naoConformidade: 0, all: 0 }

    return {
      analise: data.filter((d) => d.status === "Em análise").length,
      conformidade: data.filter((d) => d.status === "Em conformidade").length,
      naoConformidade: data.filter((d) => d.status === "Não conformidade")
        .length,
      all: data.length
    }
  }, [data])

  const filteredDeclaracao = useMemo(() => {
    if (!data) return []
    if (activeTab === "all") return data
    return data.filter((data: Declaracao) => data.status === activeTab)
  }, [data, activeTab])

  return (
    <>
      <div className="flex items-center justify-between">
        <h2>Declarações para analisar</h2>
      </div>
      <div className="br-tab small">
        <nav className="tab-nav">
          <ul>
            <li
              className={clsx(
                "tab-item",
                activeTab === "Em análise" && "active"
              )}
              title="Em Análise"
            >
              <button type="button" onClick={() => setActiveTab("Em análise")}>
                <span className="name">
                  Em Análise ({declaracaoCounts.analise})
                </span>
              </button>
            </li>
            <li
              className={clsx(
                "tab-item",
                activeTab === "Em conformidade" && "active"
              )}
              title="Em conformidade"
            >
              <button
                type="button"
                onClick={() => setActiveTab("Em conformidade")}
              >
                <span className="name">
                  Em conformidade ({declaracaoCounts.conformidade})
                </span>
              </button>
            </li>
            <li
              className={clsx(
                "tab-item",
                activeTab === "Não conformidade" && "active"
              )}
              title="Não conformidade"
            >
              <button
                type="button"
                onClick={() => setActiveTab("Não conformidade")}
              >
                <span className="name">
                  Não conformidade ({declaracaoCounts.naoConformidade})
                </span>
              </button>
            </li>
            <li
              className={clsx("tab-item", activeTab === "all" && "active")}
              title="Todos"
            >
              <button type="button" onClick={() => setActiveTab("all")}>
                <span className="name">Todos ({declaracaoCounts.all})</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <div
        className="br-table overflow-auto"
        data-search="data-search"
        data-selection="data-selection"
        data-collapse="data-collapse"
        data-random="data-random"
      >
        <Table
          columns={columns as ColumnDef<Declaracao>[]}
          data={filteredDeclaracao}
        />
      </div>
      <div className="h-10" />
    </>
  )
}
