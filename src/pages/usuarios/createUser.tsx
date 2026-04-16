import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useMutation, useSuspenseQuery, useQuery } from "@tanstack/react-query"
import Input from "../../components/Input"
import { Row, Col, Button } from "react-dsgov"
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import clsx from "clsx"
import { Link } from "react-router"
import request from "../../utils/request"
import toast from "react-hot-toast"
import { debounce } from "lodash"
import Select from "../../components/MultiSelect"
import { Museu, RespostaMuseus } from "../../types/museu"
import { Profile } from "../../types/user"

const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]+/g, "")
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false

  const cpfDigits = cpf.split("").map((el) => +el)
  const rest = (count: number) => {
    return (
      ((cpfDigits
        .slice(0, count - 12)
        .reduce((soma, el, index) => soma + el * (count - index), 0) *
        10) %
        11) %
      10
    )
  }

  return rest(10) === cpfDigits[9] && rest(11) === cpfDigits[10]
}

const schema = z
  .object({
    email: z.string().min(1, "Este campo é obrigatório"),
    nome: z.string().min(1, "Este campo é obrigatório"),
    cpf: z
      .string()
      .min(1, "Este campo é obrigatório")
      .refine((cpf) => validateCPF(cpf), {
        message: "CPF inválido"
      }),
    profile: z.string().min(1, "Este campo é obrigatório"),
    password: z.string().min(1, "Este campo é obrigatório"),
    confirmPassword: z.string().min(1, "Este campo é obrigatório"),
    especialidadeAnalista: z.array(z.string()).optional(),
    museus: z.array(z.string()).optional()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não são iguais",
    path: ["confirmPassword"]
  })
type FormData = z.infer<typeof schema>

