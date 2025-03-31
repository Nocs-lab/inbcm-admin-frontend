import React from "react"
import { useNavigate, useParams } from "react-router"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from "@tanstack/react-query"
import Input from "../../components/Input"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import clsx from "clsx"
import { Link } from "react-router"
import toast from "react-hot-toast"
import request from "../../utils/request"

const schema = z.object({
  ano: z.number(),
  dataInicioSubmissao: z.string(),
  dataFimSubmissao: z.string(),
  dataInicioRetificacao: z.string(),
  dataFimRetificacao: z.string(),
  metaDeclaracoesEnviadas: z.number(),
  diasAlertaPrazo: z
    .number()
    .min(0, "Este campo é obrigatório")
    .max(100, "Este campo é obrigatório"),
  quantidadeLembretesEmail: z
    .number()
    .min(0, "Este campo é obrigatório")
    .max(100, "Este campo é obrigatório"),
  intervaloLembretesEmail: z
    .number()
    .min(0, "Este campo é obrigatório")
    .max(100, "Este campo é obrigatório")
})

type FormData = z.infer<typeof schema>

const EditarPeriodo: React.FC = () => {
  const { id } = useParams()

  const queryClient = useQueryClient()

  const { data } = useSuspenseQuery({
    queryKey: ["periodos", id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/anoDeclaracao/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch period")
      }
      return response.json()
    }
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      ...data,
      dataInicioSubmissao: data?.dataInicioSubmissao.substring(0, 16),
      dataFimSubmissao: data?.dataFimSubmissao.substring(0, 16),
      dataInicioRetificacao: data?.dataInicioRetificacao.substring(0, 16),
      dataFimRetificacao: data?.dataFimRetificacao.substring(0, 16)
    }
  })

  const [inicioSubmissao, inicioRetificacao] = watch([
    "dataInicioSubmissao",
    "dataInicioRetificacao"
  ])

  const navigate = useNavigate()

  const { mutateAsync } = useMutation({
    mutationFn: async ({
      ano,
      dataInicioSubmissao,
      dataFimSubmissao,
      dataInicioRetificacao,
      dataFimRetificacao,
      metaDeclaracoesEnviadas,
      diasAlertaPrazo,
      quantidadeLembretesEmail,
      intervaloLembretesEmail
    }: FormData) => {
      const res = await request(`/api/admin/anoDeclaracao/${id}`, {
        method: "PUT",
        data: {
          ano,
          dataInicioSubmissao,
          dataFimSubmissao,
          dataInicioRetificacao,
          dataFimRetificacao,
          metaDeclaracoesEnviadas,
          diasAlertaPrazo,
          quantidadeLembretesEmail,
          intervaloLembretesEmail
        }
      })

      return await res.json()
    },
    onSuccess: () => {
      navigate("/configuracoes")
    },
    onMutate: () => {
      queryClient.invalidateQueries({ queryKey: ["periodos"] })
    }
  })

  const onSubmit = (data: FormData) => {
    toast.promise(mutateAsync(data), {
      loading: "Editando perído...",
      success: "Período editado com sucesso",
      error: (error: Error) => error.message || "Erro ao criar período"
    })
  }

  return (
    <>
      <div className="container mx-auto p-8">
        <Link to="/configuracoes" className="text-lg">
          <i className="fas fa-arrow-left" aria-hidden="true"></i>
          Voltar
        </Link>
        <h2>Editar período</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <fieldset
            className="rounded-lg p-3"
            style={{ border: "2px solid #e0e0e0" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Ano"
                error={errors.ano}
                {...register("ano", { valueAsNumber: true })}
              />
              <Input
                type="number"
                label="Meta de declarações enviadas"
                error={errors.metaDeclaracoesEnviadas}
                min={1}
                step={1}
                {...register("metaDeclaracoesEnviadas", {
                  valueAsNumber: true
                })}
              />
              <Input
                type="datetime-local"
                label="Início do período de submissão"
                error={errors.dataInicioSubmissao}
                {...register("dataInicioSubmissao")}
              />
              <Input
                type="datetime-local"
                label="Fim do período de submissão"
                disabled={!inicioSubmissao}
                min={inicioSubmissao ? inicioSubmissao.substring(0, 16) : ""}
                error={errors.dataFimSubmissao}
                {...register("dataFimSubmissao")}
              />
              <Input
                type="datetime-local"
                label="Início do período de retificação"
                disabled={!inicioSubmissao}
                error={errors.dataInicioRetificacao}
                min={inicioSubmissao ? inicioSubmissao.substring(0, 16) : ""}
                {...register("dataInicioRetificacao")}
              />
              <Input
                type="datetime-local"
                label="Fim do período de retificação"
                disabled={!inicioRetificacao}
                min={
                  inicioRetificacao ? inicioRetificacao.substring(0, 16) : ""
                }
                error={errors.dataFimRetificacao}
                {...register("dataFimRetificacao")}
              />
              <Input
                type="number"
                label="Quantidade de notificações em tela antes do prazo final de envio"
                error={errors.diasAlertaPrazo}
                min={0}
                step={1}
                {...register("diasAlertaPrazo", { valueAsNumber: true })}
              />
              <Input
                type="number"
                label="Quantidade de e-mails lembretes antes do prazo final"
                error={errors.quantidadeLembretesEmail}
                min={0}
                step={1}
                {...register("quantidadeLembretesEmail", {
                  valueAsNumber: true
                })}
              />
              <Input
                type="number"
                label="Intervalo em dias do envio de e-mails"
                error={errors.intervaloLembretesEmail}
                min={0}
                step={1}
                {...register("intervaloLembretesEmail", {
                  valueAsNumber: true
                })}
              />
            </div>
          </fieldset>
          <div className="flex justify-end space-x-4">
            <button
              className={clsx("br-button primary", isSubmitting && "loading")}
              type="submit"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default EditarPeriodo
