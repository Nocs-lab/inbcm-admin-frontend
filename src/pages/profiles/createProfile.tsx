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
  name: z.string().min(1, "Este campo é obrigatório"),
  description: z.string(),
  permissions: z.array(z.string()).min(1, "Este campo é obrigatório"),
});
type FormData = z.infer<typeof schema>;
interface Permission {
  _id: string;
  name: string;
}

const CreateProfile: React.FC = () => {
  const { data: permissions } = useSuspenseQuery<Permission[]>({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await fetch('/api/permissions');
      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
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

  const {mutate} = useMutation({
    mutationFn: async ({ name, description, permissions }: FormData) => {

      const res = await request('/api/profile', {
        method: 'POST',
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

   // Transformar permissões em opções para o componente Select
   const permissionOptions = permissions.map(permission => ({
    label: permission.name,
    value: permission._id
  }));

  return (
    <DefaultLayout>
      <div className="container mx-auto p-4">
        <h1>Criar Perfil</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
            <Input
              type="text"
              label="Name"
              error={errors.name}
              {...register("name")}
              
            />

            <Input
              type="text"
              label="Description"
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
                onChange={(value:string ) => field.onChange(value)}
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
              Criar
            </button>
            <Link
                to={"/profiles"}
                className= "br-button block secondary mt-3">
                  Voltar
                  </Link>
              </div>
          </form>
        </div>
    </DefaultLayout>
  );
};
export default CreateProfile;
