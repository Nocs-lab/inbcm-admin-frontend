import React, { useState, useEffect } from 'react';

interface Profile {
  _id?: string;
  name: string;
  description: string;
}

interface FormProfileProps {
  profile: Profile | null;
  action: 'create' | 'edit' | 'view';
  onClose: () => void;
  onSave: (profile: Profile) => void;
}

const FormProfile: React.FC<FormProfileProps> = ({ profile, action, onClose, onSave }) => {
  const [profileData, setProfileData] = useState<Profile>({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (profile) {
      setProfileData(profile);
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profileData);
    onClose();
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md w-96">
      <h2 className="text-lg font-semibold mb-4">
        {action === 'create' && 'Novo Perfil'}
        {action === 'edit' && 'Editar Perfil'}
        {action === 'view' && 'Visualizar Perfil'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
          <input type="text" id="name" name="name" value={profileData.name} onChange={handleChange} className="input w-full" required={action !== 'view'} readOnly={action === 'view'} />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrições</label>
          <select id="description" name="description" multiple value={profileData.description} onChange={handlePermissionsChange} className="input w-full" required={action !== 'view'} disabled={action === 'view'}>
            <option value="getProfiles">Ver Perfis</option>
            <option value="getProfileById">Ver Perfil por ID</option>
            <option value="createProfile">Criar Perfil</option>
            <option value="updateProfile">Atualizar Perfil</option>
            <option value="deleteProfile">Deletar Perfil</option>
          </select>
        </div>
        {action !== 'view' && (
          <div className="flex justify-end">
            <button type="submit" className="btn mr-2">{action === 'edit' ? 'Atualizar' : 'Salvar'}</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          </div>
        )}
        {action === 'view' && (
          <div className="flex justify-end">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Sair</button>
          </div>
        )}
      </form>
    </div>
  );
};

export default FormProfile;
