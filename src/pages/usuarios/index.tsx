import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from "../../layouts/default";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import request from '../../utils/request';
import { Modal, Button, Select } from 'react-dsgov';
import { useForm,Controller } from "react-hook-form"
// Definir tipos de dados para as respostas da API

interface User {
  _id: string;
  nome: string;
  email: string;
  // profile?: {
  //   name: string;
  // };
  ativo: boolean;
}

interface Museu {
  _id: string;
  nome: string;
}

const fetchUsers = async (): Promise<User[]> => {
  const response = await request('/api/admin/users');
  if (!response.ok) {
    let errorMessage = 'Perfil não encontrado';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Se a resposta não for JSON, mantenha a mensagem de erro padrão
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  }
  catch (error) {
    throw new Error('Failed to parse JSON response');
  }
};

const fetchMuseus = async (): Promise<Museu[]> => {
  const response = await request('/api/admin/museus?&semVinculoUsuario=true');
  if (!response.ok) throw new Error('Erro ao carregar museus');
  const data = await response.json();

  // Log dos dados convertidos em JSON
  console.log('Data:', data);

  return data;

};

const Index: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { control } = useForm<{ museus: string[] }>(); // `museus` é um array de strings

  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const { data: museus } = useQuery<Museu[]>({ queryKey: ['museus'], queryFn: fetchMuseus });

  const [showAssociationModal, setShowAssociationModal] = useState(false);
  const [selectedMuseus, setSelectedMuseus] = useState<string[]>([]);
  const [userIdToAssociate, setUserIdToAssociate] = useState<string>('');

  const mutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await request(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });

  const associateMutation = useMutation({
    mutationFn: async () => {
      const body = selectedMuseus.map((museuId) => ({
        museuId,
        usuarioId: userIdToAssociate,
      }));

      const response = await request('/api/admin/museus/vincular-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Erro ao associar museus');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['museus']);
      setShowAssociationModal(false);
    },
  });

  const handleOpenAssociationModal = (userId: string) => {
    setUserIdToAssociate(userId);
    setSelectedMuseus([]);
    setShowAssociationModal(true);
  };

  const handleSubmitAssociation = async () => {
    try {
      await associateMutation.mutateAsync();
    } catch (error) {
      console.error('Erro ao associar museus:', error);
    }
  };


  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string>('');

  const handleOpenModal = (userId: string) => {
    setUserIdToDelete(userId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setUserIdToDelete('');
  };

  const handleDeleteUser = async () => {
    try {
      await mutation.mutateAsync(userIdToDelete);
      setShowModal(false); // Fechar o modal após a exclusão
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      // Tratar erro aqui, se necessário
    }
  };


  return (
    <DefaultLayout>
      <div className="flex justify-between items-center mb-4">
        <h1>Usuários</h1>
        <div className="flex justify-end">

          <button className="btn flex gap-2" onClick={() => navigate('/usuarios/createuser')} aria-label="Criar novo usuário">
            <i className="fa-solid fa-user-plus"></i> Novo Usuário
          </button>
        </div>
      </div>
      <div className="flex">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-center">Nome</th>
              <th className="text-center">Email</th>
              <th className="text-center">Museu</th>
              {/*<th>Perfil</th>*/}
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user._id}>
                <td className="text-center">{user.nome}</td>
                <td className="text-center">{user.email}</td>
                <td className="text-center">
                <Button onClick={() => handleOpenAssociationModal(user._id)}>Associar Museu</Button>

                </td>
                {/*<td>{user.profile?.name || 'Não especificado'}</td>*/}
                <td>
                  <button className="btn text-blue-950" onClick={() => navigate(`/usuarios/${user._id}/editar`)} aria-label="Editar usuário" title="Editar usuário">
                    <i className="fa-solid fa-pen-to-square pr-2"></i>
                  </button>
                  <button className="btn text-blue-950" onClick={() => navigate(`/usuarios/${user._id}`)} aria-label="Visualizar usuário" title="Visualizar usuário">
                    <i className="fa-solid fa-eye fa-fw"></i>
                  </button>
                  <button className="btn text-red" onClick={() => handleOpenModal(user._id)} aria-label="Excluir usuário" title="Excluir usuário">
                    <i className="fa-solid fa-trash fa-fw pl-2"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Confirmação */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <Modal
            title="Desativar usuário?"
            showCloseButton
            onCloseButtonClick={() => handleCloseModal()}
          >
            <Modal.Body>
                Você tem certeza que deseja desativar este usuário?
            </Modal.Body>
            <Modal.Footer justify-content='end'>
                <Button secondary small m={2} onClick={handleCloseModal}>Cancelar</Button>
                <Button primary small m={2} onClick={handleDeleteUser}>Confirmar</Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}

      {/* Modal de associar usuario a um museu */}
      {showAssociationModal && (
        <Modal
        useScrim
        showCloseButton
        title="Associar Museus"
        modalOpened={showAssociationModal}
        onCloseButtonClick={() => setShowAssociationModal(false)}
        className="max-w-2xl overflow-visible"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitAssociation();
          }}
        >
          <Modal.Body className="p-6" style={{ maxHeight: "none" }}>
            <div className="mb-4">
              <label htmlFor="multi-select" className="block text-sm font-medium text-gray-700">
                Selecione os museus disponíveis:
              </label>
              <Controller
                control={control}
                name="museus"
                render={({ field }) => (
                  <Select
                    type="multiple"
                    selectAllText={""}
                    placeholder="Selecione os museus"
                    options={
                      museus?.map((m) => ({
                        label: m.nome,
                        value: m._id,
                      })) ?? []
                    }
                    className="!w-full mt-2"
                    {...field}
                  />
                )}
              />
            </div>
          </Modal.Body>
          <Modal.Footer justify-content="end" className="pt-4">
            <Button secondary small m={2} type="button" onClick={() => setShowAssociationModal(false)}>
              Cancelar
            </Button>
            <Button primary small m={2} type="submit">
              Confirmar
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      )}
    </DefaultLayout>
  );
};

export default Index;
