import { useMutation } from "@tanstack/react-query"
import Input from "../components/Input"
import { Button, Modal } from "react-dsgov"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import clsx from "clsx"
import { Link } from "react-router"
import request from "../utils/request"
import toast from "react-hot-toast"
import { useModal } from "../utils/modal"

const schema = z
  .object({
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

const MudancaSenhaPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur"
  })

  const { mutateAsync } = useMutation({
    mutationFn: async ({ password }: FormData) => {
      const formData = new FormData()
      formData.append("senha", password)

      const res = await request("/api/public/users/registroAnalista", {
        method: "POST",
        body: formData
      })

      return res.json()
    }
  })

  const { openModal, closeModal } = useModal((close) => (
    <Modal
      title="Confirmar mudança de senha"
      showCloseButton
      onCloseButtonClick={close}
    >
      <Modal.Body>
        <div className="text-left">
          <p>Confira atentamente os dados que serão enviados:</p>
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
        <h2>Efetuar mudança de senha</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <fieldset
            className="rounded-lg p-3"
            style={{ border: "2px solid #e0e0e0" }}
          >
            <legend className="font-extrabold px-3 m-0">
              Controle de acesso
            </legend>
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
          <div className="flex justify-end space-x-4">
            <Link to="/login" className="br-button secondary">
              Voltar
            </Link>
            <button
              className={clsx("br-button primary", isSubmitting && "loading")}
              type="button"
              onClick={async () => {
                openModal()
              }}
              disabled={isSubmitting}
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default MudancaSenhaPage
