import React, { useState, useMemo } from "react"
import { useNavigate, Link } from "react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import request from "../../utils/request"
import { Modal, Button } from "react-dsgov"
import {
  CellContext,
  type ColumnDef,
  createColumnHelper
} from "@tanstack/react-table"
import toast from "react-hot-toast"
import Table from "../../components/Table"
import clsx from "clsx"
import { useModal } from "../../utils/modal"
import { pdfjs, Document } from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

interface User {
  _id: string
  nome: string
  email: string
  cpf?: string
  profile?: {
    name: string
  }
  situacao: number
  museus: Museu[]
  especialidadeAnalista?: string[]
}

interface Museu {
  _id: string
  nome: string
}

const formatCPF = (cpf: string): string => {
  if (!cpf) return "" // Caso o CPF seja undefined ou vazio
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

const fetchUsers = async (): Promise<User[]> => {
  const response = await request("/api/admin/users")
  if (!response.ok) {
    let errorMessage = "Usuários não encontrados"
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch (e) {
      throw new Error(errorMessage)
    }
  }

  const users = await response.json()

  return users.sort((a: User, b: User) =>
    a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
  )
}

const labelMapping = (value: string) => {
  switch (value.toString()) {
    case "0":
      return "Para aprovar"
    case "1":
      return "Ativo"
    case "2":
      return "Inativo"
    case "3":
      return "Não aprovado"
    case "admin":
      return "Administrador"
    case "analyst":
      return "Analista"
    case "declarant":
      return "Declarante"
    default:
      return value
  }
}

const DocumentosModal: React.FC<{
  close: () => void
  data: { url: string }
  error: Error | null
  isLoading: boolean
}> = ({ close, data, error, isLoading }) => {
  if (isLoading || !data) {
    return <p>Carregando...</p>
  }

  if (error) {
    return <p>Erro ao carregar documento</p>
  }

  return (
    <Modal
      title="Documento comprobatório do usuário"
      showCloseButton
      onCloseButtonClick={close}
    >
      <Modal.Body>
        <div>
          <Document file={data.url} />
        </div>
      </Modal.Body>
      <Modal.Footer justify-content="end">
        <Button primary small m={2} onClick={close}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

const PendingActions: React.FC<{
  info: CellContext<User, string>
}> = ({ info }) => {
  const queryClient = useQueryClient()

  const negateMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await request(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ situacao: 3 })
      })
      if (!response.ok) {
        throw new Error("Failed to negate user")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onMutate: () => {
      closeNegateModal()
    }
  })

  const negate = async () => {
    await toast.promise(negateMutation.mutateAsync(info.getValue()), {
      loading: "Negando usuário...",
      success: "Usuário negado com sucesso!",
      error: "Erro ao negar usuário"
    })
  }

  const { openModal: openNegateModal, closeModal: closeNegateModal } = useModal(
    (close) => (
      <Modal
        title="Negar acesso de usuário?"
        showCloseButton
        onCloseButtonClick={close}
      >
        <Modal.Body>
          <p>
            Deseja realmente negar o acesso do usuário{" "}
            <strong>{info.row.original.nome}</strong> para enviar declarações
            do(s) museu(s){" "}
            <strong>
              {info.row.original.museus.length > 0
                ? info.row.original.museus.map((museu) => museu.nome).join(", ")
                : "Nenhum museu"}
            </strong>
            ?
          </p>
        </Modal.Body>
        <Modal.Footer justify-content="end">
          <Button primary small m={2} onClick={negate}>
            Confirmar
          </Button>
          <Button secondary small m={2} onClick={close}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    )
  )

  const {
    data: documentos,
    error: documentosError,
    isLoading: loadingDocumentos
  } = useQuery({
    queryKey: ["documentos", info.getValue()],
    queryFn: async () => {
      const response = await request(
        `/api/admin/users/documento/${info.getValue()}`
      )
      if (!response.ok) {
        throw new Error("Failed to fetch user documents")
      }
      return response.json()
    }
  })

  const { openModal: openDocumentModal } = useModal((close) => (
    <DocumentosModal
      close={close}
      data={documentos}
      error={documentosError}
      isLoading={loadingDocumentos}
    />
  ))

  const approvalMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await request(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ situacao: 1 })
      })
      if (!response.ok) {
        throw new Error("Failed to approve user")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onMutate: () => {
      closeApproveModal()
    }
  })

  const approve = async () => {
    await toast.promise(approvalMutation.mutateAsync(info.getValue()), {
      loading: "Aprovando usuário...",
      success: "Usuário aprovado com sucesso!",
      error: "Erro ao aprovar usuário"
    })
  }

  const { openModal: openAprovveModal, closeModal: closeApproveModal } =
    useModal((close) => (
      <Modal
        title="Aprovar usuário?"
        showCloseButton
        onCloseButtonClick={close}
      >
        <Modal.Body>
          <p>
            Deseja realmente autorizar o acesso do usuário{" "}
            <strong>{info.row.original.nome}</strong> para enviar declarações
            do(s) museu(s){" "}
            <strong>
              {info.row.original.museus.length > 0
                ? info.row.original.museus.map((museu) => museu.nome).join(", ")
                : "Nenhum museu"}
            </strong>
            ?
          </p>
        </Modal.Body>
        <Modal.Footer justify-content="end">
          <Button primary small m={2} onClick={approve}>
            Confirmar
          </Button>
          <Button secondary small m={2} onClick={close}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    ))

  return (
    <div className="flex justify-start gap-2">
      <button
        className="btn text-[#1351b4]"
        onClick={openDocumentModal}
        aria-label="Ver documento"
        title="Ver documento"
      >
        <i className="fa-solid fa-file-alt fa-fw pl-2"></i>
      </button>
      <button
        className="btn text-[#1351b4]"
        onClick={openAprovveModal}
        aria-label="Aprovar usuário"
        title="Aprovar usuário"
      >
        <i className="fa-solid fa-user-check fa-fw pl-2"></i>
      </button>
      <button
        className="btn text-[#1351b4]"
        onClick={openNegateModal}
        aria-label="Aprovar usuário"
        title="Não aprovar usuário"
      >
        <i className="fa-solid fa-user-xmark fa-fw pl-2"></i>
      </button>
    </div>
  )
}

