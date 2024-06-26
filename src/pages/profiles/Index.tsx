import React, { useState } from 'react';
import DefaultLayout from "../../layouts/default";
import { NotePencil, TrashSimple, UserPlus } from "@phosphor-icons/react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FormUser from "./FormUser";
import DeleteUserModal from "./DeleteUserModal";

interface User {
  id: number;
  name: string;
  email: string;
  admin: boolean;
  profile: string;
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
        method: user.id ? 'PUT' : 'POST',
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

  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
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
  const [modalAction, setModalAction] = useState<'create' | 'edit' | 'view' | 'delete' | null>(null);

  const handleOpenModal = (action: 'create' | 'edit') => {
    setModalAction(action);
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setModalAction('edit');
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalAction(null);
  };

  const handleSaveUser = () => {
    fetchUsers(); // Atualiza a lista de usuários após salvar ou atualizar
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setModalAction('delete');
    setIsModalOpen(true);
  };

  const handleConfirmDeleteUser = (userId: number) => {
    deleteMutation.mutate(userId);
    setIsModalOpen(false);
  };

  return (
    <DefaultLayout>
      <div className={`flex justify-between items-center mb-4 ${isModalOpen ? 'pointer-events-none opacity-50' : ''}`}>
        <h1>Perfis</h1>
        <div className="flex justify-end">
          <input type="text" placeholder="Pesquisar perfis" className="input mr-2" />
          <button className="btn flex gap-2" onClick={() => handleOpenModal('create')}><UserPlus size={25} />Novo Perfil</button>
        </div>
      </div>
      <div className="flex">
        <table className="w-full">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Admin</th>
              <th>Profile</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.admin ? 'Sim' : 'Não'}</td>
                <td>{user.profile}</td>
                <td>{user.active ? 'Ativo' : 'Inativo'}</td>
                <td>
                  <button className="btn text-blue-950" onClick={() => handleEditUser(user)}><NotePencil size={22} /></button>
                  <button className="btn text-red" onClick={() => handleDeleteUser(user)}><TrashSimple size={22} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center bg-gray-800 bg-opacity-75">
          {modalAction !== 'delete' ? (
            <FormUser user={selectedUser} action={modalAction} onClose={handleCloseModal} onSave={handleSaveUser} />
          ) : (
            <DeleteUserModal user={selectedUser} onCancel={handleCloseModal} onDelete={handleConfirmDeleteUser} />
          )}
        </div>
      )}
    </DefaultLayout>
  );
};

export default Index;
