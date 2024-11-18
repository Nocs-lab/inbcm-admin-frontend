import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from "../../layouts/default";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import request from '../../utils/request';
import { Modal, Button } from 'react-dsgov';
// Definir tipos de dados para as respostas da API

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
  const response = await request('/api/admin/users');
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
  }
  catch (error) {
    throw new Error('Failed to parse JSON response');
  }
};

const Index: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const mutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await request(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
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


  return (
    <DefaultLayout>
      <div className="flex justify-between items-center mb-4">
        <h1>Usuários</h1>
        <div className="flex justify-end">

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
          <Modal title="Desativar usuário?" onClose={handleCloseModal}>
            <Modal.Body>
                Você tem certeza que deseja desativar este usuário?
            </Modal.Body>
            <Modal.Footer justify-content='end'>
                <Button secondary small m={2} onClick={handleCloseModal}>Cancelar</Button>
                <Button primary small m={2} onClick={handleDeleteUser}>Confirmar</Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </DefaultLayout>
  );
};

export default Index;
