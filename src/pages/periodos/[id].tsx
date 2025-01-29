import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import DefaultLayout from "../../layouts/default"
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
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import request from "../../utils/request"

const schema = z.object({
  ano: z.string().min(1, "Este campo é obrigatório"),
  dataInicioSubmissao: z.coerce
    .date()
    .min(
      new Date(),
      "A data de início de submissão deve ser maior que a data atual"
    ),
  dataFimSubmissao: z.coerce.date(),
  dataInicioRetificacao: z.coerce.date(),
  dataFimRetificacao: z.coerce.date(),
  metaDeclaracoesEnviadas: z
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
    formState: { errors, isSubmitting, isValid }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      ano: data.ano,
      dataInicioSubmissao: data.dataInicioSubmissao.split("T")[0],
      dataFimSubmissao: data.dataFimSubmissao.split("T")[0],
      dataInicioRetificacao: data.dataInicioRetificacao.split("T")[0],
      dataFimRetificacao: data.dataFimRetificacao.split("T")[0],
      metaDeclaracoesEnviadas: data.metaDeclaracoesEnviadas
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
      metaDeclaracoesEnviadas
    }: FormData) => {
      const res = await request(`/api/admin/anoDeclaracao/${id}`, {
        method: "PUT",
        data: {
          ano,
          dataInicioSubmissao,
          dataFimSubmissao,
          dataInicioRetificacao,
          dataFimRetificacao,
          metaDeclaracoesEnviadas
        }
      })

      return await res.json()
    },
    onSuccess: () => {
      navigate("/periodos")
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
    <DefaultLayout>
      <div className="container mx-auto p-8">
        <Link to="/periodos" className="text-lg">
          <i className="fas fa-arrow-left" aria-hidden="true"></i>
          Voltar
        </Link>
        <h2>Editar período</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input label="Ano" error={errors.ano} {...register("ano")} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
            <Input
              type="date"
              label="Início do período de submissão"
              error={errors.dataInicioSubmissao}
              min={new Date().toISOString().split("T")[0]}
              {...register("dataInicioSubmissao", { valueAsDate: true })}
            />
            <Input
              type="date"
              label="Fim do período de submissão"
              disabled={!inicioSubmissao}
              min={inicioSubmissao ? inicioSubmissao.toString() : ""}
              error={errors.dataFimSubmissao}
              {...register("dataFimSubmissao", { valueAsDate: true })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
            <Input
              type="date"
              label="Início do período de retificação"
              disabled={!inicioSubmissao}
              error={errors.dataInicioRetificacao}
              min={inicioSubmissao ? inicioSubmissao.toString() : ""}
              {...register("dataInicioRetificacao", { valueAsDate: true })}
            />
            <Input
              type="date"
              label="Fim do período de retificação"
              disabled={!inicioRetificacao}
              min={inicioRetificacao ? inicioRetificacao.toString() : ""}
              error={errors.dataFimRetificacao}
              {...register("dataFimRetificacao", { valueAsDate: true })}
            />
          </div>
          <Input
            type="number"
            label="Meta de declarações enviadas"
            error={errors.metaDeclaracoesEnviadas}
            min={1}
            max={100}
            step={1}
            {...register("metaDeclaracoesEnviadas", { valueAsNumber: true })}
          />
          <div className="flex justify-end space-x-4">
            <button
              className={clsx("br-button primary", isSubmitting && "loading")}
              type="submit"
              disabled={!isValid}
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  )
}

export default EditarPeriodo
