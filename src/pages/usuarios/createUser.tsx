import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import DefaultLayout from "../../layouts/default"
import { useMutation, useSuspenseQuery } from "@tanstack/react-query" //add useSuspenseQuery
import Input from "../../components/Input"
import { Select } from "react-dsgov"
import { z } from "zod"
import { useForm, Controller } from "react-hook-form" //add Controller
import { zodResolver } from "@hookform/resolvers/zod"
import clsx from "clsx"
import { Link } from "react-router-dom"
import request from "../../utils/request"
import toast from "react-hot-toast"

const schema = z
  .object({
    email: z.string().min(1, "Este campo é obrigatório"),
    nome: z.string().min(1, "Este campo é obrigatório"),
    profile: z.string().min(1, "Este campo é obrigatório"),
    password: z.string().min(1, "Este campo é obrigatório"),
    confirmPassword: z.string().min(1, "Este campo é obrigatório"),
    tipoAnalista: z.array(z.string()).optional()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não são iguais",
    path: ["confirmPassword"]
  })
type FormData = z.infer<typeof schema>

interface Profile {
  _id: string
  name: string
  description: string
}

const CreateUser: React.FC = () => {
  const [isAnalyst, setIsAnalyst] = useState(false)

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
      password,
      profile,
      tipoAnalista
    }: FormData) => {
      //add profile

      const res = await request("/api/admin/users", {
        method: "POST",
        data: {
          email,
          nome,
          profile,
          senha: password,
          tipoAnalista: isAnalyst ? tipoAnalista : []
          //museus: []
        }
      })

      return await res.json()
    },
    onSuccess: () => {
      navigate("/usuarios")
      toast.success("Usuário criado com sucesso")
    },
    onError: () => {
      toast.error("Erro ao criar usuário")
    }
  })

  const onSubmit = ({
    email,
    nome,
    password,
    profile,
    confirmPassword,
    tipoAnalista
  }: FormData) => {
    //add profile

    mutate({ email, nome, password, profile, confirmPassword, tipoAnalista }) //add profile
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

  // Monitorar mudanças no campo 'profile' para habilitar/desabilitar o multiselect
  const selectedProfile = watch("profile")
  React.useEffect(() => {
    const selected = profiles.find((p) => p._id === selectedProfile)
    setIsAnalyst(selected?.name.toLowerCase() === "analyst")
  }, [selectedProfile, profiles])

  return (
    <DefaultLayout>
      <div className="container mx-auto p-8">
        <Link to="/usuarios" className="text-lg">
          <i className="fas fa-arrow-left" aria-hidden="true"></i>
          Voltar
        </Link>
        <h2>Criar Usuário</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="p-2">
            <p>Informações Pessoais</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                label="Nome"
                placeholder="Digite seu nome"
                error={errors.nome}
                {...register("nome")}
              />
              <Input
                type="email"
                label="Email"
                placeholder="Digite seu email"
                error={errors.email}
                {...register("email")}
              />
            </div>
          </div>
          <div className="p-2">
            <p>Detalhes de Acesso</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="profile"
                control={control}
                render={({ field }) => (
                  <Select
                    id="select-simples"
                    placeholder="Selecione um perfil"
                    label="Perfil"
                    className="w-full"
                    options={profileOptions}
                    {...field}
                  />
                )}
              />
              {isAnalyst && (
                <Controller
                  name="tipoAnalista"
                  control={control}
                  render={({ field }) => (
                    <Select
                      type="multiple"
                      selectAllText=""
                      placeholder="Selecione os tipos de especialidade"
                      label="Tipo de especialidade"
                      className="w-full"
                      options={[
                        { label: "Arquivístico", value: "arquivistico" },
                        { label: "Museológico", value: "museologico" },
                        { label: "Bibliográfico", value: "bibliografico" }
                      ]}
                      {...field}
                    />
                  )}
                />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="password"
                label="Senha"
                placeholder="Digite sua senha"
                error={errors.password}
                {...register("password")}
              />
              <Input
                type="password"
                label="Confirmar Senha"
                placeholder="Digite sua senha novamente"
                error={errors.confirmPassword}
                {...register("confirmPassword")}
              />
            </div>
          </div>

          {/* Botões */}
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
    </DefaultLayout>
  )
}

export default CreateUser
