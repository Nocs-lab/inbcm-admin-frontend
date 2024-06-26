port React from 'react';

interface DeleteUserModalProps {
  user: User;
  onCancel: () => void;
  onDelete: (userId: number) => void;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ user, onCancel, onDelete }) => {
  const handleDelete = () => {
    onDelete(user.id); // Chama a função onDelete com o ID do usuário para realizar a exclusão
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md w-96">
      <h2 className="text-lg font-semibold mb-4">Excluir Usuário</h2>
      <p className="text-sm text-gray-700 mb-4">Tem certeza que deseja excluir o usuário <strong>{user.name}</strong>?</p>
      <div className="flex justify-end">
        <button className="btn btn-red mr-2" onClick={handleDelete}>Excluir</button>
        <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
};

export default DeleteUserModal;
