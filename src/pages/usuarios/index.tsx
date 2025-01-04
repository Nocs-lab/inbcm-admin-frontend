import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import DefaultLayout from "../../layouts/default"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import request from "../../utils/request"
import { Modal, Button } from "react-dsgov"

import toast from "react-hot-toast"
import Table from "../../components/Table"
import { Link } from "react-router-dom"

interface User {
  _id: string
  nome: string
  email: string
  profile?: {
    name: string
  }
  ativo: boolean
  museus: Museu[]
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

  return await response.json()
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

  const museuColumns = [
    {
      accessor: "nome",
      header: "Nome",
      cell: (info: { row: { original: { nome: string } } }) =>
        info.row.original.nome || "Nome não disponível"
    },
    {
      accessor: "email",
      header: "Email",
      cell: (info: { row: { original: { email: string } } }) =>
        info.row.original.email || "Email não disponível"
    },
    {
      accessor: "museus",
      header: "Museus",
      cell: (info: { row: { original: { museus: Museu[] } } }) => {
        const museus = info.row.original.museus || []
        return (
          museus
            .slice(0, 2)
            .map((museu) => museu.nome)
            .join(", ") + (museus.length > 2 ? " ..." : "")
        )
      }
    },
    {
      accessor: "profile.name",
      header: "Perfil",
      cell: (info: { row: { original: { profile?: { name: string } } } }) =>
        profileMapping[info.row.original.profile?.name ?? ""] || "-"
    },
    {
      accessor: "_id",
      header: "Associar museus",
      cell: (info: { row: { original: User } }) => {
        const profileName = info.row.original.profile?.name || ""
        return !["admin", "analyst"].includes(profileName) ? (
          <Link to={`/usuarios/associar/${info.row.original._id}`}>
            <Button primary inverted small>
              <i className="fa-solid fa-share p-1 text-blue-950"></i>
              Associar museus
            </Button>
          </Link>
        ) : null
      }
    },
    {
      accessor: "_id",
      header: "Ações",
      cell: (info: { row: { original: { _id: string } } }) => (
        <div className="flex justify-center gap-2">
          <button
            className="btn text-blue-950"
            onClick={() => navigate(`/usuarios/${info.row.original._id}`)}
            aria-label="Editar usuário"
            title="Editar usuário"
          >
            <i className="fa-solid fa-pen-to-square pr-2"></i>
          </button>
          <button
            className="btn text-blue-950"
            onClick={() => handleOpenModal(info.row.original._id)}
            aria-label="Excluir usuário"
            title="Excluir usuário"
          >
            <i className="fa-solid fa-trash fa-fw pl-2"></i>
          </button>
        </div>
      )
    }
  ]

  return (
    <DefaultLayout>
      <div className="flex justify-between items-center mb-4">
        <h1>Usuários</h1>
        <Link to="/usuarios/createuser" className="btn text-xl p-3">
          <i className="fa-solid fa-user-plus"></i> Novo usuário
        </Link>
      </div>
      <div className="overflow-x-auto">
        <Table columns={museuColumns} data={userData || []} />
      </div>

      {/* Modal de Confirmação */}
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
    </DefaultLayout>
  )
}

export default Index
