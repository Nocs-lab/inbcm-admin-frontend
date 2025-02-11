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
  profile?: {
    name: string
  }
  ativo: boolean
  museus: Museu[]
  especialidadeAnalista?: string[]
}

interface Museu {
  _id: string
  nome: string
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

const Index: React.FC = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: userData } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers
  })

  const [showModal, setShowModal] = useState(false)
  const [userIdToDelete, setUserIdToDelete] = useState<string>("")
  const [activeTab, setActiveTab] = useState<
    "admin" | "declarant" | "analyst" | "all"
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
    },
    onError: () => {
      toast.error("Erro ao desativar usuário")
    }
  })

  const handleOpenModal = (userId: string) => {
    setUserIdToDelete(userId)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setUserIdToDelete("")
  }

  const handleDeleteUser = async () => {
    try {
      await mutation.mutateAsync(userIdToDelete)
      setShowModal(false)
    } catch (error) {
      console.error("Erro ao desativar usuário:", error)
    }
  }

  const columnHelper = createColumnHelper<User>()

  const columns = [
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
    ...(activeTab === "declarant"
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
    columnHelper.accessor("_id", {
      header: "Ações",
      cell: (info) => (
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
            className="btn text-[#1351b4]"
            onClick={() => handleOpenModal(info.getValue())}
            aria-label="Excluir usuário"
            title="Excluir usuário"
          >
            <i className="fa-solid fa-trash fa-fw pl-2"></i>
          </button>
        </div>
      ),
      enableColumnFilter: false
    })
  ] as ColumnDef<User>[]

  const userCounts = useMemo(() => {
    if (!userData) return { admin: 0, declarant: 0, analyst: 0, all: 0 }

    return {
      admin: userData.filter((user) => user.profile?.name === "admin").length,
      declarant: userData.filter((user) => user.profile?.name === "declarant")
        .length,
      analyst: userData.filter((user) => user.profile?.name === "analyst")
        .length,
      all: userData.length
    }
  }, [userData])

  const filteredUsers = useMemo(() => {
    if (!userData) return []
    if (activeTab === "all") return userData
    return userData.filter((user) => user.profile?.name === activeTab)
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

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <Modal
            title="Desativar usuário?"
            showCloseButton
            onCloseButtonClick={() => handleCloseModal()}
          >
            <Modal.Body>
              Você tem certeza que deseja desativar este usuário?
            </Modal.Body>
            <Modal.Footer justify-content="end">
              <Button primary small m={2} onClick={handleDeleteUser}>
                Confirmar
              </Button>
              <Button secondary small m={2} onClick={handleCloseModal}>
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
