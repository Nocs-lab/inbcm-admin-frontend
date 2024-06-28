import React, { useState } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { IdentificationCard, User, Envelope, Password, UserFocus, UserRectangle } from "@phosphor-icons/react";
import clsx from 'clsx';
import request from '../../utils/request';
import logoIbram from '../../images/logo-ibram.png';

const schema = z.object({
  cpf: z.string().min(11, { message: "CPF inválido" }),
  name: z.string().min(1, { message: "Este campo é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" })
});

type FormData = z.infer<typeof schema>;

const CreateUser = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur"
  });

  const [showError, setShowError] = useState(false);

  const { mutate, error, isError } = useMutation({
    mutationFn: async ({ name, email, password }: FormData) => {
      const res = await request("/api/users", {
        method: "POST",
        data: {
          name,
          email,
          password
        }
      });

      return await res.json();
    },
    onSuccess: () => {
      navigate("/users");
    },
    onError: () => {
      setShowError(true);
    }
  });

  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    mutate(data);
  };

  return (
    <div className="flex h-screen overflow-auto">
      <div className="w-full lg:w-7/12 mx-auto">
        <form className="flex flex-col lg:flex-row gap-3 justify-center items-center max-h-screen p-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="w-full flex flex-col lg:flex-row gap-15 justify-between items-start">
            <div className="w-full lg:w-2/3 flex flex-col gap-1 max-h-full overflow-auto">
              <div className={clsx("br-input input-button w-full", errors.name && "input-danger")}>
                <h6 className='border-b-2 border-gray-500 w-full text-sm'>Dados Cadastrais</h6>
                <label className="flex items-center text-blue-700 text-xs" htmlFor="cpf">
                  <IdentificationCard size={18} />
                  <span>CPF: (obrigatório)</span>
                </label>
                <input id="cpf" type="text" placeholder="Digite seu CPF" {...register("cpf")} className="w-full py-1 px-2 border rounded-md border-gray-400 focus:outline-none focus:border-blue-700 text-sm" />
                {errors.cpf && <span className="feedback danger text-xs" role="alert"><i className="fas fa-times-circle" aria-hidden="true"></i>{errors.cpf.message}</span>}
              </div>
              <div className={clsx("br-input input-button w-full", errors.name && "input-danger")}>
                <label className="flex items-center text-blue-700 text-xs" htmlFor="name">
                  <User size={18} />
                  <span>Nome: (obrigatório)</span>
                </label>
                <input id="name" type="text" placeholder="Digite seu nome" {...register("name")} className="w-full py-1 px-2 border rounded-md border-gray-400 focus:outline-none focus:border-blue-700 text-sm" />
                {errors.name && <span className="feedback danger text-xs" role="alert"><i className="fas fa-times-circle" aria-hidden="true"></i>{errors.name.message}</span>}
              </div>
              <div className={clsx("br-input input-button w-full", errors.email && "input-danger")}>
                <label className="flex items-center text-blue-700 text-xs" htmlFor="email">
                  <Envelope size={18} />
                  <span>Email: (obrigatório)</span>
                </label>
                <input id="email" type="email" placeholder="Digite seu email" {...register("email")} className="w-full py-1 px-2 border rounded-md border-gray-400 focus:outline-none focus:border-blue-700 text-sm" />
                {errors.email && <span className="feedback danger text-xs" role="alert"><i className="fas fa-times-circle" aria-hidden="true"></i>{errors.email.message}</span>}
              </div>
              <div className={clsx("br-input input-button w-full", errors.password && "input-danger")}>
                <label className="flex items-center text-blue-700 text-xs" htmlFor="password">
                  <Password size={18} />
                  <span>Senha: (obrigatório)</span>
                </label>
                <input id="password" type="password" placeholder="Digite sua senha" {...register("password")} className="w-full py-1 px-2 border rounded-md border-gray-400 focus:outline-none focus:border-blue-700 text-sm" />
                <button className="br-button" type="button" aria-label="Exibir senha" role="switch" aria-checked="false"><i className="fas fa-eye" aria-hidden="true"></i></button>
                {errors.password && <span className="feedback danger text-xs" role="alert"><i className="fas fa-times-circle" aria-hidden="true"></i>{errors.password.message}</span>}
                <label className="flex items-center text-blue-700 text-xs" htmlFor="password">
                  <Password size={18} />
                  <span>Confirme sua senha: (obrigatório)</span>
                </label>
                <input id="password" type="password" placeholder="Digite sua senha" {...register("password")} className="w-full py-1 px-2 border rounded-md border-gray-400 focus:outline-none focus:border-blue-700 text-sm" />
                <button className="br-button" type="button" aria-label="Exibir senha" role="switch" aria-checked="false"><i className="fas fa-eye" aria-hidden="true"></i></button>
                {errors.password && <span className="feedback danger text-xs" role="alert"><i className="fas fa-times-circle" aria-hidden="true"></i>{errors.password.message}</span>}
              </div>
              <button className={clsx("br-button block primary p-2 mt-3 lg:mx-auto", isSubmitting && "loading")} type="submit">Criar acesso</button>
            </div>
            <div className="w-full lg:w-1/3 flex flex-col justify-start lg:mt-1">
              <label className="flex items-center text-blue-700 text-xs mt-16" htmlFor="img">
              <UserRectangle size={18} />
              <span>Foto: (opcional)</span>
              </label>

              <div className="w-48 h-48 bg-gray-200 flex flex-col items-center justify-center border border-gray-400 rounded-lg relative">
                <span className="flex items-center justify-center pointer-events-none mb-2">
                  <UserFocus size={64} />
                </span>
                <span className="pointer-events-none text-xs">Clique para adicionar uma imagem</span>
                <input type="file" className="opacity-0 w-full h-full cursor-pointer absolute inset-0" />
              </div>
            </div>
          </div>
        </form>
      </div>
      <div className="hidden lg:flex lg:w-5/12 bg-blue-700 lg:ml-4 lg:justify-center lg:items-center lg:h-screen">
        <div className="text-center">
          <img src={logoIbram} alt="Logo do Ibram" className="w-48 h-auto mb-4" />
          {showError && isError && (
            <div className="br-message danger text-sm mt-4">
              <div className="icon">
                <i className="fas fa-times-circle fa-lg" aria-hidden="true"></i>
              </div>
              <div className="content" aria-label={error.message} role="alert">
                <span className="message-title">{" "}Erro:{" "}</span>
                <span className="message-body">{error.message}</span>
              </div>
              <div className="close">
                <button className="br-button circle small" type="button" aria-label="Fechar a mensagem de alerta" onClick={() => setShowError(false)}>
                  <i className="fas fa-times" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );






};

export default CreateUser;
