import React, { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import DefaultLayout from "../../../../layouts/default"
import {
  useMutation,
  useSuspenseQueries,
  useQueryClient,
  useQuery
} from "@tanstack/react-query"
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router-dom"
import request from "../../../../utils/request"
import Table from "../../../../components/Table"
import toast from "react-hot-toast"
import { Select, Row, Col } from "react-dsgov"
import { debounce } from "lodash"

const schema = z.object({
  email: z.string().min(1, "Este campo é obrigatório"),
  nome: z.string().min(1, "Este campo é obrigatório")
})
type FormData = z.infer<typeof schema>

interface Museu {
  _id: string
  nome: string
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

const AssociarPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [{ data: user }] = useSuspenseQueries({
    queries: [{ queryKey: ["user", id], queryFn: () => userById(id!) }]
  })
  const queryClient = useQueryClient()
  const { control, reset } = useForm<{ museus: string[] }>()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMuseus, setSelectedMuseus] = useState<string[]>([])
  const [selectedMuseusNames, setSelectedMuseusNames] = useState<string[]>([])

  const { data: museusData } = useQuery<RespostaMuseus>({
    queryKey: ["museus", search, page],
    queryFn: () => fetchMuseus(search, page),
    enabled: search.length > 0
  })

  const museus = museusData?.museus || []

  useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      email: user?.email,
      nome: user?.nome
    }
  })

  const associateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        museuId: selectedMuseus.map((item) => item.split(",")[0]),
        usuarioId: id
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
      queryClient.invalidateQueries({ queryKey: ["user", id] })
      queryClient.invalidateQueries({ queryKey: ["museus"] })
      toast.success("Museu(s) associado(s) com sucesso!")
      setSelectedMuseus([])
      setSelectedMuseusNames([])
      reset({ museus: [] })
    },
    onError: (error) => {
      console.error("Erro ao associar museus:", error)
      toast.error("Erro ao associar museus")
    }
  })

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

  if (!user) {
    return <div>Carregando...</div>
  }

  const museuColumns = [
    {
      accessor: "nome",
      header: "Nome",
      cell: (info: { row: { original: { nome: string } } }) =>
        info.row.original.nome || "Nome não disponível"
    },
    {
      accessor: "municipio",
      header: "Município",
      cell: (info: { row: { original: { municipio: string } } }) =>
        info.row.original.endereco.municipio || "Nome não disponível"
    },
    {
      accessor: "bairro",
      header: "Bairro",
      cell: (info: { row: { original: { bairro: string } } }) =>
        info.row.original.endereco.bairro || "Nome não disponível"
    },
    {
      accessor: "esferaAdministraiva",
      header: "Administração",
      cell: (info: { row: { original: { esferaAdministraiva: string } } }) =>
        info.row.original.esferaAdministraiva || "Nome não disponível"
    }
  ]

  return (
    <DefaultLayout>
      <Link to="/usuarios" className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
      <h1 className="p-4">Associar museu</h1>
      <div className="p-4">
        <div>
          <div className="flex space-x-4">
            <p>
              <strong>Declarante: </strong>
              {user.nome}
            </p>
            <p>
              <strong>Email: </strong>
              {user.email}
            </p>
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Associar Museus</h2>
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
                      className="!w-full mt-2"
                      {...field}
                      value={selectedMuseus}
                      onInput={(e) => {
                        const inputValue = (e.target as HTMLInputElement).value
                        debounceSearch(inputValue)
                      }}
                      onChange={(selected: string[]) => {
                        field.onChange(selected)

                        const nomesMuseus = selected.map(
                          (item) => item.split(",")[1]
                        ) // Pegando o segundo elemento (Nome)
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
          <div className="mt-4">
            {selectedMuseusNames.length > 0 && (
              <>
                <p className="text-sm text-gray-500 mb-2">
                  {selectedMuseusNames.length} museu(s) selecionado(s):
                </p>
                <div className="flex flex-wrap gap-2 p-2">
                  {selectedMuseusNames.map((name, index) => (
                    <strong
                      key={index}
                      className="br-tag gap-2 flex items-center justify-between"
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
                    </strong>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="flex space-x-4 justify-end mt-4">
            <Link to="/usuarios" className="br-button secondary">
              Voltar
            </Link>
            <button
              className="br-button primary"
              type="button"
              onClick={handleSubmitAssociation}
            >
              Associar Museus
            </button>
          </div>
        </div>
        <hr />
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Museus Associados</h2>
          {user.museus && user.museus.length > 0 ? (
            <Table
              columns={museuColumns}
              data={user.museus}
              pagination={true}
            />
          ) : (
            <p className="text-gray-500">Nenhum museu associado.</p>
          )}
        </div>
      </div>
    </DefaultLayout>
  )
}

export default AssociarPage
