import React, { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DefaultLayout from "../../../layouts/default"
import { useMutation, useSuspenseQueries } from "@tanstack/react-query"
import Input from "../../../components/Input"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import clsx from "clsx"
import { Link } from "react-router-dom"
import request from "../../../utils/request"
import { Textarea } from "react-dsgov"
import toast from "react-hot-toast"

const schema = z.object({
  email: z.string().min(1, "Este campo é obrigatório"),
  nome: z.string().min(1, "Este campo é obrigatório")
})
type FormData = z.infer<typeof schema>

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
  const { id } = useParams<{ id: string }>()
  const [{ data: user }] = useSuspenseQueries({
    queries: [{ queryKey: ["user", id], queryFn: () => userById(id!) }]
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      email: user?.email,
      nome: user?.nome
    }
  })

  const navigate = useNavigate()

  const { mutate } = useMutation({
    mutationFn: async ({ email, nome }: FormData) => {
      const res = await request(`/api/admin/users/${id}`, {
        method: "PUT",
        data: { email, nome }
      })
      return await res.json()
    },
    onSuccess: () => {
      navigate("/usuarios")
      toast.success("Usuário atualizado com sucesso")
    },
    onError: () => {
      toast.error("Erro ao atualizar usuário")
    }
  })
  const onSubmit = ({ email, nome }: FormData) => {
    mutate({ email, nome })
  }

  useEffect(() => {
    if (user) {
      console.log("Dados do usuário:", user)
    }
  }, [user])

  if (!user) {
    return <div>Carregando...</div> // Exibe uma mensagem enquanto os dados não estão disponíveis
  }

  const profileTranslations: Record<string, string> = {
    admin: "Administrador",
    analyst: "Analista",
    declarant: "Declarante"
  }

  return (
    <DefaultLayout>
      <Link to="/usuarios" className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
      <h1>Editar usuário</h1>
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
                label="Perfil"
                className=""
                value={
                  user.profile?.name
                    ? profileTranslations[user.profile.name] ||
                      user.profile.name
                    : "Perfil não encontrado"
                }
                rows={1}
                readOnly
              />
              <Textarea
                label="Museus"
                className="col-span-4"
                value={
                  user.museus && user.museus.length > 0
                    ? user.museus
                        .map((museu: { nome: string }) => `- ${museu.nome}`)
                        .join("\n")
                    : "Nenhum museu associado"
                }
                rows={5}
                readOnly
              />
            </div>
          </div>
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
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  )
}

export default EditUser
