import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from "../../layouts/default";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import request from '../../utils/request';
import clsx from 'clsx';

interface Profile {
  _id: string;
  name: string;
  description?: string;
  permissions: object[];
}

const fetchProfiles = async (): Promise<Profile[]> => {
  const response = await request('/api/profiles');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const Index: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: profiles } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
  });

  const deleteMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const response = await request(`/api/profile/${profileId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profiles']);
    },
  });

  const [showModal, setShowModal] = useState(false);
  const [profileIdToDelete, setProfileIdToDelete] = useState<string>('');

  const handleOpenModal = (profileId: string) => {
    setProfileIdToDelete(profileId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setProfileIdToDelete('');
  };

  const handleDeleteProfile = async () => {
    try {
      await deleteMutation.mutateAsync(profileIdToDelete);
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao deletar perfil:', error);
    }
  };


  return (
    <DefaultLayout>
      <div className="flex justify-between items-center mb-4">
        <h1>Perfil de Usuários</h1>
        <div className="flex justify-end">
          <input type="text" placeholder="Pesquisar Perfis" className="input mr-2" />
          <button className="btn flex gap-2" onClick={() => navigate('/profiles/createprofile')}>
             <i className="fa-solid fa-user-tie"></i> Novo Perfil
          </button>
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
                  <td>{profile.name}</td>
                  <td>{profile.description || 'Não especificado'}</td>
                  <td>{profile.permissions.map(
                    (permission) => permission.name).join(', ')}</td>
                  <td>
                    <button
                      className="btn text-blue-950"
                      onClick={() => navigate(`/profiles/${profile._id}`)}
                      aria-label="Editar perfil"
                      title="Editar perfil"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button
                      className={clsx("btn text-red-500", deleteMutation.isPending && 'loading')}
                      onClick={() => handleOpenModal(profile._id)}
                      aria-label="Excluir perfil"
                      title="Excluir perfil"

                    >
                      <i data-fa-symbol="delete" className="fa-solid fa-trash fa-fw"></i>
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
            <p className="text-lg font-semibold">Excluir Perfil</p>
            <p className="text-sm mt-2">Tem certeza que deseja excluir este perfil?</p>
            <div className="mt-4 flex justify-end">
              <button className="btn mr-2" onClick={handleCloseModal}>
                Cancelar
              </button>
              <button className="btn text-red" onClick={handleDeleteProfile}>
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
