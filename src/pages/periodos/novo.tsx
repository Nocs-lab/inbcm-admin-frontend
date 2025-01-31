import React from "react"
import { useNavigate } from "react-router"
import { useMutation } from "@tanstack/react-query"
import Input from "../../components/Input"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import clsx from "clsx"
import { Link } from "react-router"
import toast from "react-hot-toast"
import request from "../../utils/request"

const schema = z.object({
  ano: z.string().min(1, "Este campo é obrigatório"),
  dataInicioSubmissao: z.string(),
  dataFimSubmissao: z.string(),
  dataInicioRetificacao: z.string(),
  dataFimRetificacao: z.string(),
  metaDeclaracoesEnviadas: z
    .number()
    .min(0, "Este campo é obrigatório")
    .max(100, "Este campo é obrigatório")
})

type FormData = z.infer<typeof schema>

const CriarPeriodo: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      ano: new Date().getFullYear().toString(),
      metaDeclaracoesEnviadas: 100
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
      const res = await request("/api/admin/anoDeclaracao", {
        method: "POST",
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
    }
  })

  const onSubmit = (data: FormData) => {
    toast.promise(
      (async () => {
        await mutateAsync(data)
        navigate("/periodos")
      })(),
      {
        loading: "Criando perído...",
        success: "Período criado com sucesso",
        error: (error: Error) => error.message || "Erro ao criar período"
      }
    )
  }

  return (
    <>
      <div className="container mx-auto p-8">
        <Link to="/periodos" className="text-lg">
          <i className="fas fa-arrow-left" aria-hidden="true"></i>
          Voltar
        </Link>
        <h2>Criar novo período</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input label="Ano" error={errors.ano} {...register("ano")} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="datetime-local"
              label="Início do período de submissão"
              error={errors.dataInicioSubmissao}
              min={new Date().toISOString().substring(0, 16)}
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              min={inicioRetificacao ? inicioRetificacao.substring(0, 16) : ""}
              error={errors.dataFimRetificacao}
              {...register("dataFimRetificacao")}
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
              Criar
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default CriarPeriodo
