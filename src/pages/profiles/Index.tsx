import React, { useState } from 'react';
import DefaultLayout from "../../layouts/default";
import { NotePencil, TrashSimple, UserPlus } from "@phosphor-icons/react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FormProfile from "./FormProfile";
import DeleteProfileModal from "./DeleteProfileModal";

interface Profile {
  _id: number;
  name: string;
  description: string;
  permission: string[];
}

// Mock data
const mockProfiles: Profile[] = [
  { _id: 1, name: "Administrador", description: "Administrador do sistema", permission: ["Gerenciar Usuários", "Gerenciar Perfis", "Modificar Declarações"] },
  { _id: 2, name: "Declarante", description: "Declarante", permission: ["Criar Declaração"] },
  { _id: 3, name: "Analista", description: "Analista técnico", permission: ["Analisar Declarações", "Modificar Declarações"] }
];

const fetchProfiles = async () => {
  // Simulating a delay
  return new Promise<Profile[]>((resolve) => {
    setTimeout(() => {
      resolve(mockProfiles);
    }, 500);
  });
};

const Index: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: profiles, error, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
  });

  const mutation = useMutation({
    mutationFn: async (profile: Profile) => {
      // Mock updating a profile
      const updatedProfiles = mockProfiles.map(p => p._id === profile._id ? profile : p);
      return new Promise<Profile[]>((resolve) => {
        setTimeout(() => {
          resolve(updatedProfiles);
        }, 500);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profiles']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (profileId: number) => {
      // Mock deleting a profile
      const updatedProfiles = mockProfiles.filter(p => p._id !== profileId);
      return new Promise<Profile[]>((resolve) => {
        setTimeout(() => {
          resolve(updatedProfiles);
        }, 500);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profiles']);
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [modalAction, setModalAction] = useState<'create' | 'edit' | 'delete' | null>(null);

  const handleOpenModal = (action: 'create' | 'edit') => {
    setModalAction(action);
    setSelectedProfile(null);
    setIsModalOpen(true);
  };

  const handleEditProfile = (profile: Profile) => {
    setModalAction('edit');
    setSelectedProfile(profile);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalAction(null);
  };

  const handleSaveProfile = () => {
    fetchProfiles(); // Atualiza a lista de perfis após salvar ou atualizar
  };

  const handleDeleteProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setModalAction('delete');
    setIsModalOpen(true);
  };

  const handleConfirmDeleteProfile = (profileId: number) => {
    deleteMutation.mutate(profileId);
    setIsModalOpen(false);
  };

  return (
    <DefaultLayout>
      <div className={`flex justify-between items-center mb-4 ${isModalOpen ? 'pointer-events-none opacity-50' : ''}`}>
        <h1>Gerência de perfil</h1>
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
              <th>Descrição</th>
              <th>Permissões</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map((profile: Profile) => (
              <tr key={profile._id}>
                <td>{profile?.name}</td>
                <td>{profile?.description}</td>
                <td>{profile?.permission.join(', ')}</td>
                <td>
                  <button className="btn text-blue-950" onClick={() => handleEditProfile(profile)}><NotePencil size={22} /></button>
                  <button className="btn text-red" onClick={() => handleDeleteProfile(profile)}><TrashSimple size={22} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center bg-gray-800 bg-opacity-75">
          {modalAction !== 'delete' ? (
            <FormProfile profile={selectedProfile} action={modalAction} onClose={handleCloseModal} onSave={handleSaveProfile} />
          ) : (
            <DeleteProfileModal profile={selectedProfile} onCancel={handleCloseModal} onDelete={handleConfirmDeleteProfile} />
          )}
        </div>
      )}
    </DefaultLayout>
  );
};

export default Index;
