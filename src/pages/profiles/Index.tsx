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

const fetchProfiles = async () => {
  const response = await fetch('/api/profiles');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const Index: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: profiles, error, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
  });

  const mutation = useMutation({
    mutationFn: async (profile: Profile) => {
      const response = await fetch(`/api/profile/${profile._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profiles']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const response = await fetch(`/api/profile/${profileId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
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

  const handleConfirmDeleteProfile = (profileId: string) => {
    deleteMutation.mutate(profileId);
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
              <th>Descrição</th>
              <th>Permissão</th>
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
