import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DefaultLayout from "../../../layouts/default";
import { useQuery } from '@tanstack/react-query';

interface User {
  _id: string;
  nome: string;
  email: string;
  profile?: string; // Alterado para armazenar apenas o ID do perfil
  ativo: boolean;
}

interface Profile {
  _id: string;
  name: string;
  description: string;
}

const fetchUserById = async (id: string) => {
  const response = await fetch(`/api/user/${id}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const fetchProfiles = async () => {
  const response = await fetch('/api/profiles'); // Endpoint para buscar os perfis
  if (!response.ok) {
    throw new Error('Failed to fetch profiles');
  }
  return response.json();
};

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // Hook para navegar entre rotas
  const { data: user, error, isLoading, refetch } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUserById(id!),
  });

  const [editedUser, setEditedUser] = useState<User>({
    _id: '',
    nome: '',
    email: '',
    profile: '', // Inicialmente vazio até carregar dados
    ativo: false,
  });

  const [profiles, setProfiles] = useState<Profile[]>([]); // Estado para armazenar os perfis

  // Buscar perfis disponíveis ao carregar o componente
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userData = await fetchUserById(id!);
        setEditedUser(userData);

        const profilesData = await fetchProfiles();
        setProfiles(profilesData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        // Tratar erro aqui, se necessário
      }
    };

    fetchInitialData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditedUser(prevUser => ({
      ...prevUser,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/user/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedUser),
      });
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      // Atualiza os dados do usuário após a alteração
      await refetch();
      // Redireciona de volta para a página de usuários
      navigate('/usuarios');
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleCancel = () => {
    // Navega de volta para a página de usuários ao clicar em Cancelar
    navigate('/usuarios');
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <DefaultLayout>

      <div className="container mx-auto p-4">
        <h1>Editar Usuário</h1>
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md max-w-md mx-auto">
          <div className="mb-4">
            <label htmlFor="nome" className="block text-gray-700 text-sm font-medium mb-2">Nome</label>
            <input
              type="text"
              id="nome"
              value={editedUser.nome}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={editedUser.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="profile" className="block text-gray-700 text-sm font-medium mb-2">Perfil</label>
            <select
              id="profile"
              value={editedUser.profile || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"
              required
            >
              <option value="">Selecione um perfil</option>
              {profiles.map(profile => (
                <option key={profile._id} value={profile._id}>{profile.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Salvar Alterações
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

    </DefaultLayout>
  );
};

export default EditUser;
