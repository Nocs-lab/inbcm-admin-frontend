import Input from "../components/Input"
import { Link } from "react-router"
import { useSuspenseQuery, useMutation } from "@tanstack/react-query"
import request from "../utils/request"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import { Suspense, useEffect } from "react"
import Select from "../components/MultiSelect"

// Esquema de validação Zod
const schema = z
  .object({
    email: z
      .string()
      .min(1, "Este campo é obrigatório")
      .email("E-mail inválido"),
    nome: z.string().min(1, "Este campo é obrigatório"),
    password: z.string().min(1, "Este campo é obrigatório"),
    newPassword: z.string().min(1, "Este campo é obrigatório"),
    confirmPassword: z.string().min(1, "Este campo é obrigatório"),
    especialidadeAnalista: z
      .array(z.string())
      .min(1, "Selecione pelo menos uma especialidade")
      .optional()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não são iguais",
    path: ["confirmPassword"]
  })

type FormData = z.infer<typeof schema>

const especialidadesOptions = [
  { label: "Arquivístico", value: "arquivistico" },
  { label: "Museológico", value: "museologico" },
  { label: "Bibliográfico", value: "bibliografico" }
]

const PerfilPage = () => {
  // Buscar os dados do usuário
  const { data: user } = useSuspenseQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await request("/api/public/users")
      if (!response.ok) throw new Error("Erro ao carregar usuário")
      return response.json()
    }
  })
  // Configuração do React Hook Form
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur"
  })

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        nome: user.nome,
        newPassword: "",
        password: "",
        especialidadeAnalista: user.especialidadeAnalista || []
      })
    }
  }, [user, reset])

  // Função para enviar os dados atualizados
  const { mutate } = useMutation({
    mutationFn: async (updateData: {
      email: string
      nome: string
      senha: string
      senhaAtual: string
      especialidadeAnalista?: string[]
    }) => {
      const res = await request(`/api/admin/users/${user._id}`, {
        method: "PUT",
        data: updateData
      })
      if (!res.ok) throw new Error("Erro ao atualizar perfil")
      return res.json()
    },
    onSuccess: (data) => {
      toast.success(data.message)
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    },
    onError: () => {
      toast.error("Erro ao atualizar perfil")
    }
  })

  const onSubmit = (data: FormData) => {
    const updateData = {
      email: data.email,
      nome: data.nome,
      senhaAtual: data.password,
      senha: data.newPassword,
      ...(user.profile?.name === "analyst" && {
        especialidadeAnalista: data.especialidadeAnalista
      })
    }

    mutate(updateData)
  }

  const formatCPF = (cpf: string): string => {
    cpf = cpf.replace(/\D/g, "")
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  return (
    <>
      <Link
        to={user?.profile?.name === "admin" ? "/" : "/analista"}
        className="text-lg"
      >
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
      <h2>Editar meu perfil</h2>
      <div className="container mx-auto p-6 bg-white rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <fieldset
            className="rounded-lg p-3"
            style={{ border: "2px solid #e0e0e0" }}
          >
            <legend className="font-extrabold px-3 m-0">Dados pessoais</legend>
            <div>
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
              </div>
            </div>
          </fieldset>
          <fieldset
            className="rounded-lg p-3"
            style={{ border: "2px solid #e0e0e0" }}
          >
            <legend className="text-lg font-extrabold px-3 m-0">
              Controle de acesso
            </legend>
            <div className="p-2">
              {user.profile?.name === "analyst" && (
                <Controller
                  name="especialidadeAnalista"
                  control={control}
                  render={({ field }) => (
                    <Select
                      type="multiple"
                      selectAllText="Selecionar todas"
                      placeholder="Selecione as especialidades"
                      label="Especialidades"
                      options={especialidadesOptions}
                      value={field.value || []}
                      onChange={field.onChange}
                      className="w-full"
                      error={errors.especialidadeAnalista}
                    />
                  )}
                />
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 w-full p-2">
              <Input
                type="password"
                label={
                  <span>
                    Senha atual <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Digite sua senha atual"
                error={errors.password}
                {...register("password")}
              />
              <Input
                type="password"
                label={
                  <span>
                    Nova senha <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Digite sua nova senha"
                error={errors.newPassword}
                {...register("newPassword")}
              />
              <Input
                type="password"
                label={
                  <span>
                    Confirmar senha <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Digite sua nova senha novamente"
                error={errors.confirmPassword}
                {...register("confirmPassword")}
              />
            </div>
          </fieldset>
          <div className="flex space-x-4 justify-end">
            <Link to="/" className="br-button secondary mt-5">
              Voltar
            </Link>
            <button
              className={`br-button primary mt-5 ${isSubmitting ? "loading" : ""}`}
              type="submit"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

const PerfilPageWrapper = () => (
  <Suspense fallback={<div>Carregando...</div>}>
    <PerfilPage />
  </Suspense>
)

export default PerfilPageWrapper
