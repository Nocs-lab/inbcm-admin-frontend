import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DefaultLayout from "../../../layouts/default";
import { useMutation, useSuspenseQueries } from '@tanstack/react-query';
import Input from '../../../components/Input';
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import clsx from "clsx"
import { Link } from 'react-router-dom';
import request from '../../../utils/request';

const schema = z.object({
  email: z.string().min(1, "Este campo é obrigatório"),
  nome: z.string().min(1, "Este campo é obrigatório"),
  profile: z.string().min(1, "Este campo é obrigatório")
})
type FormData = z.infer<typeof schema>

interface Profile {
  _id: string;
  name: string;
  description: string;
}

const userById = async (id: string) => {
  const response = await request(`/api/user/${id}`);
  if (!response.ok) {
    throw new Error('usuario nao encontrado');
  }
  return response.json();
};

const fetchProfiles = async () => {
  const response = await fetch('/api/profiles'); // Endpoint para buscar os perfis
  if (!response.ok) {
    throw new Error('perfil nao encontrado');
  }
  return response.json();
};

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [{ data: user }, { data: profiles }] = useSuspenseQueries(
    {queries:
    [
    {
      queryKey: ['user', id],
      queryFn: () => userById(id!),
    },
    {
      queryKey: ['profiles'],
      queryFn: fetchProfiles,
    }
  ]
    }
);

  const {
    register,
    handleSubmit,
    formState: {errors ,isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      email: user.email,
      nome: user.nome,
      profile: user.profile
    }
  })


  const { mutate } = useMutation({
    mutationFn: async ({ email, nome, profile }: FormData) => {

      const res = await request(`/api/user/${id}`, {
        method: 'PUT',
        data: {
          email,
          nome,
          profile,
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

  const onSubmit = async ({ email, nome, profile }: FormData) => {

    mutate({ email, nome, profile })
  }

  return (
    <DefaultLayout>

      <div className="container mx-auto p-4">
        <h1>Editar Usuário</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-4 rounded-lg shadow-md max-w-md mx-auto">

            <Input
              type="text"
              label="Nome"
              error={errors.nome}
              {...register("nome")}

            />

            <Input
              type="email"
              label="Email"
              error={errors.email}
              {...register("email")}

            />



            <select
              title='Selecione um perfil'
              {...register("profile")}
              className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"
              required
            >
              <option value="">Selecione um perfil</option>
              {profiles.map(profile => (
                <option key={profile._id} value={profile._id}>{profile.name}</option>
              ))}
            </select>


          <div className="flex justify-end space-x-4 mt-6">
            <button
              className={clsx(
                "br-button block primary mt-3",
                isSubmitting && "loading"
              )}
              type="submit"
            >
              Salvar Alterações
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

export default EditUser;