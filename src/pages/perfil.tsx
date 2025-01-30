import DefaultLayout from "../layouts/default"
import Input from "../components/Input"
import { Link } from "react-router-dom"
import { useSuspenseQuery, useMutation } from "@tanstack/react-query"
import request from "../utils/request"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import { Suspense } from "react"

// Esquema de validação Zod
const schema = z.object({
  email: z.string().min(1, "Este campo é obrigatório").email("Email inválido"),
  nome: z.string().min(1, "Este campo é obrigatório")
})

type FormData = z.infer<typeof schema>

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
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: user
      ? {
          email: user.email || "",
          nome: user.nome || ""
        }
      : {}
  })

  // Função para enviar os dados atualizados
  const { mutate } = useMutation({
    mutationFn: async ({ email, nome }: FormData) => {
      const res = await request(`/api/admin/users/${user._id}`, {
        method: "PUT",
        data: { email, nome }
      })
      if (!res.ok) throw new Error("Erro ao atualizar perfil")
      return res.json()
    },
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso")
      window.location.reload()
    },
    onError: () => {
      toast.error("Erro ao atualizar perfil")
    }
  })

  const onSubmit = ({ email, nome }: FormData) => {
    mutate({ email, nome })
  }

  return (
    <DefaultLayout>
      <Link to="/" className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i> Voltar
      </Link>
      <h2>Perfil</h2>
      <div className="container mx-auto p-6 bg-white rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <div className="grid grid-cols-3 gap-2 w-full">
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
                label="Email"
                placeholder="Digite o email"
                error={errors.email}
                {...register("email")}
                className="w-full"
              />
              <Input
                label="CPF"
                value={user.cpf || "Este usuário não possui CPF cadastrado."}
                rows={1}
                readOnly
                disabled
                className="text-gray-500 italic opacity-50"
              />
              {user?.profile?.name === "analyst" &&
                user?.especialidade?.length > 0 && (
                  <Input
                    type="text"
                    label="Especialidade"
                    value={user.especialidade
                      .map((especialidade, index, array) => {
                        if (index === array.length - 1 && index > 0) {
                          return `e ${especialidade}`
                        }
                        return especialidade
                      })
                      .join(", ")}
                    className="w-full"
                  />
                )}
            </div>
          </div>
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
    </DefaultLayout>
  )
}

const PerfilPageWrapper = () => (
  <Suspense fallback={<div>Carregando...</div>}>
    <PerfilPage />
  </Suspense>
)

export default PerfilPageWrapper
