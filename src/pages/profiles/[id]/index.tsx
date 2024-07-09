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
  name: z.string().min(1, "Este campo é obrigatório"),
  description: z.string(),
  permissions: z.array(z.string()).min(1, "Este campo é obrigatório"),
})
type FormData = z.infer<typeof schema>

interface Permission {
  _id: string;
  name: string;
}

const profileById = async (id: string) => {
  const response = await fetch(`/api/profile/${id}`);
  if (!response.ok) {
    throw new Error('perfil nao encontrado');
  }
  return response.json();
};

const fetchPermissions = async () => {
  const response = await fetch('/api/permissions');
  if (!response.ok) {
    throw new Error('permissao nao encontrada');
  }
  return response.json();
};

const EditProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [{ data: profile }, { data: permissions }] = useSuspenseQueries(
    {queries:
    [
    {
      queryKey: ['profile', id],
      queryFn: () => profileById(id!),
    },
    {
      queryKey: ['permissions'],
      queryFn: fetchPermissions,
    }
  ]
    }
);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      name: profile?.name,
      description: profile?.description,
      permissions: profile?.permissions.map(permission => permission._id)
    }
  })

  const {mutate} = useMutation({
    mutationFn: async ({ name, description, permissions }: FormData) => {

      const res = await request(`/api/profile/${id}`, {
        method: 'PUT',
        data: {
          name,
          description,
          permissions,
        }
      })
      return res.json()
    },
    onSuccess: () => {

      navigate("/profiles")
    }
  })

  const navigate = useNavigate()

  const onSubmit = async ({ name, description, permissions }: FormData) => {

    mutate({ name, description, permissions })
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto p-4">
        <h1>Editar Perfil</h1>
        <form  onSubmit={handleSubmit(onSubmit)}  className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">

            <Input
              type="text"
              label="Nome"
              error={errors.name}
              {...register("name")}
            />
            <Input
              type="text"
              label="Descrição"
              error={errors.description}
              {...register("description")}
            />

            <select
              title='selecione as permissões'
              multiple
              {...register("permissions")}
              required
              className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"
            >
              {permissions.map(permission => (
                <option key={permission._id} value={permission._id}>
                  {permission.name}
                </option>
              ))}
            </select>
            <p className="text-gray-500 text-sm mt-1">Mantenha pressionada a tecla Ctrl (ou Cmd) para selecionar múltiplas permissões.</p>
          
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

export default EditProfile;
