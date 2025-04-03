import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import clsx from "clsx"
import { format } from "date-fns"
import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router"
import { Select, Textarea, Row, Button, Modal } from "react-dsgov"
import MismatchsModal from "../../../components/MismatchsModal"
import request from "../../../utils/request"
import toast from "react-hot-toast"
import Upload from "../../../components/Upload"
import { z } from "zod"

const fileSchema = z.instanceof(File).refine(
  (file) => {
    const allowedExtensions = [".docx", ".doc", ".txt", ".pdf"]
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    return fileExtension && allowedExtensions.includes(`.${fileExtension}`)
  },
  {
    message: "O arquivo deve ser do tipo .docx, .doc, .txt ou .pdf."
  }
)

type Payload =
  | { statusBens: { museologico: { status: string; comentario: string } } }
  | { statusBens: { bibliografico: { status: string; comentario: string } } }
  | { statusBens: { arquivistico: { status: string; comentario: string } } }

export default function FinalizarAnalise() {
  const params = useParams()
  const id = params.id!
  const navigate = useNavigate()

  const { data } = useSuspenseQuery({
    queryKey: ["declaracao", id],
    queryFn: async () => {
      const response = await request(`/api/admin/declaracoes/${id}`)
      return response.json()
    }
  })

  const [showModal, setShowModal] = useState(false)
  const [modalConfirmar, setModalConfirmar] = useState(false)
  const [confirmPayload, setConfirmPayload] = useState(null)
  const [confirmTipo, setConfirmTipo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [fileMuseologico, setFileMuseologico] = useState<File | null>(null)
  const [fileBibliografico, setFileBibliografico] = useState<File | null>(null)
  const [fileArquivistico, setFileArquivistico] = useState<File | null>(null)

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { mutate: atualizarStatus, isPending: isUpdating } = useMutation({
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

  const openConfirmModal = (tipo: string, payload: Payload) => {
    setConfirmTipo(tipo)
    setConfirmPayload(payload)
    setModalConfirmar(true)
  }

  const handleUploadFile = async () => {
    let fileToUpload: File | null = null

    if (currentTab === "museologico") {
      fileToUpload = fileMuseologico
    } else if (currentTab === "bibliografico") {
      fileToUpload = fileBibliografico
    } else if (currentTab === "arquivistico") {
      fileToUpload = fileArquivistico
    }

    if (!fileToUpload) {
      toast.error("Nenhum arquivo selecionado.")
      return
    }

    try {
      fileSchema.parse(fileToUpload)
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message)
      } else {
        toast.error("Erro ao validar o arquivo.")
      }
      return
    }

    const formData = new FormData()
    formData.append(confirmTipo, fileToUpload)

    try {
      const response = await fetch(
        `/api/public/declaracoes/upload/analise/${id}/${confirmTipo}`,
        {
          method: "POST",
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error("Erro ao enviar o arquivo.")
      }

      toast.success("Arquivo enviado com sucesso!")
    } catch (error) {
      toast.error("Erro ao enviar o arquivo.")
    }
  }

  const handleConfirmarAnalise = async () => {
    if (!confirmPayload || !confirmTipo) {
      toast.error("Erro interno. Tente novamente.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `/api/admin/declaracoes/atualizarStatus/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(confirmPayload)
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao confirmar a análise.")
      }

      if (
        (currentTab === "museologico" && fileMuseologico) ||
        (currentTab === "bibliografico" && fileBibliografico) ||
        (currentTab === "arquivistico" && fileArquivistico)
      ) {
        await handleUploadFile()
      }

      toast.success("Análise confirmada com sucesso!")
      setModalConfirmar(false)
      window.location.reload()
    } catch (error) {
      toast.error("Erro ao enviar a análise.")
    } finally {
      setIsLoading(false)
    }
  }

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

    openConfirmModal("museologico", payload)
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

    openConfirmModal("bibliografico", payload)
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

    openConfirmModal("arquivistico", payload)
  }

  const renderFormFields = () => {
    if (currentTab === "museologico") {
      return (
        <>
          <div className="flex items-center justify-between">
            <span className="br-tag mb-5">{data.museologico.status}</span>
            <div className="flex justify-end gap-10">
              {data.museologico.analiseUrl && (
                <a
                  href={`/api/public/declaracoes/download/analise/${data._id}/museologico`}
                  className="text-xl"
                  role="button"
                >
                  <i className="fas fa-download" aria-hidden="true"></i> Baixar
                  arquivo complementar
                </a>
              )}
              <a
                href={`/api/public/declaracoes/download/${data.museu_id._id}/${data.anoDeclaracao._id}/museologico`}
                className="text-xl"
                role="button"
              >
                <i className="fas fa-download" aria-hidden="true"></i> Baixar
                planilha
              </a>
            </div>
          </div>

          {data.museologico.status === "Recebida" && (
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  id="select-status-museologico"
                  label="Situação do acervo museológico"
                  placeholder="Selecione um parecer"
                  className="w-full"
                  options={[
                    { label: "Em conformidade", value: "Em conformidade" },
                    { label: "Não conformidade", value: "Não conformidade" }
                  ]}
                  onChange={(value) => setStatusMuseologico(value)}
                  value={statusMuseologico}
                />
                <Upload
                  value={fileMuseologico}
                  onChange={(file) => {
                    setFileMuseologico(file)
                  }}
                  accept=".pdf,.doc,.docx,.txt"
                />
              </div>
            </div>
          )}

          <Textarea
            label=" Parecer técnico sobre os bens museológicos"
            rows={4}
            className="w-full"
            style={{ minHeight: "100px" }}
            value={
              data.museologico.status !== "Recebida"
                ? data.museologico.comentarios.length > 0
                  ? data.museologico.comentarios[
                      data.museologico.comentarios.length - 1
                    ].mensagem
                  : ""
                : commentMuseologico
            }
            disabled={data.museologico.status !== "Recebida"}
            onChange={(e) => setCommentMuseologico(e.target.value)}
          />
          {data.museologico.status === "Recebida" && (
            <Row justify-content="end" className="mt-4 gap-2 p-2">
              <Button
                secondary
                type="button"
                onClick={() => navigate("/analista")}
              >
                Cancelar
              </Button>
              <Button
                primary
                type="button"
                onClick={handleSaveMuseologico}
                disabled={isUpdating}
              >
                {isUpdating ? "Salvando..." : "Confirmar"}
              </Button>
            </Row>
          )}
        </>
      )
    } else if (currentTab === "bibliografico") {
      return (
        <>
          <div className="flex items-center justify-between">
            <span className="br-tag mb-5">{data.bibliografico.status}</span>
            <div className="flex justify-end gap-10">
              {data.bibliografico.analiseUrl && (
                <a
                  href={`/api/public/declaracoes/download/analise/${data._id}/bibliografico`}
                  className="text-xl"
                  role="button"
                >
                  <i className="fas fa-download" aria-hidden="true"></i> Baixar
                  arquivo complementar
                </a>
              )}
              <a
                href={`/api/public/declaracoes/download/${data.museu_id._id}/${data.anoDeclaracao}/bibliografico`}
                className="text-xl"
                role="button"
              >
                <i className="fas fa-download" aria-hidden="true"></i> Baixar
                planilha
              </a>
            </div>
          </div>

          {data.bibliografico.status === "Recebida" && (
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  id="select-status-bibliografico"
                  label="Situação do acervo bibliográfico"
                  placeholder="Selecione um parecer"
                  className="w-full"
                  options={[
                    { label: "Em conformidade", value: "Em conformidade" },
                    { label: "Não conformidade", value: "Não conformidade" }
                  ]}
                  onChange={(value) => setStatusBibliografico(value)}
                  value={statusBibliografico}
                />
                <Upload
                  value={fileBibliografico}
                  onChange={(file) => setFileBibliografico(file)}
                  accept=".pdf,.doc,.docx,.txt"
                />
              </div>
            </div>
          )}

          <Textarea
            label=" Parecer técnico sobre os bens bibliográficos"
            rows={4}
            className="w-full"
            style={{ minHeight: "100px" }}
            value={
              data.bibliografico.status !== "Recebida"
                ? data.bibliografico.comentarios.length > 0
                  ? data.bibliografico.comentarios[
                      data.bibliografico.comentarios.length - 1
                    ].mensagem
                  : ""
                : commentBibliografico
            }
            disabled={data.bibliografico.status !== "Recebida"}
            onChange={(e) => setCommentBibliografico(e.target.value)}
          />

          {data.bibliografico.status === "Recebida" && (
            <Row justify-content="end" className="mt-4 gap-2 p-2">
              <Button
                secondary
                type="button"
                onClick={() => navigate("/analista")}
              >
                Cancelar
              </Button>
              <Button
                primary
                type="button"
                onClick={handleSaveBibliografico}
                disabled={isUpdating}
              >
                {isUpdating ? "Salvando..." : "Confirmar"}
              </Button>
            </Row>
          )}
        </>
      )
    } else if (currentTab === "arquivistico") {
      return (
        <>
          <div className="flex items-center justify-between">
            <span className="br-tag mb-5">{data.arquivistico.status}</span>
            <div className="flex justify-end gap-10">
              {data.arquivistico.analiseUrl && (
                <a
                  href={`/api/public/declaracoes/download/analise/${data._id}/arquivistico`}
                  className="text-xl"
                  role="button"
                >
                  <i className="fas fa-download" aria-hidden="true"></i> Baixar
                  arquivo complementar
                </a>
              )}
              <a
                href={`/api/public/declaracoes/download/${data.museu_id._id}/${data.anoDeclaracao._id}/arquivistico`}
                className="text-xl"
                role="button"
              >
                <i className="fas fa-download" aria-hidden="true"></i> Baixar
                planilha
              </a>
            </div>
          </div>

          {data.arquivistico.status === "Recebida" && (
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  id="select-status-arquivistico"
                  label="Situação do acervo arquivístico"
                  placeholder="Selecione um parecer"
                  className="w-full"
                  options={[
                    { label: "Em conformidade", value: "Em conformidade" },
                    { label: "Não conformidade", value: "Não conformidade" }
                  ]}
                  onChange={(value) => setStatusArquivistico(value)}
                  value={statusArquivistico}
                />
                <Upload
                  value={fileArquivistico}
                  onChange={(file) => setFileArquivistico(file)}
                  accept=".pdf,.doc,.docx,.txt"
                />
              </div>
            </div>
          )}

          <Textarea
            label=" Parecer técnico sobre os bens arquivísticos"
            rows={4}
            className="w-full"
            style={{ minHeight: "100px" }}
            value={
              data.arquivistico.status !== "Recebida"
                ? data.arquivistico.comentarios.length > 0
                  ? data.arquivistico.comentarios[
                      data.arquivistico.comentarios.length - 1
                    ].mensagem
                  : ""
                : commentArquivistico
            }
            disabled={data.arquivistico.status !== "Recebida"}
            onChange={(e) => setCommentArquivistico(e.target.value)}
          />

          {data.arquivistico.status === "Recebida" && (
            <Row justify-content="end" className="mt-4 gap-2 p-2">
              <Button
                secondary
                type="button"
                onClick={() => navigate("/analista")}
              >
                Cancelar
              </Button>
              <Button
                primary
                type="button"
                onClick={handleSaveArquivistico}
                disabled={isUpdating}
              >
                {isUpdating ? "Salvando..." : "Confirmar"}
              </Button>
            </Row>
          )}
        </>
      )
    }
    return null
  }

  return (
    <>
      <Link to="/analista" className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
      <h2> Analisar declaração</h2>
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
              Resumo de pendências
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
        {(data.museologico?.pendencias.length > 0 ||
          data.bibliografico?.pendencias.length > 0 ||
          data.arquivistico?.pendencias.length > 0) && (
          <>
            <a
              className="text-xl"
              href={`/api/public/recibo/detalhamento/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              role="button"
            >
              <i
                className="fas fa-file-circle-exclamation"
                aria-hidden="true"
              ></i>{" "}
              Relatório de pendências
            </a>
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
          {data.anoDeclaracao.ano}
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
      {modalConfirmar && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <Modal
            title="Confirmar análise"
            showCloseButton
            onCloseButtonClick={() => setModalConfirmar(false)}
          >
            <Modal.Body>
              Tem certeza de que deseja confimar a análise da declaração{" "}
              <b>{confirmTipo}</b>?
              {fileMuseologico && (
                <p>
                  • Arquivo museológico selecionado:{"·"}
                  <b>{fileMuseologico.name}</b>
                </p>
              )}
              {fileBibliografico && (
                <p>
                  • Arquivo bibliográfico selecionado:{"·"}
                  <b>{fileBibliografico.name}</b>
                </p>
              )}
              {fileArquivistico && (
                <p>
                  • Arquivo arquivístico selecionado:{"·"}
                  <b>{fileArquivistico.name}</b>
                </p>
              )}
            </Modal.Body>
            <Modal.Footer justify-content="end">
              <div className="flex gap-2">
                <Button
                  secondary
                  small
                  onClick={() => setModalConfirmar(false)}
                >
                  Cancelar
                </Button>
                <Button
                  primary
                  small
                  onClick={handleConfirmarAnalise}
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : "Confirmar"}
                </Button>
              </div>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </>
  )
}
