import React, { useState, useEffect } from 'react';

interface User {
  id?: number; // ID será gerado pelo backend
  nome: string;
  email: string;
  profile?: {
    name: string;
  };
  active: boolean;
}

interface FormUserProps {
  user: User | null;
  action: 'edit' | 'view'; // Ação a ser realizada: editar ou visualizar
  onClose: () => void;
  onSave: (user: User) => void; // Função para salvar usuário no banco de dados
}

const FormUser: React.FC<FormUserProps> = ({ user, action, onClose, onSave }) => {
  const [userData, setUserData] = useState<User>({
    nome: '',
    email: '',
    profile: { name: '' }, // Inicialize profile como um objeto vazio com name
    active: true, // Novo usuário sempre começa ativo
  });

  useEffect(() => {
    if (user) {
      setUserData(user); // Preenche o formulário se um usuário existente for passado
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(userData); // Chama a função onSave para atualizar a lista de usuários
    onClose();
  };

  // Garante que userData.active seja inicializado antes de acessar .toString()
  const activeValue = userData.active !== undefined ? userData.active.toString() : '';

  return (
    <div className="bg-white p-4 rounded-md shadow-md w-96">
      <h2 className="text-lg font-semibold mb-4">
        {action === 'edit' && 'Editar Usuário'}
        {action === 'view' && 'Visualizar Usuário'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={userData.nome}
            onChange={(e) => setUserData(prevState => ({ ...prevState, nome: e.target.value }))}
            className="input w-full"
            required={action !== 'view'}
            readOnly={action === 'view'}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            value={userData.email}
            onChange={(e) => setUserData(prevState => ({ ...prevState, email: e.target.value }))}
            className="input w-full"
            required={action !== 'view'}
            readOnly={action === 'view'}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="profile" className="block text-sm font-medium text-gray-700">Perfil</label>
          <input
            type="text"
            id="profile"
            name="profile"
            value={userData.profile?.name}
            onChange={(e) => setUserData(prevState => ({
              ...prevState,
              profile: { name: e.target.value } // Atualiza profile.name
            }))}
            className="input w-full"
            required={action !== 'view'}
            readOnly={action === 'view'}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="active" className="block text-sm font-medium text-gray-700">Situação</label>
          <select
            id="active"
            name="active"
            value={activeValue}
            onChange={(e) => setUserData(prevState => ({ ...prevState, active: e.target.value === 'true' }))}
            className="input w-full"
            disabled={action !== 'edit'}
          >
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>
        {action !== 'view' && (
          <div className="flex justify-end">
            <button type="submit" className="btn mr-2">Atualizar</button>
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

export default FormUser;
