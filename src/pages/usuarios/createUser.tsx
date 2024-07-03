import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from "../../layouts/default";
import { useMutation, useQueryClient } from '@tanstack/react-query';


interface Profile {
  _id: string;
  name: string;
  description: string;
}

interface User {
  id?: string;
  nome: string;
  email: string;
  senha: string;
  profile?: string;
  active: boolean;
}

const CreateUser: React.FC = () => {
  const [formData, setFormData] = useState<User>({ nome: '', email: '', senha: '', profile: '', active: true });
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [profiles, setProfiles] = useState<Profile[]>([]); // Estado para armazenar os perfis
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Buscar perfis disponíveis ao carregar o componente
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch('/api/profiles'); // Endpoint para buscar os perfis
        if (!response.ok) {
          throw new Error('Failed to fetch profiles');
        }
        const data = await response.json();
        setProfiles(data);
      } catch (error) {
        console.error('Erro ao buscar perfis:', error);
        // Tratar erro aqui, se necessário
      }
    };

    fetchProfiles();
  }, []);

  const mutation = useMutation({
    mutationFn: async (newUser: User) => {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      navigate('/usuarios');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.senha !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    try {
      await mutation.mutateAsync(formData);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      // Tratar erro aqui, se necessário
    }
  };

  const handleCancel = () => {
    // Navega de volta para a página de usuários ao clicar em Cancelar
    navigate('/usuarios');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto p-4">
        <h1>Criar Usuário</h1>
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md max-w-md mx-auto ">
          <div className='max-w-md'>


              <div className="mb-4 ">
                <label htmlFor="nome" className="block text-gray-700 text-sm font-medium mb-2"><i className="fa-solid fa-user"></i> Nome</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
                />
              </div>

              <div className="mb-4">

                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2"><i className="fa-solid fa-envelope"></i> Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="senha" className="block text-gray-700 text-sm font-medium mb-2"><i className="fa-solid fa-key"></i> Senha</label>
                <input
                  type="password"
                  id="senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-2"><i className="fa-solid fa-key"></i> Confirmar Senha</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="profile" className="block text-gray-700 text-sm font-medium mb-2"><i className="fa-solid fa-user-tie"></i>  Perfil</label>
                <select
                  id="profile"
                  name="profile"
                  value={formData.profile}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"
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

          </div>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default CreateUser;