const fetchMuseus = async (
  search: string,
  page: number
): Promise<RespostaMuseus> => {
  const response = await request(
    `/api/admin/museus?search=${search}&page=${page}`
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

const CreateUser: React.FC = () => {
  const [isAnalyst, setIsAnalyst] = useState(false)
  const [isDeclarant, setIsDeclarant] = useState(false)
  const [selectedMuseus, setSelectedMuseus] = useState<string[]>([])
  const [selectedMuseusNames, setSelectedMuseusNames] = useState<Museu[]>([])
  const [selectedEspecialidades, setSelectedEspecialidades] = useState<
    string[]
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const { data: museusData } = useQuery<RespostaMuseus>({
    queryKey: ["museus", search, page],
    queryFn: () => fetchMuseus(search, page),
    enabled: search.length >= 3
  })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const museus = search.length >= 3 ? museusData?.museus || [] : []

  const debounceSearch = debounce((value: string) => {
    console.log(value)
    setIsLoading(true)
    setSearch(value)
    setPage(1)
  }, 500)

  useEffect(() => {
    if (museus.length > 0) {
      setIsLoading(false)
    }
  }, [museus])

  const { data: profiles } = useSuspenseQuery<Profile[]>({
    queryKey: ["profiles"],
    queryFn: async () => {
      const response = await fetch("/api/admin/profile")
      if (!response.ok) {
        throw new Error("Failed to fetch profiles")
      }
      return response.json()
    }
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur"
  })

  const navigate = useNavigate()

  const { mutate } = useMutation({
    mutationFn: async ({
      email,
      nome,
      cpf,
      password,
      profile,
      especialidades,
      museus
    }: FormData & { museus: string[]; especialidades: string[] }) => {
      const res = await request("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          nome,
          cpf,
          profile,
          senha: password,
          especialidadeAnalista: isAnalyst ? especialidades : [],
          museus: isDeclarant ? museus : []
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Erro ao criar usuário")
      }

      return res.json()
    },
    onSuccess: () => {
      navigate("/usuarios")
      toast.success("Usuário criado com sucesso")
    }
  })

  useEffect(() => {
    if (selectedMuseus.length > 0) {
      const museusSelecionados = selectedMuseus
        .map((item) => {
          const [id] = item.split(",")
          return (
            museus.find((m) => m._id === id) ||
            selectedMuseusNames.find((m) => m._id === id)
          )
        })
        .filter((m) => m !== undefined) as Museu[]

      setSelectedMuseusNames(museusSelecionados)
    } else {
      setSelectedMuseusNames([])
    }
  }, [selectedMuseus, museus]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = ({
    email,
    nome,
    password,
    cpf,
    profile,
    confirmPassword
  }: FormData) => {
    const museusIds = isDeclarant
      ? selectedMuseus.map((item) => item.split(",")[0])
      : []

    mutate({
      email,
      nome,
      password,
      cpf,
      profile,
      confirmPassword,
      especialidades: selectedEspecialidades,
      museus: museusIds
    })
  }

  const profileOptions = profiles.map((profile) => {
    const labelMap: Record<string, string> = {
      admin: "Administrador",
      analyst: "Analista",
      declarant: "Declarante"
    }

    return {
      label: labelMap[profile.name.toLowerCase()] || profile.name,
      value: profile._id
    }
  })

  const selectedProfile = watch("profile")
  useEffect(() => {
    const selected = profiles.find((p) => p._id === selectedProfile)
    setIsAnalyst(selected?.name.toLowerCase() === "analyst")
    setIsDeclarant(selected?.name.toLowerCase() === "declarant")
  }, [selectedProfile, profiles])

  return (
    <>
      <div className="container mx-auto p-8">
        <Link to="/usuarios" className="text-lg">
          <i className="fas fa-arrow-left" aria-hidden="true"></i>
          Voltar
        </Link>
        <h2>Criar novo usuário</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <fieldset
            className="rounded-lg p-3"
            style={{ border: "2px solid #e0e0e0" }}
          >
            <legend className="text-lg font-extrabold px-3 m-0">
              Dados pessoais
            </legend>
            <div className="grid grid-cols-3 gap-2 w-full p-2">
              <Input
                type="text"
                label={
                  <span>
                    CPF <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="000.000.000-00"
                error={errors.cpf}
                {...register("cpf")}
              />
              <Input
                type="text"
                label={
                  <span>
                    Nome <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Digite o nome do usuário"
                error={errors.nome}
                {...register("nome")}
              />
              <Input
                type="email"
                label={
                  <span>
                    E-mail <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Digite o email do usuário"
                error={errors.email}
                {...register("email")}
              />
            </div>
          </fieldset>
          <fieldset
            className="rounded-lg p-3"
            style={{ border: "2px solid #e0e0e0" }}
          >
            <legend className="text-lg font-extrabold px-3 m-0">
              Controle de acesso
            </legend>
            <div className="flex flex-col w-full items-center">
              <div className="flex justify-between w-3/4 gap-58">
                <Controller
                  name="profile"
                  control={control}
                  render={({ field }) => (
                    <Select
                      placeholder="Selecione um perfil"
                      label={
                        <span>
                          Perfil <span className="text-red-500">*</span>
                        </span>
                      }
                      className="w-full"
                      options={profileOptions}
                      {...field}
                    />
                  )}
                />
                {isAnalyst && (
                  <Controller
                    name="especialidadeAnalista"
                    control={control}
                    render={({ field }) => (
                      <Select
                        type="multiple"
                        selectAllText=""
                        placeholder="Selecione os tipos de especialidade"
                        label={
                          <span>
                            Tipo de especialidade{" "}
                            <span className="text-red-500">*</span>
                          </span>
                        }
                        className="w-full"
                        options={[
                          { label: "Arquivístico", value: "arquivistico" },
                          { label: "Museológico", value: "museologico" },
                          { label: "Bibliográfico", value: "bibliografico" }
                        ]}
                        {...field}
                        value={selectedEspecialidades}
                        onChange={(selected: string[]) => {
                          field.onChange(selected)
                          setSelectedEspecialidades(selected)
                        }}
                      />
                    )}
                  />
                )}
                {isDeclarant && (
                  <div className="w-full">
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
                                label={
                                  <span>
                                    Museus{" "}
                                    <span className="text-red-500">*</span>
                                  </span>
                                }
                                placeholder="Digite pelo menos 3 caracteres para buscar..."
                                options={
                                  museus.length > 0
                                    ? museus.map((m: Museu) => ({
                                        // Exibição da pseudochave
                                        label: `${m.nome} - ${m.endereco?.municipio}/${m.endereco?.uf}`,
                                        // Salvamos o ID e a pseudochave no value
                                        value: `${m._id},${m.nome} - ${m.endereco?.municipio}/${m.endereco?.uf}`
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
                                  setSelectedMuseus(selected)
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
              </div>
              <div className="mt-4 w-full grid">
                {isDeclarant && selectedMuseusNames.length > 0 && (
                  <>
                    <p className="text-sm text-gray-500 mb-2">
                      {selectedMuseusNames.length} museu(s) selecionado(s):
                    </p>
                    <div className="flex flex-wrap gap-2 p-2">
                      {selectedMuseusNames.map((museu, index) => (
                        <Button
                          key={index}
                          className="gap-2 flex items-center justify-between p-4"
                          primary
                          inverted
                        >
                          <i
                            className="fa-solid fa-xmark ml-2 cursor-pointer pr-4"
                            onClick={() => {
                              setSelectedMuseus((prev) =>
                                prev.filter(
                                  (m) => m.split(",")[0] !== museu._id
                                )
                              )
                              setSelectedMuseusNames((prev) =>
                                prev.filter((m) => m._id !== museu._id)
                              )
                            }}
                          ></i>

                          <div className="flex flex-col">
                            <div className="text-left font-semibold">
                              {museu?.nome}
                            </div>
                            {museu?.endereco && (
                              <div className="text-sm text-left text-gray-500">
                                {museu.endereco.logradouro
                                  ? `${museu.endereco.logradouro}, ${museu.endereco.numero} - `
                                  : ""}
                                {museu.endereco.municipio}/{museu.endereco.uf}
                              </div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="password"
                label={
                  <span>
                    Senha <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Digite sua senha"
                error={errors.password}
                {...register("password")}
              />
              <Input
                type="password"
                label={
                  <span>
                    Confirmar senha <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Digite sua senha novamente"
                error={errors.confirmPassword}
                {...register("confirmPassword")}
              />
            </div>
          </fieldset>
          <div className="flex justify-end space-x-4">
            <Link to="/usuarios" className="br-button secondary">
              Voltar
            </Link>
            <button
              className={clsx("br-button primary", isSubmitting && "loading")}
              type="submit"
            >
              Criar
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default CreateUser
