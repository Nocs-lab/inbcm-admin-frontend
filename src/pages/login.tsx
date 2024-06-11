import React, { useState } from 'react'
import logoIbram from '../images/logo-ibram.png'
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useStore } from '../store'
import clsx from 'clsx'
import { useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import request from '../request'

const schema = z.object({
  email: z.string({ required_error: "Este campo é obrigatório" }),
  password: z.string({ required_error: "Este campo é obrigatório" })
})
type FormData = z.infer<typeof schema>

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur"
  })

  const [showError, setShowError] = useState(true)

  const { mutate, error, isError } = useMutation({
    mutationFn: async ({ email, password }: FormData) => {
      const res = await request("/api/auth/login?admin=true", {
        method: "POST",
        data: {
          email,
          password
        }
      })

      return await res.json()
    },
    onSuccess: (data) => {
      setUser({
        email: data.email,
        name: data.name
      })

      navigate("/")
    },
    onError: () => {
      setShowError(true)
    }
  })

  const { setUser } = useStore()

  const navigate = useNavigate()

  const onSubmit = async ({ email, password }: FormData) => {
    mutate({ email, password })
  }

  return (
    <div className="flex h-screen">
      <div className="w-full lg:w-5/12">
        <form className="flex flex-col gap-4 justify-center items-center h-full md:w-1/2 lg:w-2/3 xl:w-1/2 p-10 mx-auto" onSubmit={handleSubmit(onSubmit)}>
          <img src={logoIbram} alt="Logo do Ibram" className="mb-3" />
          {showError && isError && (
            <div className="br-message danger">
              <div className="icon">
                <i className="fas fa-times-circle fa-lg" aria-hidden="true"></i>
              </div>
              <div className="content" aria-label={error.message} role="alert">
                <span className="message-title">{" "}Erro:{" "}</span>
                <span className="message-body">{error.message}</span>
              </div>
              <div className="close">
                <button className="br-button circle small" type="button" aria-label="Fechar a messagem alterta" onClick={() => setShowError(false)}>
                  <i className="fas fa-times" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          )}
          <div className={clsx("br-input input-button w-full", errors.email && "input-danger")}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="Digite seu email" {...register("email")} />
            {errors.email && <span className="feedback danger" role="alert" id="danger"><i className="fas fa-times-circle" aria-hidden="true"></i>{errors.email.message}</span>}
          </div>
          <div className={clsx("br-input input-button w-full", errors.password && "input-danger")}>
            <label htmlFor="password">Senha</label>
            <input type="password" placeholder="Digite sua senha" {...register("password")} />
            <button className="br-button" type="button" aria-label="Exibir senha" role="switch" aria-checked="false"><i className="fas fa-eye" aria-hidden="true"></i></button>
            {errors.password && <span className="feedback danger" role="alert" id="danger"><i className="fas fa-times-circle" aria-hidden="true"></i>{errors.password.message}</span>}
          </div>
          <button className={clsx("br-button block primary mt-3", isSubmitting && "loading")} type="submit">Entrar</button>
        </form>
      </div>
      <div className="hidden lg:block w-7/12 bg-blue-700"></div>
    </div>
  )
}

export default LoginPage
