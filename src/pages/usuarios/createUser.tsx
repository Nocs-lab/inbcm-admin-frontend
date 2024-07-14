import React from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from "../../layouts/default";
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import Input from '../../components/Input';
import { Select } from 'react-dsgov';
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import clsx from "clsx"
import { Link } from 'react-router-dom';
import request from '../../utils/request';

const schema = z.object({
  email: z.string().min(1, "Este campo é obrigatório"),
  nome: z.string().min(1, "Este campo é obrigatório"),
  profile: z.string().min(1, "Este campo é obrigatório"),
  password: z.string().min(1, "Este campo é obrigatório")
})
type FormData = z.infer<typeof schema>

interface Profile {
  _id: string;
  name: string;
  description: string;
}

const CreateUser: React.FC = () => {
  const { data: profiles } = useSuspenseQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const response = await fetch('/api/profiles');
      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }
      return response.json();
    },
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur"
  })

  const { mutate } = useMutation({
    mutationFn: async ({ email, nome, profile, password }: FormData) => {

      const res = await request('/api/user', {
        method: 'POST',
        data: {
          email,
          nome,
          profile,
          senha: password,
          museus: []
        }
      })

      return await res.json()
    },
    onSuccess: () => {

      navigate("/usuarios")
    }
  })

  const navigate = useNavigate()

  const onSubmit = async ({ email, nome, profile, password }: FormData) => {

    mutate({ email, nome, profile, password })
  }

    // Transformar perfis em opções para o componente Select
    const profileOptions = profiles.map(profile => ({
      label: profile.name,
      value: profile._id
    }));


  return (
    <DefaultLayout>
      <div className="container mx-auto p-4">
        <h1>Criar Usuário</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-4 rounded-lg shadow-md max-w-md mx-auto">
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

                <Controller
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
                />


              <div className="flex justify-end space-x-4 mt-6">
              <button
                className={clsx(
                  "br-button block primary mt-3",
                  isSubmitting && "loading"
                )}
                type="submit"
              >
                Criar
              </button>
                <Link
                to={"/usuarios"}
                className= "br-button block secondary mt-3">
                  Voltar
                </Link>
              </div>
          </form>
      </div>
    </DefaultLayout>
  );
};

export default CreateUser;
