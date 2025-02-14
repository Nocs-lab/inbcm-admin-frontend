import React, { useState, useMemo } from "react"
import { useNavigate, Link } from "react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import request from "../../utils/request"
import { Modal, Button } from "react-dsgov"
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"
import toast from "react-hot-toast"
import Table from "../../components/Table"
import clsx from "clsx"

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

const profileMapping: { [key: string]: string } = {
  admin: "Administrador",
  declarant: "Declarante",
  analyst: "Analista"
}

const situacaoMapping: { [key: number]: string } = {
  0: "Para aprovar",
  1: "Ativo",
  2: "Inativo"
}

const Index: React.FC = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: userData } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers
  })

  const [showModalDelete, setShowModalDelete] = useState(false)
  const [showModalApproval, setShowModalApproval] = useState(false)
  const [userIdToDelete, setUserIdToDelete] = useState<string>("")
  const [userIdToApproval, setUserIdToApproval] = useState<string>("")
  const [activeTab, setActiveTab] = useState<
    "admin" | "declarant" | "analyst" | "all" | "pending"
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

  const userToApprove = useMemo(() => {
    if (!userData || !userIdToApproval) return null
    return userData.find((user) => user._id === userIdToApproval)
  }, [userData, userIdToApproval])

  const handleOpenModalApproval = (userId: string) => {
    setUserIdToApproval(userId)
    setShowModalApproval(true)
  }

  const handleCloseModalApproval = () => {
    setShowModalApproval(false)
    setUserIdToApproval("")
  }

  const handleApprovalUser = async () => {
    try {
      await mutation.mutateAsync(userIdToApproval)
      setShowModalApproval(false)
    } catch (error) {
      console.error("Erro ao desativar usuário:", error)
    }
  }

  const columnHelper = createColumnHelper<User>()

  const columns = [
    ...(activeTab === "pending"
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
              const profileName = info.getValue()?.name
              return profileName ? profileMapping[profileName] : "Não informado"
            },
            meta: {
              filterVariant: "text"
            }
          })
        ]
      : []),
    columnHelper.accessor("situacao", {
      header: "Situação",
      cell: (info) => {
        const situacaoName = info.getValue()?.toString()
        return situacaoName
          ? situacaoMapping[Number(situacaoName)]
          : "Não informado"
      },
      meta: {
        filterVariant: "text"
      }
    }),
    ...(activeTab !== "pending"
      ? [
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
            cell: (info) => (
              <div className="flex justify-start gap-2">
                <button
                  className="btn text-[#1351b4]"
                  onClick={() => handleOpenModalApproval(info.getValue())}
                  aria-label="Aprovar usuário"
                  title="Aprovar usuário"
                >
                  <i className="fa-solid fa-user-check fa-fw pl-2"></i>
                </button>
              </div>
            ),
            enableColumnFilter: false
          })
        ]
      : [])
  ] as ColumnDef<User>[]

  const userCounts = useMemo(() => {
    if (!userData)
      return { admin: 0, declarant: 0, analyst: 0, all: 0, pending: 0 }

    return {
      admin: userData.filter((user) => user.profile?.name === "admin").length,
      declarant: userData.filter(
        (user) => user.profile?.name === "declarant" && user.situacao != 0
      ).length,
      analyst: userData.filter((user) => user.profile?.name === "analyst")
        .length,
      all: userData.length,
      pending: userData.filter((user) => user.situacao === 0).length
    }
  }, [userData])

  const filteredUsers = useMemo(() => {
    if (!userData) return []

    switch (activeTab) {
      case "all":
        return userData
      case "pending":
        return userData.filter((user) => user.situacao === 0)
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
        <Table columns={columns} data={filteredUsers} />
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
      {showModalApproval && userToApprove && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <Modal
            title="Aprovar usuário?"
            showCloseButton
            onCloseButtonClick={() => handleCloseModalApproval()}
          >
            <Modal.Body>
              <p>
                Deseja realmente autorizar o acesso do usuário{" "}
                <strong>{userToApprove.nome}</strong> para enviar declarações
                do(s) museu(s){" "}
                <strong>
                  {userToApprove.museus.length > 0
                    ? userToApprove.museus.map((museu) => museu.nome).join(", ")
                    : "Nenhum museu"}
                </strong>
                ?
              </p>
            </Modal.Body>
            <Modal.Footer justify-content="end">
              <Button primary small m={2} onClick={handleApprovalUser}>
                Confirmar
              </Button>
              <Button secondary small m={2} onClick={handleCloseModalApproval}>
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
