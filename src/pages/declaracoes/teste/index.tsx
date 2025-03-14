import { useState, useMemo } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { format } from "date-fns"
import { useNavigate } from "react-router"
import { Button } from "react-dsgov"
import { stateRegions } from ".././../../utils/regioes"
import Table from "../../../components/Table"
import request from "../../../utils/request"
import clsx from "clsx"

interface Declaracao {
  _id: string
  anoDeclaracao: {
    ano: number
  }
  retificacao: boolean
  status: string
  responsavelEnvioNome: string
  dataCriacao: Date
  dataEnvioAnalise: Date
  dataFimAnalise: Date
  dataExclusao: Date
  regiao: string
  museu_id: {
    _id: string
    nome: string
    endereco: {
      municipio: string
      uf: string
      regiao: string
    }
  }
  analistasResponsaveisNome: string[]
  museologico?: {
    analistasResponsaveisNome: string[]
  }
  arquivistico?: {
    analistasResponsaveisNome: string[]
  }
  bibliografico?: {
    analistasResponsaveisNome: string[]
  }
}

export default function Declaracoes() {
  const [activeTab, setActiveTab] = useState<
    | "Recebida"
    | "Em análise"
    | "Em conformidade"
    | "Não conformidade"
    | "Excluída"
    | "all"
  >("Recebida")

  const navigate = useNavigate()

  const { data: result } = useSuspenseQuery({
    queryKey: ["declaracoes"],
    queryFn: async () => {
      const response = await request(
        "/api/admin/declaracoes/declaracoesFiltradas",
        {
          method: "POST"
        }
      )
      return response.json()
    }
  })
  const data = useMemo(
    () =>
      result.data.map((row: { [key: string]: unknown }) => ({
        ...row,
        museu_id: {
          ...(typeof row.museu_id === "object" && row.museu_id !== null
            ? row.museu_id
            : {}),
          endereco: {
            ...(row.museu_id && typeof row.museu_id === "object"
              ? (row.museu_id as { endereco: { uf: string } }).endereco
              : {}),
            regiao:
              typeof row.museu_id === "object"
                ? stateRegions[
                    (row.museu_id as { endereco: { uf: string } }).endereco
                      .uf as keyof typeof stateRegions
                  ]
                : ""
          }
        }
      })),
    [result]
  )

  console.log("data", result)

  const columnHelper = createColumnHelper<Declaracao>()

  const columns = [
    columnHelper.accessor("retificacao", {
      header: "Tipo",
      cell: (info) => (info.getValue() ? "Retificadora" : "Original"),
      meta: {
        filterVariant: "select"
      }
    }),
    columnHelper.accessor(
      (row) => {
        const tiposAcervo = []
        if (row.arquivistico) tiposAcervo.push("A")
        if (row.bibliografico) tiposAcervo.push("B")
        if (row.museologico) tiposAcervo.push("M")
        return tiposAcervo.join(", ")
      },
      {
        header: "Acervo",
        meta: {
          filterVariant: "select"
        }
      }
    ),
    columnHelper.accessor("responsavelEnvioNome", {
      cell: (info) => info.getValue(),
      header: "Declarante"
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
            header: "Conclusão",
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
    columnHelper.accessor("anoDeclaracao.ano", {
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
            <i className="fa-solid fa-eye p-2"></i>Exibir
          </Button>
        </div>
      )
    })
  ] as ColumnDef<Declaracao>[]

  const declaracaoCounts = useMemo(() => {
    if (!data)
      return {
        recebida: 0,
        analise: 0,
        conformidade: 0,
        naoConformidade: 0,
        excluida: 0,
        all: 0
      }

    return {
      recebida: data.filter((d) => d.status === "Recebida").length,
      analise: data.filter((d) => d.status === "Em análise").length,
      conformidade: data.filter((d) => d.status === "Em conformidade").length,
      naoConformidade: data.filter((d) => d.status === "Não conformidade")
        .length,
      excluida: data.filter((d) => d.status === "Excluída").length,
      all: data.length
    }
  }, [data])

  const filteredDeclaracao = useMemo(() => {
    if (!data) return []

    let filteredData = data

    // Filtra os dados com base na aba ativa
    if (activeTab !== "all") {
      filteredData = data.filter(
        (data: Declaracao) => data.status === activeTab
      )
    }

    // Ordena os dados com base na aba ativa
    switch (activeTab) {
      case "Recebida":
        // Ordena pela "Data de envio" (dataCriacao)
        filteredData.sort((a, b) => {
          const dateA = new Date(a.dataCriacao).getTime()
          const dateB = new Date(b.dataCriacao).getTime()
          return dateB - dateA
        })
        break
      case "Em análise":
        // Ordena pela "Data de envio" (dataEnvioAnalise)
        filteredData.sort((a, b) => {
          const dateA = new Date(a.dataEnvioAnalise).getTime()
          const dateB = new Date(b.dataEnvioAnalise).getTime()
          return dateB - dateA
        })
        break
      case "Em conformidade":
      case "Não conformidade":
        // Ordena pela "Data de conclusão" (dataFimAnalise)
        filteredData.sort((a, b) => {
          const dateA = new Date(a.dataFimAnalise).getTime()
          const dateB = new Date(b.dataFimAnalise).getTime()
          return dateB - dateA
        })
        break
      case "Excluída":
        // Ordena pela "Data de exclusão" (dataExclusao)
        filteredData.sort((a, b) => {
          const dateA = new Date(a.dataExclusao).getTime()
          const dateB = new Date(b.dataExclusao).getTime()
          return dateB - dateA
        })
        break
      case "all":
        // Ordena pela "Data de envio" (dataEnvioAnalise)
        filteredData.sort((a, b) => {
          const dateA = new Date(a.dataEnvioAnalise).getTime()
          const dateB = new Date(b.dataEnvioAnalise).getTime()
          return dateB - dateA
        })
        break
      default:
        break
    }

    return filteredData
  }, [data, activeTab])

  return (
    <>
      <div className="flex items-center justify-between">
        <h2>Listagem de declarações</h2>
      </div>
      <div className="br-tab small">
        <nav className="tab-nav">
          <ul>
            <li
              className={clsx("tab-item", activeTab === "Recebida" && "active")}
              title="Recebida"
            >
              <button type="button" onClick={() => setActiveTab("Recebida")}>
                <span className="name">
                  Recebida ({declaracaoCounts.recebida})
                </span>
              </button>
            </li>
            <li
              className={clsx(
                "tab-item",
                activeTab === "Em análise" && "active"
              )}
              title="Em Análise"
            >
              <button type="button" onClick={() => setActiveTab("Em análise")}>
                <span className="name">
                  Em análise ({declaracaoCounts.analise})
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
              className={clsx("tab-item", activeTab === "Excluída" && "active")}
              title="Excluída"
            >
              <button type="button" onClick={() => setActiveTab("Excluída")}>
                <span className="name">
                  Excluída ({declaracaoCounts.excluida})
                </span>
              </button>
            </li>
            <li
              className={clsx("tab-item", activeTab === "all" && "active")}
              title="Todos"
            >
              <button type="button" onClick={() => setActiveTab("all")}>
                <span className="name">Todas ({declaracaoCounts.all})</span>
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
