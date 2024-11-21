import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DefaultLayout from "../../../layouts/default";
import { useMutation, useSuspenseQueries } from '@tanstack/react-query';
import Input from '../../../components/Input';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { Link } from 'react-router-dom';
import request from '../../../utils/request';
import { Textarea } from 'react-dsgov';
import toast from "react-hot-toast"

const schema = z.object({
  email: z.string().min(1, "Este campo é obrigatório"),
  nome: z.string().min(1, "Este campo é obrigatório"),
});
type FormData = z.infer<typeof schema>;

const userById = async (id: string) => {
  const response = await request(`/api/admin/users/${id}`);
  if (!response.ok) {
    let errorMessage = 'Usuário não encontrado';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      throw new Error(errorMessage);
    }
  }
  return await response.json();
};

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [{ data: user }] = useSuspenseQueries({
    queries: [
      { queryKey: ['user', id], queryFn: () => userById(id!) },
    ],
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      email: user?.email,
      nome: user?.nome,
    },
  });

  const navigate = useNavigate();

  const { mutate } = useMutation({
    mutationFn: async ({ email, nome }: FormData) => {
      const res = await request(`/api/admin/users/${id}`, {
        method: 'PUT',
        data: { email, nome },
      });
      return await res.json();
    },
    onSuccess: () => {
      navigate("/usuarios");
      toast.success("Usuário atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar usuário");
    },
  });

  const onSubmit = ({ email, nome }: FormData) => {
    mutate({ email, nome });
  };

  useEffect(() => {
    if (user) {
      console.log("Dados do usuário:", user);
    }
  }, [user]);

  if (!user) {
    return <div>Carregando...</div>; // Exibe uma mensagem enquanto os dados não estão disponíveis
  }

  const profileTranslations: Record<string, string> = {
    admin: "Administrador",
    analyst: "Analista",
    declarant: "Declarante",
  };


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

          <Textarea
            label={"Perfil"}
            value={user.profile?.name ? profileTranslations[user.profile.name] || user.profile.name : "Perfil não encontrado"}
            className="w-full"
          />


          <Textarea
            label={"Museus"}
            value={user.museus && user.museus.length > 0 ? user.museus.map((museu: { nome: string }) => `- ${museu.nome}`).join("\n") : "Nenhum museu associado"}
            className="w-full"
            rows={5}
          />

          <div className="flex justify-end space-x-4 mt-6">
            <button
              className={clsx("br-button block primary mt-3", isSubmitting && "loading")}
              type="submit"
            >
              Salvar Alterações
            </button>
            <Link to={"/usuarios"} className="br-button block secondary mt-3">
              Voltar
            </Link>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default EditUser;
