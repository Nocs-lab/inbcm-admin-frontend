import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import DefaultLayout from "../../layouts/default"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import request from "../../utils/request"
import { Modal, Button, Select, Row, Col } from "react-dsgov"
import { useForm, Controller } from "react-hook-form"
import toast from "react-hot-toast"
import Table from "../../components/Table"
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"
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

const fetchUsers = async (
  page = 1,
  limit = 10
): Promise<{ docs: User[]; totalPages: number }> => {
  const response = await request(`/api/admin/users?page=${page}&limit=${limit}`)
  if (!response.ok) {
    let errorMessage = "Perfil não encontrado"
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch (e) {
      console.error("Failed to parse error response", e)
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

const fetchMuseus = async (): Promise<Museu[]> => {
  const response = await request(
    "/api/admin/museus?semVinculoUsuario=true&page=1&limit=10"
  )
  if (!response.ok) throw new Error("Erro ao carregar museus")
  const data = await response.json()
  return data.museus || []
}

const columnHelper = createColumnHelper<User>()

const profileMapping: { [key: string]: string } = {
  admin: "Administrador",
  declarant: "Declarante",
  analyst: "Analista"
}

const Index: React.FC = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { control } = useForm<{ museus: string[] }>()

  const [page] = useState(1)
  const [pageSize] = useState(10)

  const { data: userData } = useQuery({
    queryKey: ["users", page],
    queryFn: () => fetchUsers(page, pageSize),
    keepPreviousData: true
  })

  const { data: museus } = useQuery<Museu[]>({
    queryKey: ["museus"],
    queryFn: fetchMuseus
  })

  const [showAssociationModal, setShowAssociationModal] = useState(false)
  const [selectedMuseus, setSelectedMuseus] = useState<string[]>([])
  const [userIdToAssociate, setUserIdToAssociate] = useState<string>("")
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

  const associateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        museuId: selectedMuseus,
        usuarioId: userIdToAssociate
      }

      const response = await request("/api/admin/museus/vincular-usuario", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erro ao associar museus")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["museus"] })
      toast.success("Museu(s) associado(s) com sucesso!")
      setShowAssociationModal(false)
    },
    onError: (error) => {
      console.error("Erro ao associar museus:", error)
      toast.error("Erro ao associar museus")
    }
  })

  const handleOpenAssociationModal = (userId: string) => {
    setUserIdToAssociate(userId)
    setSelectedMuseus([])
    setShowAssociationModal(true)
  }

  const handleSubmitAssociation = async () => {
    if (!selectedMuseus.length) {
      alert("Selecione pelo menos um museu para associar.")
      return
    }

    try {
      await associateMutation.mutateAsync()
    } catch (error) {
      console.error("Erro ao associar museus:", error)
    }
  }

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

  return (
    <DefaultLayout>
      <div className="flex justify-between items-center mb-4">
        <h1>Usuários</h1>
        <Link to="/usuarios/createuser" className="btn text-xl p-3">
          <i className="fa-solid fa-user-plus"></i> Novo usuário
        </Link>
      </div>
      <div className="overflow-x-auto">
        <Table
          columns={
            [
              columnHelper.accessor("nome", {
                header: "Nome",
                cell: (info) => info.getValue()
              }),
              columnHelper.accessor("email", {
                header: "Email",
                cell: (info) => info.getValue()
              }),
              columnHelper.accessor("museus", {
                header: "Museus",
                cell: (info) =>
                  info
                    .getValue()
                    .slice(0, 2)
                    .map((museu: Museu) => museu.nome)
                    .join(", ") + (info.getValue().length > 2 ? " ..." : "")
              }),
              columnHelper.accessor("profile.name", {
                header: "Perfil",
                cell: (info) => profileMapping[info.getValue()] || "-"
              }),
              columnHelper.accessor("_id", {
                header: "Associar",
                cell: (info) => (
                  <Button
                    primary
                    inverted
                    onClick={() => handleOpenAssociationModal(info.getValue())}
                    disabled={["admin", "analyst"].includes(
                      info.row.original.profile?.name || ""
                    )}
                  >
                    <i className="fa-solid fa-share p-1 text-blue-950"></i>
                    Associar
                  </Button>
                )
              }),
              columnHelper.accessor("_id", {
                header: "Ações",
                cell: (info) => (
                  <div className="flex justify-center gap-2">
                    <button
                      className="btn text-blue-950"
                      onClick={() => navigate(`/usuarios/${info.getValue()}`)}
                      aria-label="Editar usuário"
                      title="Editar usuário"
                    >
                      <i className="fa-solid fa-pen-to-square pr-2"></i>
                    </button>
                    <button
                      className="btn text-blue-950"
                      onClick={() => handleOpenModal(info.getValue())}
                      aria-label="Excluir usuário"
                      title="Excluir usuário"
                    >
                      <i className="fa-solid fa-trash fa-fw pl-2"></i>
                    </button>
                  </div>
                )
              })
            ] as ColumnDef<User>[]
          }
          data={userData?.docs || []}
          pagination={true}
        />
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

      {showAssociationModal && (
        <Modal
          useScrim
          showCloseButton
          className="w-full max-w-[90%] sm:max-w-[600px] md:max-w-[800px] p-3"
          title="Associar Museus"
          modalOpened={showAssociationModal}
          onCloseButtonClick={() => setShowAssociationModal(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmitAssociation()
            }}
          >
            {/* Corpo do modal com rolagem */}
            <Modal.Body className="p-4">
              <Row>
                <Col>
                  <Controller
                    control={control}
                    name="museus"
                    render={({ field }) => (
                      <Select
                        type="multiple"
                        selectAllText={""}
                        label="Museus"
                        placeholder="Selecione..."
                        options={
                          museus?.map((m) => ({
                            label: m.nome,
                            value: m._id
                          })) ?? []
                        }
                        className="!w-full mt-2"
                        {...field}
                        value={selectedMuseus}
                        onChange={(selected: string[]) => {
                          console.log("Selecionados (onChange):", selected)
                          field.onChange(selected)
                          setSelectedMuseus(selected)
                        }}
                      />
                    )}
                  />
                </Col>
              </Row>
              <Row>
                <Col my={6}></Col>
              </Row>
            </Modal.Body>

            {/* Footer fixado ao final do modal */}
            <Modal.Footer justify-content="end" className="pt-4">
              <p className="mb-4">
                Tem certeza que deseja associar para este museu?
              </p>
              <Button
                secondary
                small
                m={2}
                type="button"
                onClick={() => setShowAssociationModal(false)}
              >
                Cancelar
              </Button>
              <Button primary small type="submit" m={2}>
                Confirmar
              </Button>
            </Modal.Footer>
          </form>
        </Modal>
      )}
    </DefaultLayout>
  )
}

export default Index
