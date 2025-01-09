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

export default function FinalizarAnalise() {
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

  const { mutate: assinarDeclaracao } = useMutation({
    mutationFn: async ({ tipo }: { tipo: string }) => {
      const response = await fetch(
        `/api/admin/declaracoes/alterar-analistas/${id}/${tipo}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao assinar a declaração")
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success("Declaração assinada com sucesso!")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao assinar a declaração")
    }
  })

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

  const [statusMuseologico, setStatusMuseologico] = useState("")
  const [commentMuseologico, setCommentMuseologico] = useState("")
  const [statusBibliografico, setStatusBibliografico] = useState("")
  const [commentBibliografico, setCommentBibliografico] = useState("")
  const [statusArquivistico, setStatusArquivistico] = useState("")
  const [commentArquivistico, setCommentArquivistico] = useState("")

  const { mutate: atualizarStatus, isLoading: isUpdating } = useMutation({
    mutationFn: async (payload) => {
      const response = await fetch(
        `/api/admin/declaracoes/atualizarStatus/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      )
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro desconhecido")
      }
      return response.json()
    },
    onSuccess: () => {
      window.location.reload()
      toast.success("Status atualizado com sucesso!")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar status")
    }
  })

  const handleSaveMuseologico = () => {
    if (!statusMuseologico || !commentMuseologico) {
      toast.error("Preencha todos os campos antes de confirmar.")
      return
    }

    const payload = {
      statusBens: {
        museologico: {
          status: statusMuseologico,
          comentario: commentMuseologico
        }
      }
    }

    atualizarStatus(payload)
  }

  const handleSaveBibliografico = () => {
    if (!statusBibliografico || !commentBibliografico) {
      toast.error("Preencha todos os campos antes de confirmar.")
      return
    }

    const payload = {
      statusBens: {
        bibliografico: {
          status: statusBibliografico,
          comentario: commentBibliografico
        }
      }
    }

    atualizarStatus(payload)
  }

  const handleSaveArquivistico = () => {
    if (!statusArquivistico || !commentArquivistico) {
      toast.error("Preencha todos os campos antes de confirmar.")
      return
    }

    const payload = {
      statusBens: {
        arquivistico: {
          status: statusArquivistico,
          comentario: commentArquivistico
        }
      }
    }

    atualizarStatus(payload)
  }

  const renderFormFields = () => {
    if (currentTab === "museologico") {
      return (
        <>
          <div className="flex text-lg items-center justify-between">
            <span>
              <span className="font-bold">Analista museológico: </span>
              {data.museologico.analistasResponsaveisNome}
            </span>
            <div className="flex gap-10">
              <a
                className="text-xl"
                href="#"
                onClick={() => assinarDeclaracao({ tipo: "museologico" })}
                role="button"
              >
                <i
                  className="fa-solid fa-file-signature"
                  aria-hidden="true"
                ></i>{" "}
                Assinar declaração
              </a>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Select
              id="select-status-museologico"
              label="Parecer de bens museológicos"
              placeholder="Selecione um parecer"
              className="w-1/2"
              options={[
                { label: "Em conformidade", value: "Em conformidade" },
                { label: "Não conformidade", value: "Não conformidade" }
              ]}
              onChange={(value) => setStatusMuseologico(value)}
              value={statusMuseologico}
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
            label="Despacho do acervo museológico"
            rows={4}
            className="w-full"
            style={{ minHeight: "100px" }}
            value={commentMuseologico}
            onChange={(e) => setCommentMuseologico(e.target.value)}
          />
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
              onClick={handleSaveMuseologico}
              disabled={isUpdating}
            >
              {isUpdating ? "Salvando..." : "Confirmar"}
            </Button>
          </Row>
        </>
      )
    } else if (currentTab === "bibliografico") {
      return (
        <>
          <div className="flex text-lg items-center justify-between">
            <span>
              <span className="font-bold">Analista bibliográfico: </span>
              {data.bibliografico.analistasResponsaveisNome}
            </span>
            <div className="flex gap-10">
              <a
                className="text-xl"
                href="#"
                onClick={() => assinarDeclaracao({ tipo: "bibliografico" })}
                role="button"
              >
                <i
                  className="fa-solid fa-file-signature"
                  aria-hidden="true"
                ></i>{" "}
                Assinar declaração
              </a>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Select
              id="select-status-bibliografico"
              label="Parecer de bens bibliográficos"
              placeholder="Selecione um parecer"
              className="w-1/2"
              options={[
                { label: "Em conformidade", value: "Em conformidade" },
                { label: "Não conformidade", value: "Não conformidade" }
              ]}
              onChange={(value) => setStatusBibliografico(value)}
              value={statusBibliografico}
            />
            <a
              href={`/api/public/declaracoes/download/${data.museu_id._id}/${data.anoDeclaracao}/bibliografico`}
              className="mb-2"
            >
              <i className="fas fa-download" aria-hidden="true"></i> Baixar
              planilha
            </a>
          </div>
          <Textarea
            label="Despacho do acervo bibliográfico"
            rows={4}
            className="w-full"
            style={{ minHeight: "100px" }}
            value={commentBibliografico}
            onChange={(e) => setCommentBibliografico(e.target.value)}
          />
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
              onClick={handleSaveBibliografico}
              disabled={isUpdating}
            >
              {isUpdating ? "Salvando..." : "Confirmar"}
            </Button>
          </Row>
        </>
      )
    } else if (currentTab === "arquivistico") {
      return (
        <>
          <div className="flex text-lg items-center justify-between">
            <span>
              <span className="font-bold">Analista arquivístico: </span>
              {data.arquivistico.analistasResponsaveisNome}
            </span>
            <div className="flex gap-10">
              <a
                className="text-xl"
                href="#"
                onClick={() => assinarDeclaracao({ tipo: "arquivistico" })}
                role="button"
              >
                <i
                  className="fa-solid fa-file-signature"
                  aria-hidden="true"
                ></i>{" "}
                Assinar declaração
              </a>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Select
              id="select-status-arquivistico"
              label="Parecer de bens arquivísticos"
              placeholder="Selecione um parecer"
              className="w-1/2"
              options={[
                { label: "Em conformidade", value: "Em conformidade" },
                { label: "Não conformidade", value: "Não conformidade" }
              ]}
              onChange={(value) => setStatusArquivistico(value)}
              value={statusArquivistico}
            />
            <a
              href={`/api/public/declaracoes/download/${data.museu_id._id}/${data.anoDeclaracao}/arquivistico`}
              className="mb-2"
            >
              <i className="fas fa-download" aria-hidden="true"></i> Baixar
              planilha
            </a>
          </div>
          <Textarea
            label="Despacho do acervo arquivístico"
            rows={4}
            className="w-full"
            style={{ minHeight: "100px" }}
            value={commentArquivistico}
            onChange={(e) => setCommentArquivistico(e.target.value)}
          />
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
              onClick={handleSaveArquivistico}
              disabled={isUpdating}
            >
              {isUpdating ? "Salvando..." : "Confirmar"}
            </Button>
          </Row>
        </>
      )
    }
    return null
  }

  return (
    <DefaultLayout>
      <Link to="/declaracoes" className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
      <h2> Finalizar análise da declaração</h2>
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
            <a
              className="text-xl"
              href="#"
              onClick={() => navigate(`/declaracoes/enviarAnalise/${id}`)}
              role="button"
            >
              <i className="fa-solid fa-clipboard-user" aria-hidden="true"></i>{" "}
              Alterar analista
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
            <div className="tab-content">
              <div className="flex flex-col gap-4">{renderFormFields()}</div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}
