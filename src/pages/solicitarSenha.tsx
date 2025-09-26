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
    email: z.string().min(1, "Este campo é obrigatório")
  })
  .refine((data) => data.email.includes("@"), {
    message: "E-mail inválido",
    path: ["email"]
  })
type FormData = z.infer<typeof schema>

const SolicitarSenhaPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur"
  })

  const { mutateAsync } = useMutation({
    mutationFn: async ({ email }: FormData) => {
      const res = await request("/api/admin/users/recuperar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      return res.json()
    }
  })

  const formData = watch()

  const { openModal, closeModal } = useModal((close) => (
    <Modal
      title="Confirmar recuperação de senha"
      showCloseButton
      onCloseButtonClick={close}
    >
      <Modal.Body>
        <div className="text-left">
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="p-2 font-semibold bg-gray-100">E-mail:</td>
                <td className="p-2">{formData.email}</td>
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
        <h2>Recuperação de senha</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <fieldset
            className="rounded-lg p-3"
            style={{ border: "2px solid #e0e0e0" }}
          >
            <legend className="font-extrabold px-3 m-0">
              Insira o seu e-mail
            </legend>
            <div className="center p-2">
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
          <div className="flex justify-end space-x-4">
            <Link to="/login" className="br-button secondary">
              Voltar
            </Link>
            <button
              className={clsx("br-button primary", isSubmitting && "loading")}
              type="button"
              onClick={async () => {
                if (await trigger(["email"])) {
                  openModal()
                }
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

export default SolicitarSenhaPage
