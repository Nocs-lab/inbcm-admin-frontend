import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DefaultLayout from "../../../layouts/default";
import { useQuery } from '@tanstack/react-query';

interface Permission {
  _id: string;
  name: string;
}

interface Profile {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
}

const fetchProfileById = async (id: string) => {
  const response = await fetch(`/api/profile/${id}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const fetchPermissions = async () => {
  const response = await fetch('/api/permissions');
  if (!response.ok) {
    throw new Error('Failed to fetch permissions');
  }
  return response.json();
};

const EditProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: profile, error, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => fetchProfileById(id!)
  });

  const { data: permissions, error: permissionsError, isLoading: permissionsLoading } = useQuery<Permission[]>({
    queryKey: ['permissions'],
    queryFn: fetchPermissions
  });

  const [editedProfile, setEditedProfile] = useState<Profile>({
    _id: '',
    name: '',
    description: '',
    permissions: [],
  });

  useEffect(() => {
    if (profile) {
      setEditedProfile(profile);
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prevProfile => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPermissions = Array.from(e.target.selectedOptions, option => option.value);
    setEditedProfile(prevProfile => ({
      ...prevProfile,
      permissions: selectedPermissions,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/profile/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedProfile),
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      navigate('/profiles');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    navigate('/profiles');
  };

  if (isLoading || permissionsLoading) return <div>Loading...</div>;
  if (error || permissionsError) return <div>Error: {error?.message || permissionsError?.message}</div>;

  return (
    <DefaultLayout>
      <div className="container mx-auto p-4">
        <h1>Editar Perfil</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
          <div className="mb-4">
            <label htmlFor="name" className="block text-blue-700 mb-2"><i className="fa-solid fa-user"></i> Nome</label>
            <input
              type="text"
              id="name"
              name="name"
              value={editedProfile.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-blue-700 mb-2"><i className="fa-solid fa-comment"></i> Descrição</label>
            <textarea
              id="description"
              name="description"
              value={editedProfile.description || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="permissions" className="block text-gray-700 mb-2"><i className="fa-solid fa-lock-open"></i> Permissões</label>
            <select
              id="permissions"
              name="permissions"
              multiple
              value={editedProfile.permissions}
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

export default EditProfile;
