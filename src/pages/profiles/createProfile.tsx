import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from "../../layouts/default";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Permission {
  _id: string;
  name: string;
}

interface Profile {
  name: string;
  description?: string;
  permissions: string[]; // Array de IDs de permissões
}

const fetchPermissions = async (): Promise<Permission[]> => {
  const response = await fetch('/api/permissions');
  if (!response.ok) {
    throw new Error('Failed to fetch permissions');
  }
  return response.json();
};

const createProfile = async (newProfile: Profile): Promise<Profile> => {
  const response = await fetch('/api/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newProfile),
  });
  if (!response.ok) {
    throw new Error('Failed to create profile');
  }
  return response.json();
};

const CreateProfile: React.FC = () => {
  const [formData, setFormData] = useState<Profile>({ name: '', description: '', permissions: [] });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: permissions, isLoading, isError } = useQuery({
    queryKey: ['permissions'],
    queryFn: fetchPermissions,
  });

  const mutation = useMutation({
    mutationFn: createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['profiles']);
      navigate('/profiles');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync(formData);
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPermissions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prevState => ({
      ...prevState,
      permissions: selectedPermissions,
    }));
  };

  const handleCancel = () => {
    navigate('/profiles');
  };

  if (isLoading) {
    return <div>Carregando permissões...</div>;
  }

  if (isError) {
    return <div>Erro ao carregar permissões</div>;
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto p-4">
        <h1>Criar Perfil</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2"><i className="fa-solid fa-user"></i> Nome</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-2"><i className="fa-solid fa-comment"></i> Descrição</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="permissions" className="block text-gray-700 text-sm font-medium mb-2"><i className="fa-solid fa-lock-open"></i> Permissões</label>
            <select
              id="permissions"
              name="permissions"
              multiple
              value={formData.permissions}
              onChange={handlePermissionChange}
              required
              className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"
            >
              {permissions!.map(permission => (
                <option key={permission._id} value={permission._id}>
                  {permission.name}
                </option>
              ))}
            </select>
            <p className="text-gray-500 text-sm mt-1">Mantenha pressionada a tecla Ctrl (ou Cmd) para selecionar múltiplas permissões.</p>
          </div>

          {mutation.isError && (
            <div className="text-red-500 mb-4">
              Erro ao criar perfil: {(mutation.error as Error).message}
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={mutation.isLoading}
            >
              {mutation.isLoading ? 'Criando...' : 'Criar'}
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

export default CreateProfile;
