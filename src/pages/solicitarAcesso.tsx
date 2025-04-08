import React, { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import Input from "../components/Input"
import { Button, Modal } from "react-dsgov"
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import clsx from "clsx"
import { Link } from "react-router"
import request from "../utils/request"
import toast from "react-hot-toast"
import { useModal } from "../utils/modal"
import Upload from "../components/Upload"
import { useHookFormMask } from "use-mask-input"
import Select from "../components/MultiSelect"

const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]+/g, "")
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false

  const cpfDigits = cpf.split("").map((el) => +el)
  const rest = (count: number) => {
    return (
      ((cpfDigits
        .slice(0, count - 12)
        .reduce((soma, el, index) => soma + el * (count - index), 0) *
        10) %
        11) %
      10
    )
  }

  return rest(10) === cpfDigits[9] && rest(11) === cpfDigits[10]
}

const schema = z
  .object({
    email: z.string().min(1, "Este campo é obrigatório"),
    nome: z.string().min(1, "Este campo é obrigatório"),
    cpf: z
      .string()
      .min(1, "Este campo é obrigatório")
      .refine((cpf) => validateCPF(cpf), {
        message: "CPF inválido"
      }),
    password: z.string().min(1, "Este campo é obrigatório"),
    confirmPassword: z.string().min(1, "Este campo é obrigatório"),
    especialidadeAnalista: z.array(z.string()).optional(),
    file: z.custom<File>((value) => value instanceof File, {
      message: "Este campo é obrigatório"
    })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não são iguais",
    path: ["confirmPassword"]
  })
type FormData = z.infer<typeof schema>

const CreateUser: React.FC = () => {
  const [selectedEspecialidades, setSelectedEspecialidades] = useState<
    string[]
  >([])
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    trigger,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur"
  })

  const registerWithMask = useHookFormMask(register)

  const { mutateAsync } = useMutation({
    mutationFn: async ({
      email,
      nome,
      cpf,
      especialidadeAnalista,
      password,
      file
    }: FormData) => {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("nome", nome)
      formData.append("cpf", cpf)
      especialidadeAnalista?.forEach((especialidade) => {
        formData.append("especialidadeAnalista", especialidade)
      })
      formData.append("senha", password)
      formData.append("arquivo", file!)

      const res = await request("/api/public/users/registroAnalista", {
        method: "POST",
        body: formData
      })

      return res.json()
    }
  })

  const formData = watch()

  const { openModal, closeModal } = useModal((close) => (
    <Modal
      title="Confirmar solicitação de acesso"
      showCloseButton
      onCloseButtonClick={close}
    >
      <Modal.Body>
        <div className="text-left">
          <p>Confira atentamente os dados que serão enviados:</p>
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="p-2 font-semibold bg-gray-100">CPF:</td>
                <td className="p-2">{formData.cpf}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-2 font-semibold bg-gray-100">Nome:</td>
                <td className="p-2">{formData.nome}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-2 font-semibold bg-gray-100">E-mail:</td>
                <td className="p-2">{formData.email}</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold bg-gray-100">Documento:</td>
                <td className="p-2">{formData.file?.name}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal.Body>

      <Modal.Footer justify-content="end">
        <Button secondary small m={2} onClick={close}>
          Cancelar
        </Button>
        <Button primary small m={2} onClick={() => handleSubmit(onSubmit)()}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  ))

  const onSubmit = async (formData: FormData) => {
    closeModal()
    await toast.promise(
      mutateAsync({
        ...formData
      }),
      {
        loading: "Enviando solicitação",
        success: (data) => {
          setTimeout(() => {
            window.location.reload()
          }, 2000)
          return data.message
        },
        error: (error) => error.message
      }
    )
  }

  return (
    <>
      <div className="container mx-auto p-8">
        <Link to="/login" className="text-lg">
          <i className="fas fa-arrow-left" aria-hidden="true"></i>
          Voltar
        </Link>
        <h2>Solicitação de cadastro para novo analista</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <fieldset
            className="rounded-lg p-3"
            style={{ border: "2px solid #e0e0e0" }}
          >
            <legend className="font-extrabold px-3 m-0">Dados pessoais</legend>
            <div className="grid grid-cols-3 gap-2 w-full p-2">
              <Input
                type="text"
                label={
                  <span>
                    CPF <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="000.000.000-00"
                error={errors.cpf}
                {...registerWithMask("cpf", ["999.999.999-99"])}
              />
              <Input
                type="text"
                label={
                  <span>
                    Nome <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Digite o nome do usuário"
                error={errors.nome}
                {...register("nome")}
                className="capitalize"
              />
              <Input
                type="email"
                label={
                  <span>
                    E-mail <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Digite o email do usuário"
                error={errors.email}
                {...register("email")}
              />
            </div>
          </fieldset>
          <fieldset
            className="rounded-lg p-3"
            style={{ border: "2px solid #e0e0e0" }}
          >
            <legend className="font-extrabold px-3 m-0">
              Controle de acesso
            </legend>
            <div className="flex flex-col w-full items-center">
              <div className="flex justify-between w-full p-2">
                <Controller
                  name="especialidadeAnalista"
                  control={control}
                  render={({ field }) => (
                    <Select
                      type="multiple"
                      selectAllText=""
                      placeholder="Selecione os tipos de especialidade"
                      label={
                        <span>
                          Tipo de especialidade{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      }
                      className="w-full"
                      options={[
                        { label: "Arquivístico", value: "arquivistico" },
                        { label: "Museológico", value: "museologico" },
                        { label: "Bibliográfico", value: "bibliografico" }
                      ]}
                      {...field}
                      value={selectedEspecialidades}
                      onChange={(selected: string[]) => {
                        field.onChange(selected)
                        setSelectedEspecialidades(selected)
                      }}
                    />
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
              <Input
                type="password"
                label={
                  <span>
                    Senha <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Digite sua senha"
                error={errors.password}
                {...register("password")}
              />
              <Input
                type="password"
                label={
                  <span>
                    Confirmar senha <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Digite sua senha novamente"
                error={errors.confirmPassword}
                {...register("confirmPassword")}
              />
            </div>
          </fieldset>
          <fieldset
            className="rounded-lg p-3"
            style={{ border: "2px solid #e0e0e0" }}
          >
            <legend className="font-extrabold px-3 m-0">
              Documento comprobatório
            </legend>
            <div className="grid grid-cols-3 gap-2 w-full p-2">
              <Controller
                control={control}
                name="file"
                render={({ field }) => (
                  <Upload
                    onChange={(file) => field.onChange(file)} // Agora compatível com o tipo do componente
                    value={field.value}
                    error={errors.file?.message}
                    accept=".pdf"
                  />
                )}
              />
            </div>
          </fieldset>
          <div className="flex justify-end space-x-4">
            <Link to="/login" className="br-button secondary">
              Voltar
            </Link>
            <button
              className={clsx("br-button primary", isSubmitting && "loading")}
              type="button"
              onClick={async () => {
                if (
                  await trigger([
                    "cpf",
                    "nome",
                    "email",
                    "especialidadeAnalista",
                    "file"
                  ])
                ) {
                  openModal()
                }
              }}
              disabled={isSubmitting}
            >
              Solicitar
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default CreateUser
