import React, { useState, useEffect } from 'react';
import DefaultLayout from "../../layouts/default";
import { NotePencil, TrashSimple, UserPlus,  /*Eye*/ } from "@phosphor-icons/react";
import FormUser from "./FormUser";
import DeleteUserModal from "./DeleteUserModal";

interface User {
  id: number;
  name: string;
  email: string;
  admin: boolean;
  profile: string;
  museus: string[]; // Alterado para array de strings para múltiplos museus
  active: boolean;
}

const Index: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalAction, setModalAction] = useState<'create' | 'edit' | 'view' | 'delete' | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    const mockUsers: User[] = [
      { id: 1, name: "João", email: "joao@example.com", museus: ["Museu A"], admin: true, profile: "Admin", active: true },
      { id: 2, name: "Maria", email: "maria@example.com", museus: ["Museu B", "Museu C"], admin: false, profile: "Regular", active: false }
    ];
    setUsers(mockUsers);
  };

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

 /* const handleViewUser = (user: User) => {
    setModalAction('view');
    setSelectedUser(user);
    setIsModalOpen(true);
  };*/

  const handleSaveUser = () => {
    fetchUsers(); // Atualiza a lista de usuários após salvar ou atualizar
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setModalAction('delete');
    setIsModalOpen(true);
  };

  const handleConfirmDeleteUser = (userId: number) => {
    // Implemente a lógica para deletar o usuário com o userId informado
    console.log(`Usuário com ID ${userId} deletado`);
    // Aqui você pode implementar a lógica para deletar o usuário na sua API ou no estado local
    setIsModalOpen(false);
  };

  return (
    <DefaultLayout>
      <div className={`flex justify-between items-center mb-4 ${isModalOpen ? 'pointer-events-none opacity-50' : ''}`}>
        <h1>Perfis</h1>
        <div className="flex justify-end">
          <input type="text" placeholder="Pesquisar usuários" className="input mr-2" />
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
              <th>Museus</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.admin ? 'Sim' : 'Não'}</td>
                <td>{user.profile}</td>
                <td>{user.museus.join(', ')}</td> {/* Mostra os museus separados por vírgula */}
                <td>{user.active ? 'Ativo' : 'Inativo'}</td>
                <td>
                  <button className="btn text-blue-950" onClick={() => handleEditUser(user)}><NotePencil size={22} /></button>
                  <button className="btn text-red" onClick={() => handleDeleteUser(user)}><TrashSimple size={22} /></button>
                  {/*<button className="btn text-blue-950 ml-2" onClick={() => handleViewUser(user)}><Eye size={22} /></button>*/}
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
