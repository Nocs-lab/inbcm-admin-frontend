import React from 'react';

interface Profile {
  _id: string;
  name: string;
}

interface DeleteModalProps {
  profile: Profile;
  onCancel: () => void;
  onDelete: (profileId: string) => void;
}

const DeleteProfileModal: React.FC<DeleteModalProps> = ({ profile, onCancel, onDelete }) => {
  const handleDelete = () => {
    onDelete(profile._id); // Chama a função onDelete com o ID do perfil para realizar a exclusão
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md w-96">
      <h2 className="text-lg font-semibold mb-4">Excluir Perfil</h2>
      <p className="text-sm text-gray-700 mb-4">Tem certeza que deseja excluir o perfil <strong>{profile.name}</strong>?</p>
      <div className="flex justify-end">
        <button className="btn btn-red mr-2" onClick={handleDelete}>Excluir</button>
        <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
};

export default DeleteProfileModal;
