import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from "../../layouts/default";
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Permission {
  _id: string;
  name: string;
}

interface Profile {
  name: string;
  description?: string;
  permissions: string[]; // Array de IDs de permissões
}

const CreateProfile: React.FC = () => {
  const [formData, setFormData] = useState<Profile>({ name: '', description: '', permissions: [] });
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Buscar permissões disponíveis ao carregar o componente
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch('/api/permissions');
        if (!response.ok) {
          throw new Error('Failed to fetch permissions');
        }
        const data = await response.json();
        setPermissions(data);
      } catch (error) {
        console.error('Erro ao buscar permissões:', error);
      }
    };

    fetchPermissions();
  }, []);

  const mutation = useMutation({
    mutationFn: async (newProfile: Profile) => {
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
    },
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

  return (
      <DefaultLayout>
        <div className="container mx-auto p-4">
        <h1>Criar Perfil</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">Nome</label>
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
            <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-2">Descrição</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="permissions" className="block text-gray-700 text-sm font-medium mb-2">Permissões</label>
            <select
              id="permissions"
              name="permissions"
              multiple
              value={formData.permissions}
              onChange={handlePermissionChange}
              required
              className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"
            >
              {permissions.map(permission => (
                <option key={permission._id} value={permission._id}>
                  {permission.name}
                </option>
              ))}
            </select>
            <p className="text-gray-500 text-sm mt-1">Mantenha pressionada a tecla Ctrl (ou Cmd) para selecionar múltiplas permissões.</p>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Criar
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






