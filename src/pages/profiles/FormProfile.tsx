import React, { useState, useEffect } from 'react';

interface Profile {
  _id: number;
  name: string;
  description: string;
  permission: string[];
}

interface FormProfileProps {
  profile: Profile | null;
  action: 'create' | 'edit' | null;
  onClose: () => void;
  onSave: () => void;
}

const permissionsOptions = [
  'read',
  'write',
  'delete',
  'admin',
  // Adicione outras permissões conforme necessário
];

const FormProfile: React.FC<FormProfileProps> = ({ profile, action, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  useEffect(() => {
    if (profile && action === 'edit') {
      setFormData({
        name: profile.name,
        description: profile.description,
        permissions: profile.permission,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        permissions: [],
      });
    }
  }, [profile, action]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePermissionChange = (permission: string) => {
    setFormData((prevData) => {
      const permissions = prevData.permissions.includes(permission)
        ? prevData.permissions.filter((perm) => perm !== permission)
        : [...prevData.permissions, permission];
      return { ...prevData, permissions };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Chame a função de mutação para salvar os dados
    onSave();
    onClose();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-xl font-semibold mb-4">{action === 'create' ? 'Criar Novo Perfil' : 'Editar Perfil'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Nome: (obrigatório)
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Digite o nome"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Descrição: (opcional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Digite a descrição"
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Permissões: (obrigatório)
          </label>
          <div className="flex flex-col">
            {permissionsOptions.map((permission) => (
              <label key={permission} className="inline-flex items-center mt-2">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={formData.permissions.includes(permission)}
                  onChange={() => handlePermissionChange(permission)}
                />
                <span className="ml-2">{permission}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
        <button
            type="button"
            className="bg-gray-50 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-50 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormProfile;
