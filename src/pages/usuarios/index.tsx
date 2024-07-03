import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from "../../layouts/default";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Definir tipos de dados para as respostas da API
interface Profile {
  _id: string;
  name: string;
  description: string;
}

interface User {
  _id: string;
  nome: string;
  email: string;
  profile?: {
    name: string;
  };
  ativo: boolean;
}

const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const Index: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: users, error, isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const mutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ativo: false }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });

  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string>('');

  const handleOpenModal = (userId: string) => {
    setUserIdToDelete(userId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setUserIdToDelete('');
  };

  const handleDeleteUser = async () => {
    try {
      await mutation.mutateAsync(userIdToDelete);
      setShowModal(false); // Fechar o modal após a exclusão
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      // Tratar erro aqui, se necessário
    }
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  return (
    <DefaultLayout>
      <div className="flex justify-between items-center mb-4">
        <h1>Gerência de Usuários</h1>
        <div className="flex justify-end">
          <input type="text" placeholder="Pesquisar Usuários" className="input mr-2" />
          <button className="btn flex gap-2" onClick={() => navigate('/usuarios/createuser')} aria-label="Criar novo usuário">
            <i className="fa-solid fa-user-plus"></i> Novo Usuário
          </button>
        </div>
      </div>
      <div className="flex">
        <table className="w-full">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user._id}>
                <td>{user.nome}</td>
                <td>{user.email}</td>
                <td>{user.profile?.name || 'Não especificado'}</td>
                <td>
                  <button className="btn text-blue-950" onClick={() => navigate(`/usuarios/${user._id}`)} aria-label="Editar usuário" title="Editar usuário">
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button className="btn text-red" onClick={() => handleOpenModal(user._id)} aria-label="Excluir usuário" title="Excluir usuário">
                    <i className="fa-solid fa-trash fa-fw"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Confirmação */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-md w-full">
            <p className="text-lg font-semibold">Desativar Usuário</p>
            <p className="text-sm mt-2">Tem certeza que deseja desativar este usuário?</p>
            <div className="mt-4 flex justify-end">
              <button className="btn mr-2" onClick={handleCloseModal}>
                Cancelar
              </button>
              <button className="btn text-red" onClick={handleDeleteUser}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default Index;
