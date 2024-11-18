import React from 'react';
import { useParams, Link } from 'react-router-dom';
import DefaultLayout from "../../../layouts/default";
import { useSuspenseQueries } from '@tanstack/react-query';
import request from '../../../utils/request';

interface User {
  _id: string;
  nome: string;
  email: string;
  museus: { nome: string }[]; // Supondo que seja uma lista de objetos com nome.
  profile?: { name: string };
}

const userById = async (id: string): Promise<User> => {
  const response = await request(`/api/admin/users/${id}`);
  if (!response.ok) {
    let errorMessage = 'Usuário não encontrado';
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

const ViewUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [{ data: user }] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['user', id],
        queryFn: () => userById(id!),
      },
    ],
  });

  return (
    <DefaultLayout>
      <div className="container mx-auto p-4">
        <h1>Detalhes do Usuário</h1>
        <table className="table-auto w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-center">Nome</th>
              <th className="border px-4 py-2 text-center">Email</th>
              <th className="border px-4 py-2 text-center">Museus Vinculados</th>
              <th className="border px-4 py-2 text-center">Perfil</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2 text-center">{user.nome}</td>
              <td className="border px-4 py-2 text-center">{user.email}</td>
              <td className="border px-4 py-2 text-center">
                {user.museus.length > 0
                  ? user.museus.map((museu) => museu.nome).join(', ')
                  : 'Nenhum'}
              </td>
              <td className="border px-4 py-2 text-center">
                {user.profile?.name || 'Não especificado'}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end space-x-4 mt-6">
          <Link to={`/usuarios/${user._id}/editar`} className="br-button block secondary mt-3">
            Editar usuário
          </Link>
          <Link to="/usuarios" className="br-button block secondary mt-3">
            Voltar
          </Link>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ViewUser;
