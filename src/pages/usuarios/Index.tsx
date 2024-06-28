import React, { useState } from 'react';
import DefaultLayout from "../../layouts/default";
import { NotePencil } from "@phosphor-icons/react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FormUser from "./FormUser";

interface User {
  id: number;
  nome: string;
  email: string;
  profile?: {
    name: string;
  };
  active: boolean;
}

const fetchUsers = async () => {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const Index: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: users, error, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const mutation = useMutation({
    mutationFn: async (user: User) => {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalAction, setModalAction] = useState<'edit' | 'view' | null>(null);

  const handleEditUser = (user: User) => {
    setModalAction('edit');
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalAction(null);
  };

  const handleSaveUser = (user: User) => {
    mutation.mutate(user); // Salva ou atualiza o usuário
  };

  return (
    <DefaultLayout>
      <div className={`flex justify-between items-center mb-4 ${isModalOpen ? 'pointer-events-none opacity-50' : ''}`}>
        <h1>Gerência de Usuários</h1>
        <div className="flex justify-end">
          <input type="text" placeholder="Pesquisar Usuários" className="input mr-2" />
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
              <tr key={user.id}>
                <td>{user.nome}</td>
                <td>{user.email}</td>
                <td>{user.profile?.name || 'Não especificado'}</td>
                <td>
                  <button className="btn text-blue-950" onClick={() => handleEditUser(user)}><NotePencil size={22} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center bg-gray-800 bg-opacity-75">
          <FormUser user={selectedUser} action={modalAction} onClose={handleCloseModal} onSave={handleSaveUser} />
        </div>
      )}
    </DefaultLayout>
  );
};

export default Index;
