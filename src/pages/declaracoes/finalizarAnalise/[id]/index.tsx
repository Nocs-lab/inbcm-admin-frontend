import { useSuspenseQueries, useMutation } from "@tanstack/react-query"
import clsx from "clsx"
import { format } from "date-fns"
import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Select, Textarea, Row, Button } from "react-dsgov"
//import TableItens from "../../../../components/TableItens";
import MismatchsModal from "../../../../components/MismatchsModal"
import DefaultLayout from "../../../../layouts/default"
import request from "../../../../utils/request"
import toast from "react-hot-toast"

export default function DeclaracaoPage() {
  const params = useParams()
  const id = params.id!
  const navigate = useNavigate()

  const [{ data }] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["declaracao", id],
        queryFn: async () => {
          const response = await request(`/api/admin/declaracoes/${id}`)
          return response.json()
        }
      }
    ]
  })

  const [showModal, setShowModal] = useState(false)

  const getDefaultTab = () => {
    if (data.museologico?.status) {
      return "museologico"
    } else if (data.bibliografico?.status) {
      return "bibliografico"
    } else if (data.arquivistico?.status) {
      return "arquivistico"
    } else {
      return "museologico"
    }
  }

  const [currentTab, setCurrentTab] = useState<
    "museologico" | "bibliografico" | "arquivistico" | "timeline"
  >(getDefaultTab())

  const [status, setStatus] = useState("")
  const [comment, setComment] = useState("")

  // Mutation para atualizar status e comentário
  const { mutate: atualizarStatus, isLoading: isUpdating } = useMutation({
    mutationFn: async () => {
      return request(`/api/admin/declaracoes/atualizar/${id}/${currentTab}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status, comentario: comment })
      })
    },
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!")
      window.location.reload()
    },
    onError: () => {
      toast.error("Erro ao atualizar status. Tente novamente.")
    }
  })

  const handleSave = () => {
    if (!status || !comment) {
      toast.error("Preencha todos os campos antes de confirmar.")
      return
    }
    atualizarStatus()
  }

  return (
    <DefaultLayout>
      <Link to="/declaracoes" className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
      <h2 className="mt-3 mb-0"> Finalizar análise da declaração</h2>
      <span className="br-tag mb-5">{data.status}</span>
      <div className="flex gap-4">
        {(data.museologico?.pendencias.length > 0 ||
          data.bibliografico?.pendencias.length > 0 ||
          data.arquivistico?.pendencias.length > 0) && (
          <>
            <a
              className="text-xl"
              href="#"
              onClick={() => setShowModal(true)}
              role="button"
            >
              <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>{" "}
              Visualizar pendências
            </a>
            <MismatchsModal
              opened={showModal}
              onClose={() => setShowModal(false)}
              museologicoErrors={data.museologico?.pendencias ?? []}
              bibliograficoErrors={data.bibliografico?.pendencias ?? []}
              arquivisticoErrors={data.arquivistico?.pendencias ?? []}
            />
          </>
        )}
      </div>
      <div className="flex gap-10 text-lg mt-5">
        <span>
          <span className="font-bold">Envio: </span>
          {format(data.dataCriacao, "dd/MM/yyyy 'às' HH:mm")}
        </span>
        <span>
          <span className="font-bold">Ano: </span>
          {data.anoDeclaracao}
        </span>
        <span>
          <span className="font-bold">Museu: </span>
          {data.museu_id.nome}
        </span>
      </div>
      <div className="br-tab mt-10" data-counter="true">
        <nav className="tab-nav">
          <ul>
            {data.museologico?.status &&
              data.museologico.status !== "Não enviada" && (
                <li
                  className={clsx(
                    "tab-item",
                    currentTab === "museologico" && "is-active"
                  )}
                  title="Acervo museológico"
                >
                  <button
                    type="button"
                    onClick={() => setCurrentTab("museologico")}
                  >
                    <span className="name">
                      Acervo museológico ({data.museologico?.quantidadeItens})
                    </span>
                  </button>
                </li>
              )}
            {data.bibliografico?.status &&
              data.bibliografico.status !== "Não enviada" && (
                <li
                  className={clsx(
                    "tab-item",
                    currentTab === "bibliografico" && "is-active"
                  )}
                  title="Acervo bibliográfico"
                >
                  <button
                    type="button"
                    onClick={() => setCurrentTab("bibliografico")}
                  >
                    <span className="name">
                      Acervo bibliográfico (
                      {data.bibliografico?.quantidadeItens})
                    </span>
                  </button>
                </li>
              )}
            {data.arquivistico?.status &&
              data.arquivistico.status !== "Não enviada" && (
                <li
                  className={clsx(
                    "tab-item",
                    currentTab === "arquivistico" && "is-active"
                  )}
                  title="Arcevo arquivístico"
                >
                  <button
                    type="button"
                    onClick={() => setCurrentTab("arquivistico")}
                  >
                    <span className="name">
                      Acervo arquivístico ({data.arquivistico?.quantidadeItens})
                    </span>
                  </button>
                </li>
              )}
          </ul>
        </nav>
        <div className="tab-content">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Select
                id="select-status"
                label="Situação"
                placeholder="Selecione uma situação"
                className="w-1/2"
                options={[
                  {
                    label: "Em conformidade",
                    value: "em conformidade"
                  },
                  {
                    label: "Não conformidade",
                    value: "nao conformidade"
                  }
                ]}
                onChange={(value) => setStatus(value)}
              />
              <a
                href={`/api/public/declaracoes/download/${data.museu_id._id}/${data.anoDeclaracao}/museologico`}
                className="mb-2"
              >
                <i className="fas fa-download" aria-hidden="true"></i> Baixar
                planilha
              </a>
            </div>

            <Textarea
              label="Observações"
              rows={4}
              className="w-full"
              style={{ minHeight: "100px" }}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
      </div>
      <Row justify-content="end" className="mt-4 gap-2 p-2">
        <Button
          secondary
          small
          type="button"
          onClick={() => navigate("/declaracoes")}
        >
          Cancelar
        </Button>
        <Button
          primary
          small
          type="button"
          onClick={handleSave}
          disabled={isUpdating}
        >
          {isUpdating ? "Salvando..." : "Confirmar"}
        </Button>
      </Row>
    </DefaultLayout>
  )
}
