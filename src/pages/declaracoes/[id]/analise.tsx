import { useSuspenseQueries } from "@tanstack/react-query"
import clsx from "clsx"
import { format } from "date-fns"
import { useState } from "react"
import { useParams, Link } from "react-router"
import { getColorStatus } from "../../../utils/colorStatus"
import request from "../../../utils/request"

import { Textarea } from "react-dsgov"

export default function DeclaracaoPage() {
  const params = useParams()
  const id = params.id!

  const [{ data }] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["declaracao", id],
        queryFn: async () => {
          const response = await request(`/api/public/declaracoes/${id}`)
          return response.json()
        }
      }
    ]
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

  return (
    <>
      <Link to={`/declaracoes/${data._id}`} className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
      <h2 className="mt-3 mb-0">
        Parecer técnico da declaração{" "}
        {data.retificacao ? `retificadora 0${data.versao - 1}` : "original"}
      </h2>
      <span className="br-tag" style={getColorStatus(data.status)}>
        {data.status}
      </span>
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
                    <span
                      className="br-tag"
                      style={getColorStatus(data.museologico?.status)}
                    >
                      {data.museologico?.status}
                    </span>
                  </span>
                  <a
                    href={`/api/public/declaracoes/download/${data.museu_id._id}/${data.anoDeclaracao._id}/museologico`}
                    className="mb-2"
                  >
                    <i className="fas fa-download" aria-hidden="true"></i>{" "}
                    Baixar planilha
                  </a>
                </div>
                {data.museologico.status !== "Recebida" && (
                  <Textarea
                    label="Parecer técnico sobre os bens museológicos"
                    rows={4}
                    className="w-full"
                    style={{ minHeight: "100px" }}
                    value={
                      data.museologico.comentarios.length > 0
                        ? data.museologico.comentarios[
                            data.museologico.comentarios.length - 1
                          ].mensagem
                        : ""
                    }
                    disabled
                  />
                )}
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
                    <span
                      className="br-tag"
                      style={getColorStatus(data.bibliografico?.status)}
                    >
                      {data.bibliografico?.status}
                    </span>
                  </span>
                  <a
                    href={`/api/public/declaracoes/download/${data.museu_id._id}/${data.anoDeclaracao._id}/bibliografico`}
                    className="mb-2"
                  >
                    <i className="fas fa-download" aria-hidden="true"></i>{" "}
                    Baixar planilha
                  </a>
                </div>
                {data.bibliografico.status !== "Recebida" && (
                  <Textarea
                    label="Parecer técnico sobre os bens bibliográficos"
                    rows={4}
                    className="w-full"
                    style={{ minHeight: "100px" }}
                    value={
                      data.bibliografico.comentarios.length > 0
                        ? data.bibliografico.comentarios[
                            data.bibliografico.comentarios.length - 1
                          ].mensagem
                        : ""
                    }
                    disabled
                  />
                )}
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
                    <span
                      className="br-tag"
                      style={getColorStatus(data.arquivistico?.status)}
                    >
                      {data.arquivistico?.status}
                    </span>
                  </span>
                  <a
                    href={`/api/public/declaracoes/download/${data.museu_id._id}/${data.anoDeclaracao._id}/arquivistico`}
                    className="mb-2"
                  >
                    <i className="fas fa-download" aria-hidden="true"></i>{" "}
                    Baixar planilha
                  </a>
                </div>
                {data.arquivistico.status !== "Recebida" && (
                  <Textarea
                    label="Parecer técnico sobre os bens arquivísticos"
                    rows={4}
                    className="w-full"
                    style={{ minHeight: "100px" }}
                    value={
                      data.arquivistico.comentarios.length > 0
                        ? data.arquivistico.comentarios[
                            data.arquivistico.comentarios.length - 1
                          ].mensagem
                        : ""
                    }
                    disabled
                  />
                )}
              </div>
            )}
        </div>
      </div>
    </>
  )
}
