import React, { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router"
import {
  useMutation,
  useSuspenseQueries,
  useQuery
} from "@tanstack/react-query"
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"
import Input from "../../../components/Input"
import { Row, Col, Button, Modal, Checkbox } from "react-dsgov"
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import clsx from "clsx"
import { Link } from "react-router"
import request from "../../../utils/request"
import Table from "../../../components/Table"
import toast from "react-hot-toast"
import { debounce } from "lodash"
import Select from "../../../components/MultiSelect"

const schema = z.object({
  email: z.string().min(1, "Este campo é obrigatório"),
  nome: z.string().min(1, "Este campo é obrigatório"),
  especialidadeAnalista: z.array(z.string()).optional(),
  situacao: z.number().optional(),
  museus: z.array(z.string()).optional()
})
type FormData = z.infer<typeof schema>

interface Museu {
  _id: string
  nome: string
  endereco: {
    municipio: string
    bairro: string
  }
  esferaAdministraiva: string
}

interface Paginacao {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

interface RespostaMuseus {
  museus: Museu[]
  pagination: Paginacao
}

const fetchMuseus = async (
  search: string,
  page: number
): Promise<RespostaMuseus> => {
  const response = await request(
    `/api/admin/museus?semVinculoUsuario=true&search=${search}&page=${page}`
  )
  if (!response.ok) throw new Error("Erro ao carregar museus")

  const data = await response.json()

  return {
    museus: data.museus || [],
    pagination: data.pagination || {
      currentPage: 0,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 0
    }
  }
}

const userById = async (id: string) => {
  const response = await request(`/api/admin/users/${id}`)
  if (!response.ok) {
    let errorMessage = "Usuário não encontrado"
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch {
      throw new Error(errorMessage)
    }
  }
  return await response.json()
}

const EditUser: React.FC = () => {
  const [selectedMuseus, setSelectedMuseus] = useState<string[]>([])
  const [selectedMuseusNames, setSelectedMuseusNames] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const [showModal, setShowModal] = useState(false)
  const [museuIdToDelete, setUserIdToDelete] = useState<string>("")

  const { data: museusData } = useQuery<RespostaMuseus>({
    queryKey: ["museus", search, page],
    queryFn: () => fetchMuseus(search, page),
    enabled: search.length > 0
  })

  const museus = museusData?.museus || []

  const debounceSearch = useCallback(
    debounce((value: string) => {
      setIsLoading(true)
      setSearch(value)
      setPage(1)
    }, 500),
    [setIsLoading, setSearch, setPage]
  )

  useEffect(() => {
    if (museus.length > 0) {
      setIsLoading(false)
    }
  }, [museus])

  const { id } = useParams<{ id: string }>()
  const [{ data: user }] = useSuspenseQueries({
    queries: [{ queryKey: ["user", id], queryFn: () => userById(id!) }]
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      email: user?.email,
      nome: user?.nome,
      especialidadeAnalista: user?.especialidadeAnalista || [],
      situacao: user?.situacao
    }
  })

  const { mutate } = useMutation({
    mutationFn: async ({
      email,
      nome,
      especialidadeAnalista,
      museus,
      situacao,
      desvincularMuseus
    }: FormData & { museus: string[] }) => {
      const payload: {
        email: string
        nome: string
        especialidadeAnalista?: string[]
        museus?: string[]
        situacao?: number
      } = {
        email,
        nome,
        situacao
      }

      if (user.profile?.name === "analyst") {
        payload.especialidadeAnalista = especialidadeAnalista
      }

      if (user.profile?.name === "declarant") {
        payload.museus = museus
        payload.desvincularMuseus = desvincularMuseus
      }

      const res = await request(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Erro ao criar usuário")
      }

      return res.json()
    },
    onSuccess: () => {
      window.location.reload()
      toast.success("Usuário atualizado com sucesso")
    },
    onError: () => {
      toast.error("Erro ao atualizar usuário")
    }
  })
  const onSubmit = ({
    email,
    nome,
    especialidadeAnalista,
    situacao
  }: FormData) => {
    const museusIds =
      user.profile?.name === "declarant" && Array.isArray(selectedMuseus)
        ? selectedMuseus.map((item) => {
            const partes = item.split(",")
            return partes.length > 0 ? partes[0] : item
          })
        : []

    mutate({ email, nome, especialidadeAnalista, museus: museusIds, situacao })
  }

  if (!user) {
    return <div>Carregando...</div>
  }

  const profileTranslations: Record<string, string> = {
    admin: "administrador",
    analyst: "analista",
    declarant: "declarante"
  }

  const profileName = user.profile?.name
  const translatedProfile = profileTranslations[profileName] || profileName

  const situacaoOptions = [
    { label: "Ativo", value: 1 },
    { label: "Inativo", value: 2 }
  ]

  const handleOpenModal = (userId: string) => {
    setUserIdToDelete(userId)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setUserIdToDelete("")
  }

  const handleDeleteMuseu = async () => {
    if (!museuIdToDelete) return

    try {
      const res = await request(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          desvincularMuseus: [museuIdToDelete]
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Erro ao desassociar museu")
      }

      toast.success("Museu desassociado com sucesso")
      window.location.reload()
      setShowModal(false)
    } catch (error) {
      console.error("Erro ao desassociar museu:", error)
      toast.error("Erro ao desassociar museu")
    }
  }

  const columnHelper = createColumnHelper<Museu>()

  const columns = [
    columnHelper.accessor("nome", {
      header: "Nome",
      cell: (info: { row: { original: { nome: string } } }) =>
        info.row.original.nome || "Nome não disponível",
      meta: {
        filterVariant: "text"
      }
    }),
    columnHelper.accessor("municipio", {
      header: "Município",
      cell: (info: { row: { original: { municipio: string } } }) =>
        info.row.original.endereco.municipio || "Nome não disponível",
      meta: {
        filterVariant: "text"
      }
    }),
    columnHelper.accessor("bairro", {
      header: "Bairro",
      cell: (info: { row: { original: { bairro: string } } }) =>
        info.row.original.endereco.bairro || "Nome não disponível",
      meta: {
        filterVariant: "text"
      }
    }),
    columnHelper.accessor("esferaAdministraiva", {
      header: "Administração",
      cell: (info: { row: { original: { esferaAdministraiva: string } } }) =>
        info.row.original.esferaAdministraiva || "Nome não disponível",
      meta: {
        filterVariant: "text"
      }
    }),
    columnHelper.accessor("_id", {
      header: "Ações",
      cell: (info) => (
        <div className="flex justify-start gap-2">
          <button
            className="btn text-[#1351b4]"
            onClick={() => handleOpenModal(info.row.original._id)}
            aria-label="Desassociar museu"
            title="Desassociar museu"
          >
            <i className="fa-solid fa-trash fa-fw pl-2"></i>
          </button>
        </div>
      ),
      enableColumnFilter: false
    })
  ] as ColumnDef<Museu>[]

  const formatCPF = (cpf: string): string => {
    cpf = cpf.replace(/\D/g, "")
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  return (
    <>
      <div className="container mx-auto p-8">
        <Link to="/usuarios" className="text-lg">
          <i className="fas fa-arrow-left" aria-hidden="true"></i>
          Voltar
        </Link>
        <h2>Editar usuário {translatedProfile}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <fieldset
            className="rounded-lg p-3"
            style={{ border: "2px solid #e0e0e0" }}
          >
            <legend className="text-lg font-extrabold px-3 m-0">Dados</legend>
            <div className="grid grid-cols-3 gap-2 w-full p-2">
              <Input
                label="CPF"
                value={
                  user.cpf
                    ? formatCPF(user.cpf)
                    : "Este usuário não possui CPF cadastrado."
                }
                rows={1}
                readOnly
                disabled
                className="text-gray-500 italic opacity-50"
              />
              <Input
                type="text"
                label="Nome"
                placeholder="Digite o nome"
                error={errors.nome}
                {...register("nome")}
                className="w-full"
              />
              <Input
                type="email"
                label="E-mail"
                placeholder="Digite o email"
                error={errors.email}
                {...register("email")}
                className="w-full"
              />
              <div className="mt-2">
                <label>Situação do usuário</label>
                <Controller
                  control={control}
                  name="situacao"
                  defaultValue={user?.situacao}
                  render={({ field }) => (
                    <div className="flex flex-col w-full items-center pt-4">
                      <div className="flex justify-between w-3/4">
                        {situacaoOptions.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              checked={field.value === option.value}
                              onChange={(e) => {
                                const checked = (e.target as HTMLInputElement)
                                  .checked
                                if (checked) {
                                  field.onChange(option.value)
                                }
                              }}
                            />
                            <span className="text-gray-700 text-base">
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                />
              </div>
            </div>
          </fieldset>
          {user.profile?.name != "admin" && (
            <fieldset
              className="rounded-lg p-3"
              style={{ border: "2px solid #e0e0e0" }}
            >
              {user.profile?.name === "declarant" ? (
                <legend className="text-lg font-extrabold px-3 m-0">
                  Associar museus
                </legend>
              ) : user.profile?.name === "analyst" ? (
                <legend className="text-lg font-extrabold px-3 m-0">
                  Especialidades
                </legend>
              ) : null}
              {user.profile?.name === "analyst" && (
                <Controller
                  control={control}
                  name="especialidadeAnalista"
                  render={({ field }) => (
                    <div className="flex flex-col w-full items-center">
                      <div className="flex justify-between w-3/4">
                        {["arquivistico", "museologico", "bibliografico"].map(
                          (option) => (
                            <label
                              key={option}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                checked={field.value?.includes(option)}
                                onChange={(e) => {
                                  const checked = (e.target as HTMLInputElement)
                                    .checked
                                  const newValue = checked
                                    ? [...(field.value || []), option]
                                    : field.value?.filter((v) => v !== option)
                                  field.onChange(newValue)
                                }}
                              />
                              <span className="text-gray-700 text-base">
                                {option.charAt(0).toUpperCase() +
                                  option.slice(1)}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                      <p className="text-gray-500 text-sm italic mt-6 text-center">
                        Selecione pelo menos uma especialidade.
                      </p>
                    </div>
                  )}
                />
              )}

              {user.profile?.name === "declarant" && (
                <div className="grid grid-cols-3 gap-2 w-full p-2">
                  <Row>
                    <Col>
                      <Controller
                        control={control}
                        name="museus"
                        render={({ field }) => (
                          <>
                            <Select
                              type="multiple"
                              selectAllText={""}
                              label="Museus"
                              placeholder="Digite para buscar..."
                              options={
                                museus.length > 0
                                  ? museus.map((m: Museu) => ({
                                      label: m.nome,
                                      value: `${m._id},${m.nome}`
                                    }))
                                  : []
                              }
                              className="!w-full"
                              {...field}
                              value={selectedMuseus}
                              onInput={(e) => {
                                const inputValue = (
                                  e.target as HTMLInputElement
                                ).value
                                debounceSearch(inputValue)
                              }}
                              onChange={(selected: string[]) => {
                                field.onChange(selected)

                                const nomesMuseus = selected.map(
                                  (item) => item.split(",")[1]
                                )
                                setSelectedMuseus(selected)
                                setSelectedMuseusNames(nomesMuseus)
                              }}
                            />
                            {isLoading && (
                              <p className="text-sm text-gray-500 mt-2">
                                Carregando museus...
                              </p>
                            )}
                          </>
                        )}
                      />
                    </Col>
                  </Row>
                </div>
              )}
              <div className="mt-4 w-full grid">
                {user.profile?.name === "declarant" &&
                  selectedMuseusNames.length > 0 && (
                    <>
                      <p className="text-sm text-gray-500 mb-2">
                        {selectedMuseusNames.length} museu(s) selecionado(s):
                      </p>
                      <div className="flex flex-wrap gap-2 p-2">
                        {selectedMuseusNames.map((name, index) => (
                          <Button
                            key={index}
                            className="gap-2 flex items-center justify-between"
                            primary
                            inverted
                          >
                            <i
                              className="fa-solid fa-xmark ml-2 cursor-pointer"
                              onClick={() => {
                                const updatedMuseus = selectedMuseus.filter(
                                  (_, i) => i !== index
                                )
                                const updatedNames = selectedMuseusNames.filter(
                                  (_, i) => i !== index
                                )

                                setSelectedMuseus(updatedMuseus)
                                setSelectedMuseusNames(updatedNames)
                              }}
                            ></i>
                            {name}
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
              </div>
            </fieldset>
          )}

          {user.profile?.name === "declarant" && (
            <fieldset
              className="rounded-lg p-3"
              style={{ border: "2px solid #e0e0e0" }}
            >
              <legend className="text-lg font-extrabold px-3 m-0">
                Museus associados
              </legend>
              <div className="mt-6">
                {user.museus && user.museus.length > 0 ? (
                  <Table columns={columns} data={user.museus} />
                ) : (
                  <p className="text-gray-500">Nenhum museu associado.</p>
                )}
              </div>
            </fieldset>
          )}

          <div className="flex space-x-4 justify-end">
            <Link to="/usuarios" className="br-button secondary mt-5">
              Voltar
            </Link>
            <button
              className={clsx(
                "br-button primary mt-5",
                isSubmitting && "loading"
              )}
              type="submit"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
      {/* Modal de Confirmação */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <Modal
            title="Desassociar museu?"
            showCloseButton
            onCloseButtonClick={() => handleCloseModal()}
          >
            <Modal.Body>
              Você tem certeza que deseja desassociar este museu?
            </Modal.Body>
            <Modal.Footer justify-content="end">
              <Button primary small m={2} onClick={handleDeleteMuseu}>
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

export default EditUser