const Index: React.FC = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: userData } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers
  })

  const [showModalDelete, setShowModalDelete] = useState(false)
  const [userIdToDelete, setUserIdToDelete] = useState<string>("")
  const [activeTab, setActiveTab] = useState<
    "admin" | "declarant" | "analyst" | "all" | "pending" | "negated"
  >("declarant")

  const mutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await request(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      })
      if (!response.ok) {
        throw new Error("Failed to delete user")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Usuário desativado com sucesso!")
    }
  })

  const handleOpenModalDelete = (userId: string) => {
    setUserIdToDelete(userId)
    setShowModalDelete(true)
  }

  const handleCloseModalDelete = () => {
    setShowModalDelete(false)
    setUserIdToDelete("")
  }

  const handleDeleteUser = async () => {
    try {
      await mutation.mutateAsync(userIdToDelete)
      setShowModalDelete(false)
    } catch (error) {
      console.error("Erro ao desativar usuário:", error)
    }
  }

  const columnHelper = createColumnHelper<User>()

  const columns = [
    ...(["pending", "negated"].includes(activeTab)
      ? [
          columnHelper.accessor("cpf", {
            header: "CPF",
            cell: (info) => formatCPF(info.getValue() || ""),
            meta: {
              filterVariant: "text"
            }
          })
        ]
      : []),
    columnHelper.accessor("nome", {
      header: "Nome",
      cell: (info) => info.getValue(),
      meta: {
        filterVariant: "text"
      }
    }),
    columnHelper.accessor("email", {
      header: "E-mail",
      cell: (info) => info.getValue(),
      meta: {
        filterVariant: "text"
      }
    }),
    ...(activeTab === "declarant" || activeTab === "pending"
      ? [
          columnHelper.accessor("museus", {
            header: "Museus",
            cell: (info) => {
              const museus = info.getValue()
              return museus.length > 0
                ? museus.map((museu) => museu.nome).join(", ")
                : "Nenhum museu"
            },
            meta: {
              filterVariant: "text"
            }
          })
        ]
      : []),
    ...(activeTab === "analyst"
      ? [
          columnHelper.accessor("especialidadeAnalista", {
            header: "Especialidade",
            cell: (info) => {
              const especialidades = info.getValue()
              return especialidades
                ? especialidades.join(", ")
                : "Nenhuma especialidade"
            },
            meta: {
              filterVariant: "text"
            }
          })
        ]
      : []),
    ...(activeTab === "all"
      ? [
          columnHelper.accessor("profile", {
            header: "Perfil",
            cell: (info) => {
              const profileName = info.getValue()?.toString()
              return profileName ? labelMapping(profileName) : "Não informado"
            },
            meta: {
              filterVariant: "select"
            },
            accessorFn: (row) => row.profile?.name || "",
            filterFn: (row, columnId, filterValue) => {
              const profileName = row.original.profile?.name
              return profileName === filterValue
            }
          })
        ]
      : []),
    ...(!["pending", "negated"].includes(activeTab)
      ? [
          columnHelper.accessor("situacao", {
            header: "Situação",
            cell: (info) => {
              const situacaoName = info.getValue()?.toString()
              return situacaoName ? labelMapping(situacaoName) : "Não informado"
            },
            meta: {
              filterVariant: "select"
            },
            filterFn: (row, columnId, filterValue) => {
              // Converte o valor do filtro para número antes de comparar
              const situacaoNumber = Number(filterValue)
              return row.original.situacao === situacaoNumber
            }
          }),
          columnHelper.accessor("_id", {
            header: "Ações",
            cell: (info) => {
              const user = info.row.original // Acessa os dados completos do usuário
              const isDisabled = user.situacao === 2 // Verifica se a situação é 2

              return (
                <div className="flex justify-start gap-2">
                  <button
                    className="btn text-[#1351b4]"
                    onClick={() => navigate(`/usuarios/${info.getValue()}`)}
                    aria-label="Editar usuário"
                    title="Editar usuário"
                  >
                    <i className="fa-solid fa-pen-to-square pr-2"></i>
                  </button>
                  <button
                    className={clsx(
                      "btn text-[#1351b4]",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => {
                      if (!isDisabled) handleOpenModalDelete(info.getValue())
                    }}
                    aria-label="Excluir usuário"
                    title={
                      isDisabled ? "Usuário já desativado" : "Excluir usuário"
                    }
                    disabled={isDisabled}
                  >
                    <i className="fa-solid fa-trash fa-fw pl-2"></i>
                  </button>
                </div>
              )
            },
            enableColumnFilter: false
          })
        ]
      : []),
    ...(activeTab === "pending"
      ? [
          columnHelper.accessor("_id", {
            header: "Ações",
            cell: (info) => <PendingActions info={info} />,
            enableColumnFilter: false
          })
        ]
      : [])
  ] as ColumnDef<User>[]

  const userCounts = useMemo(() => {
    if (!userData)
      return {
        admin: 0,
        declarant: 0,
        analyst: 0,
        all: 0,
        pending: 0,
        negated: 0
      }

    return {
      admin: userData.filter((user) => user.profile?.name === "admin").length,
      declarant: userData.filter(
        (user) => user.profile?.name === "declarant" && user.situacao != 0
      ).length,
      analyst: userData.filter((user) => user.profile?.name === "analyst")
        .length,
      all: userData.length,
      pending: userData.filter((user) => user.situacao === 0).length,
      negated: userData.filter((user) => user.situacao === 3).length
    }
  }, [userData])

  const filteredUsers = useMemo(() => {
    if (!userData) return []

    switch (activeTab) {
      case "all":
        return userData
      case "pending":
        return userData.filter((user) => user.situacao === 0)
      case "negated":
        return userData.filter((user) => user.situacao === 3)
      default:
        return userData.filter(
          (user) =>
            user.profile?.name === activeTab &&
            (user.situacao === 1 || user.situacao === 2)
        )
    }
  }, [userData, activeTab])

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2>Listagem de usuários</h2>
        <Link to="/usuarios/createuser" className="btn text-xl p-3">
          <i className="fa-solid fa-user-plus"></i> Novo
        </Link>
      </div>

      <div className="br-tab small">
        <nav className="tab-nav">
          <ul>
            <li
              className={clsx("tab-item", activeTab === "pending" && "active")}
              title="Aguardando aprovação"
            >
              <button type="button" onClick={() => setActiveTab("pending")}>
                <span className="name">
                  Aguardando aprovação ({userCounts.pending})
                </span>
              </button>
            </li>
            <li
              className={clsx("tab-item", activeTab === "negated" && "active")}
              title="Não aprovados"
            >
              <button type="button" onClick={() => setActiveTab("negated")}>
                <span className="name">
                  Não aprovados ({userCounts.negated})
                </span>
              </button>
            </li>
            <li
              className={clsx(
                "tab-item",
                activeTab === "declarant" && "active"
              )}
              title="Declarantes"
            >
              <button type="button" onClick={() => setActiveTab("declarant")}>
                <span className="name">
                  Declarantes ({userCounts.declarant})
                </span>
              </button>
            </li>
            <li
              className={clsx("tab-item", activeTab === "analyst" && "active")}
              title="Analistas"
            >
              <button type="button" onClick={() => setActiveTab("analyst")}>
                <span className="name">Analistas ({userCounts.analyst})</span>
              </button>
            </li>
            <li
              className={clsx("tab-item", activeTab === "admin" && "active")}
              title="Administradores"
            >
              <button type="button" onClick={() => setActiveTab("admin")}>
                <span className="name">
                  Administradores ({userCounts.admin})
                </span>
              </button>
            </li>
            <li
              className={clsx("tab-item", activeTab === "all" && "active")}
              title="Todos"
            >
              <button type="button" onClick={() => setActiveTab("all")}>
                <span className="name">Todos ({userCounts.all})</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <div className="overflow-x-auto">
        <Table columns={columns as ColumnDef<unknown>[]} data={filteredUsers} />
      </div>

      {showModalDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <Modal
            title="Desativar usuário?"
            showCloseButton
            onCloseButtonClick={() => handleCloseModalDelete()}
          >
            <Modal.Body>
              Você tem certeza que deseja desativar este usuário?
            </Modal.Body>
            <Modal.Footer justify-content="end">
              <Button primary small m={2} onClick={handleDeleteUser}>
                Confirmar
              </Button>
              <Button secondary small m={2} onClick={handleCloseModalDelete}>
                Cancelar
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </>
  )
}

export default Index
