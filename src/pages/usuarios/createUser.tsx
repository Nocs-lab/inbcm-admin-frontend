import React from "react"
import { useNavigate } from "react-router-dom"
import DefaultLayout from "../../layouts/default"
import { useMutation } from "@tanstack/react-query" //add useSuspenseQuery
import Input from "../../components/Input"
//import { Select } from 'react-dsgov';
import { z } from "zod"
import { useForm } from "react-hook-form" //add Controller
import { zodResolver } from "@hookform/resolvers/zod"
import clsx from "clsx"
import { Link } from "react-router-dom"
import request from "../../utils/request"
import toast from "react-hot-toast"

const schema = z.object({
  email: z.string().min(1, "Este campo é obrigatório"),
  nome: z.string().min(1, "Este campo é obrigatório"),
  //profile: z.string().min(1, "Este campo é obrigatório"),
  password: z.string().min(1, "Este campo é obrigatório")
})
type FormData = z.infer<typeof schema>

// interface Profile {
//   _id: string;
//   name: string;
//   description: string;
// }

const CreateUser: React.FC = () => {
  // const { data: profiles } = useSuspenseQuery<Profile[]>({
  //   queryKey: ['profiles'],
  //   queryFn: async () => {
  //     const response = await fetch('/api/admin/profile');
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch profiles');
  //     }
  //     return response.json();
  //   },
  // });
  const {
    register,
    handleSubmit,
    //control,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur"
  })

  const navigate = useNavigate()

  const { mutate } = useMutation({
    mutationFn: async ({ email, nome, password }: FormData) => {
      //add profile

      const res = await request("/api/admin/users", {
        method: "POST",
        data: {
          email,
          nome,
          //profile,
          senha: password
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

  const onSubmit = ({ email, nome, password }: FormData) => {
    //add profile

    mutate({ email, nome, password }) //add profile
  }

  // Transformar perfis em opções para o componente Select
  // const profileOptions = profiles.map(profile => ({
  //   label: profile.name,
  //   value: profile._id
  // }));

  return (
    <DefaultLayout>
      <div className="container mx-auto p-4">
        <h1>Criar usuário</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
          <div className="flex gap-2 w-full">
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
            <Input
              type="password"
              label="Senha"
              placeholder="Digite sua senha"
              error={errors.password}
              {...register("password")}
            />

            {/* <Controller
                    name="profile"
                    control={control}
                    render={({ field }) => (
                      <Select
                        id="select-simples"
                        placeholder="Selecione um perfil"
                        label="Perfil"
                        options={profileOptions}
                        {...field}
                      />
                    )}
                  /> */}
          </div>
          <div className="flex space-x-4 justify-end">
            <Link to={"/usuarios"} className="br-button secondary mt-5">
              Voltar
            </Link>
            <button
              className={clsx(
                "br-button primary mt-5",
                isSubmitting && "loading"
              )}
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
