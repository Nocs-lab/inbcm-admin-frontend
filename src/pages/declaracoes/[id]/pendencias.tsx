import { useSuspenseQuery } from "@tanstack/react-query"
import clsx from "clsx"
import { format } from "date-fns"
import { useState } from "react"
import { useParams } from "react-router"
import { Link } from "react-router"
import MismatchsModal from "../../../components/MismatchsModal"
import TablePendencias from "../../../components/TablePendencias"
import request from "../../../utils/request"

export default function PendenciaPage() {
  const params = useParams()
  const id = params.id!

  const { data } = useSuspenseQuery({
    queryKey: ["declaracao", id],
    queryFn: async () => {
      const response = await request(`/api/admin/declaracoes/${id}`)
      return response.json()
    }
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

  return (
    <>
      <Link to={`/declaracoes/${id}`} className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
      <h2 className="mt-3 mb-0">
        Listagem de pendências da declaração{" "}
        {data.retificacao ? `retificadora 0${data.versao - 1}` : "original"}
      </h2>
      <span className="br-tag mb-5">{data.status}</span>

      <div className="flex flex-wrap gap-2 text-xl xl:text-xl md:text-xl">
        {(data.museologico?.pendencias?.length > 0 ||
          data.bibliografico?.pendencias?.length > 0 ||
          data.arquivistico?.pendencias?.length > 0) && (
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
      </div>
      <div className="flex gap-10 text-lg mt-5">
        <span>
          <span className="font-bold">Envio: </span>
          {format(data.dataCriacao, "dd/MM/yyyy HH:mm")}
        </span>
        <span>
          <span className="font-bold">Ano: </span>
          {data.anoDeclaracao.ano}
        </span>
        <span>
          <span className="font-bold">Museu: </span>
          {data.museu_id.nome}
        </span>
        <span>
          <span className="font-bold">Enviado por: </span>
          {data.responsavelEnvioNome}
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
                      Acervo museológico ({data.museologico.pendencias.length})
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
                      {data.bibliografico?.pendencias.length})
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
                      Acervo arquivístico({data.arquivistico?.pendencias.length}
                      )
                    </span>
                  </button>
                </li>
              )}
          </ul>
        </nav>
        <div className="tab-content">
          {data.museologico?.status &&
            data.museologico.status !== "Não enviada" && (
              <div
                className={clsx(
                  "tab-panel",
                  currentTab === "museologico" && "active"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="mb-3 flex items-center justify-start gap-1">
                    <span className="br-tag">{data.museologico?.status}</span>
                  </span>
                  <a
                    href={`/api/public/declaracoes/download/${data.museu_id._id}/${data.anoDeclaracao._id}/museologico`}
                    className="text-xl"
                    role="button"
                  >
                    <i className="fas fa-download" aria-hidden="true"></i>{" "}
                    Baixar planilha
                  </a>
                </div>
                <TablePendencias acervo="museologico" idDeclaracao={data._id} />
              </div>
            )}
          {data.bibliografico?.status &&
            data.bibliografico.status !== "Não enviada" && (
              <div
                className={clsx(
                  "tab-panel",
                  currentTab === "bibliografico" && "active"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="mb-3 flex items-center justify-start gap-1">
                    <span className="br-tag">{data.bibliografico?.status}</span>
                  </span>
                  <div className="flex justify-end gap-4">
                    <a
                      href={`/api/public/declaracoes/download/${data.museu_id._id}/${data.anoDeclaracao._id}/bibliografico`}
                      className="text-xl"
                      role="button"
                    >
                      <i className="fas fa-download" aria-hidden="true"></i>{" "}
                      Baixar planilha
                    </a>
                  </div>
                </div>
                <TablePendencias
                  acervo="bibliografico"
                  idDeclaracao={data._id}
                />
              </div>
            )}
          {data.arquivistico?.status &&
            data.arquivistico.status !== "Não enviada" && (
              <div
                className={clsx(
                  "tab-panel",
                  currentTab === "arquivistico" && "active"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="mb-3 flex items-center justify-start gap-1">
                    <span className="br-tag">{data.arquivistico?.status}</span>
                  </span>
                  <div className="flex justify-end gap-4">
                    <a
                      href={`/api/public/declaracoes/download/${data.museu_id._id}/${data.anoDeclaracao._id}/arquivistico`}
                      className="text-xl"
                      role="button"
                    >
                      <i className="fas fa-download" aria-hidden="true"></i>{" "}
                      Baixar planilha
                    </a>
                  </div>
                </div>
                <TablePendencias
                  acervo="arquivistico"
                  idDeclaracao={data._id}
                />
              </div>
            )}
        </div>
      </div>
    </>
  )
}
