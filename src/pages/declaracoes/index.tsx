import { useState, useMemo } from "react"
import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { format } from "date-fns"
import { useNavigate } from "react-router"
import { Button, Modal } from "react-dsgov"
import { stateRegions } from "../../utils/regioes"
import Table from "../../components/Table"
import request from "../../utils/request"
import clsx from "clsx"
import toast from "react-hot-toast"

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

  const [modalAberta, setModalAberta] = useState(false)
  const [idSelecionado, setIdSelecionado] = useState<Declaracao | null>(null)

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

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      return request(`/api/admin/declaracoes/restaurar/${idSelecionado?._id}`, {
        method: "PUT"
      })
    },
    onSuccess: () => {
      setModalAberta(false)
      window.location.reload()
      toast.success("Declaração recuperada com sucesso!")
    }
  })

  const handleOpenModal = (id: string) => {
    const declaracaoSelecionada =
      data.find((item: Declaracao) => item._id === id) || null
    setIdSelecionado(declaracaoSelecionada)
    setModalAberta(true)
  }

  const columnHelper = createColumnHelper<Declaracao>()

  const columns = [
    columnHelper.accessor("anoDeclaracao.ano", {
      header: "Ano",
      enableColumnFilter: true,
      meta: {
        filterVariant: "select"
      },
      cell: (info) => info.getValue(),
      filterFn: (row, columnId, filterValue) => {
        const rowValue = row.getValue(columnId) as number
        return rowValue === Number(filterValue)
      }
    }),
    columnHelper.accessor("retificacao", {
      header: "Tipo",
      cell: (info) => (info.getValue() ? "Retificadora" : "Original"),
      enableColumnFilter: true,
      meta: {
        filterVariant: "select"
      },
      filterFn: (row, columnId, filterValue) => {
        const rowValue = row.getValue(columnId) as boolean
        return rowValue === (filterValue === "true")
      }
    }),
    columnHelper.accessor(
      (row) => {
        const tiposAcervo = []
        if (row.arquivistico) tiposAcervo.push("A")
        if (row.bibliografico) tiposAcervo.push("B")
        if (row.museologico) tiposAcervo.push("M")
        return tiposAcervo
      },
      {
        id: "acervo",
        header: "Acervo",
        meta: {
          filterVariant: "select"
        },
        cell: (info) => {
          const tiposAcervo = info.getValue() as string[]
          return tiposAcervo.join(", ")
        },
        filterFn: (row, columnId, filterValue) => {
          const rowValue = row.getValue(columnId) as string[]
          return rowValue.includes(filterValue)
        }
      }
    ),
    columnHelper.accessor("responsavelEnvioNome", {
      cell: (info) => info.getValue(),
      header: "Declarante"
    }),
    ...(activeTab == "Recebida" || activeTab == "all"
      ? [
          columnHelper.accessor("dataCriacao", {
            header: "Recebida",
            enableColumnFilter: true,
            cell: (info) => {
              const date = info.getValue()
              return date
                ? format(new Date(date), "dd/MM/yyyy HH:mm")
                : "Sem registro"
            },
            meta: {
              filterVariant: "date"
            },
            filterFn: (row, columnId, filterValue) => {
              const rowValue = new Date(row.getValue(columnId) as string)
              const filterDate = new Date(filterValue)

              // Ajustar para UTC, removendo diferença de fuso horário
              const rowDateUTC = new Date(
                rowValue.getUTCFullYear(),
                rowValue.getUTCMonth(),
                rowValue.getUTCDate()
              )
              const filterDateUTC = new Date(
                filterDate.getUTCFullYear(),
                filterDate.getUTCMonth(),
                filterDate.getUTCDate()
              )

              return rowDateUTC.getTime() === filterDateUTC.getTime()
            }
          })
        ]
      : []),
    ...(activeTab == "Em análise"
      ? [
          columnHelper.accessor("dataEnvioAnalise", {
            header: "Enviada",
            cell: (info) => {
              const date = info.getValue()
              return date
                ? format(new Date(date), "dd/MM/yyyy HH:mm")
                : "Sem registro"
            },
            enableColumnFilter: true,
            meta: {
              filterVariant: "date"
            },
            filterFn: (row, columnId, filterValue) => {
              const rowValue = new Date(row.getValue(columnId) as string)
              const filterDate = new Date(filterValue)

              // Ajustar para UTC, removendo diferença de fuso horário
              const rowDateUTC = new Date(
                rowValue.getUTCFullYear(),
                rowValue.getUTCMonth(),
                rowValue.getUTCDate()
              )
              const filterDateUTC = new Date(
                filterDate.getUTCFullYear(),
                filterDate.getUTCMonth(),
                filterDate.getUTCDate()
              )

              return rowDateUTC.getTime() === filterDateUTC.getTime()
            }
          })
        ]
      : []),
    ...(activeTab == "Em conformidade" || activeTab == "Não conformidade"
      ? [
          columnHelper.accessor("dataFimAnalise", {
            header: "Finalizada",
            cell: (info) => {
              const date = info.getValue()
              return date
                ? format(new Date(date), "dd/MM/yyyy HH:mm")
                : "Sem registro"
            },
            enableColumnFilter: true,
            meta: {
              filterVariant: "date"
            },
            filterFn: (row, columnId, filterValue) => {
              const rowValue = new Date(row.getValue(columnId) as string)
              const filterDate = new Date(filterValue)

              // Ajustar para UTC, removendo diferença de fuso horário
              const rowDateUTC = new Date(
                rowValue.getUTCFullYear(),
                rowValue.getUTCMonth(),
                rowValue.getUTCDate()
              )
              const filterDateUTC = new Date(
                filterDate.getUTCFullYear(),
                filterDate.getUTCMonth(),
                filterDate.getUTCDate()
              )

              return rowDateUTC.getTime() === filterDateUTC.getTime()
            }
          })
        ]
      : []),
    ...(activeTab == "Excluída"
      ? [
          columnHelper.accessor("dataExclusao", {
            id: "excluidaEm",
            cell: (info) => {
              const value = info.getValue()
              return value
                ? format(new Date(value), "dd/MM/yyyy HH:mm")
                : "Sem registro"
            },
            header: "Excluída",
            enableColumnFilter: true,
            meta: {
              filterVariant: "date"
            },
            filterFn: (row, columnId, filterValue) => {
              const rowValue = new Date(row.getValue(columnId) as string)
              const filterDate = new Date(filterValue)

              // Ajustar para UTC, removendo diferença de fuso horário
              const rowDateUTC = new Date(
                rowValue.getUTCFullYear(),
                rowValue.getUTCMonth(),
                rowValue.getUTCDate()
              )
              const filterDateUTC = new Date(
                filterDate.getUTCFullYear(),
                filterDate.getUTCMonth(),
                filterDate.getUTCDate()
              )

              return rowDateUTC.getTime() === filterDateUTC.getTime()
            }
          })
        ]
      : []),
    columnHelper.accessor("museu_id.endereco.regiao", {
      cell: (info) => info.getValue(),
      header: "Região",
      enableColumnFilter: true,
      meta: {
        filterVariant: "select"
      }
    }),
    columnHelper.accessor("museu_id.nome", {
      header: "Museu",
      meta: {
        filterVariant: "text"
      }
    }),
    columnHelper.accessor("museu_id.endereco.municipio", {
      cell: (info) => info.getValue(),
      header: "Cidade"
    }),
    columnHelper.accessor("museu_id.endereco.uf", {
      cell: (info) => info.getValue(),
      header: "UF",
      meta: {
        filterVariant: "select"
      }
    }),
    ...(activeTab === "all"
      ? [
          columnHelper.accessor("status", {
            cell: (info) => {
              const status = info.getValue()

              return (
                <span className="whitespace-nowrap font-bold">{status}</span>
              )
            },
            header: "Situação",
            enableColumnFilter: true,
            meta: {
              filterVariant: "select"
            }
          })
        ]
      : []),
    ...(activeTab !== "Recebida"
      ? [
          columnHelper.accessor(
            (row) => {
              const analistas = [
                ...(row.analistasResponsaveisNome || []),
                ...(row.museologico?.analistasResponsaveisNome || []),
                ...(row.arquivistico?.analistasResponsaveisNome || []),
                ...(row.bibliografico?.analistasResponsaveisNome || [])
              ]
              return analistas
            },
            {
              id: "analistasResponsaveisNome", // Adicione um ID explícito para a coluna
              header: "Analistas",
              cell: (info) => {
                const analistasUnicos = [
                  ...new Set(info.getValue() as string[])
                ]
                return analistasUnicos.length > 0
                  ? analistasUnicos.join(", ")
                  : "Nenhum analista"
              },
              enableColumnFilter: true,
              meta: {
                filterVariant: "text"
              },
              filterFn: (row, columnId, filterValue) => {
                const rowValue = row.getValue(columnId) as string[]
                if (!rowValue || !Array.isArray(rowValue)) {
                  return false
                }
                return rowValue.some((analista) =>
                  analista.toLowerCase().includes(filterValue.toLowerCase())
                )
              }
            }
          )
        ]
      : []),
    columnHelper.accessor("_id", {
      header: () => <div className="text-center">Ações</div>,
      enableColumnFilter: false,
      enableSorting: false,
      cell: (info) => (
        <div className="flex space-x-2">
          {activeTab === "Recebida" && (
            <Button
              small
              onClick={() =>
                navigate(`/declaracoes/enviarAnalise/${info.getValue()}`)
              }
              className="!font-thin analise"
            >
              <i className="fa-solid fa-magnifying-glass-arrow-right p-2"></i>
              Analisar
            </Button>
          )}
          {activeTab === "Em análise" && (
            <Button
              small
              onClick={() =>
                navigate(`/declaracoes/finalizarAnalise/${info.getValue()}`)
              }
              className="!font-thin concluir"
            >
              <i className="fa-solid fa-circle-check p-2"></i>Finalizar
            </Button>
          )}
          {activeTab === "Excluída" && (
            <Button
              small
              onClick={() => handleOpenModal(info.getValue())}
              className="!font-thin analise"
            >
              <i className="fa-solid fa-magnifying-glass-arrow-right p-2"></i>
              Restaurar
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
                  Recebidas ({declaracaoCounts.recebida})
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
                  Excluídas ({declaracaoCounts.excluida})
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
      {modalAberta && (
        <Modal
          useScrim
          showCloseButton
          title="Recuperar declaração"
          className="w-full max-w-[90%] sm:max-w-[600px] md:max-w-[800px] p-3"
          modalOpened={modalAberta}
          onCloseButtonClick={() => setModalAberta(false)}
        >
          <Modal.Body>
            Tem certeza que deseja alterar esta declaração para recebida?
          </Modal.Body>
          <Modal.Footer justify-content="end">
            <Button
              secondary
              small
              m={2}
              onClick={() => setModalAberta(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              primary
              small
              m={2}
              loading={isPending}
              onClick={() => mutate()}
            >
              Confirmar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  )
}
