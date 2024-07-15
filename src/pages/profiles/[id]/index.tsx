import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DefaultLayout from "../../../layouts/default";
import { useMutation, useSuspenseQueries } from '@tanstack/react-query';
import Input from '../../../components/Input';
import { Select } from 'react-dsgov';
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
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
    let errorMessage = 'Perfil não encontrado';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Se a resposta não for JSON, mantenha a mensagem de erro padrão
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error('Falha ao analisar a resposta JSON');
  }
};

const fetchPermissions = async () => {
  const response = await fetch('/api/permissions');
  if (!response.ok) {
   let errorMessage = 'Permissões não encontradas';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Se a resposta não for JSON, mantenha a mensagem de erro padrão
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch {
    throw new Error('Falha ao analisar a resposta JSON');
  }
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
    control,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      name: profile?.name,
      description: profile?.description,
      permissions: profile?.permissions.map((permission: Permission) => permission._id)
    }
  })
  const navigate = useNavigate()

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

  const onSubmit = ({ name, description, permissions }: FormData) => {

    mutate({ name, description, permissions })
  }

   // Transformar permissões em opções para o componente Select
   const permissionOptions = permissions.map((permission: Permission) => ({
    label: permission.name,
    value: permission._id
  }));

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

          <Controller
            name="permissions"
            control={control}
            render={({ field }) => (
              <Select
                id="select-multiplo"
                placeholder="Selecione..."
                label="Permissões"
                type="multiple"
                value={field.value}
                onChange={(value:string[] ) => field.onChange(value)}
                options={permissionOptions}
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
