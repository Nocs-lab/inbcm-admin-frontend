import { useSuspenseQuery, useMutation } from "@tanstack/react-query"
import { useParams, Link, useNavigate } from "react-router"
import { useState, useEffect } from "react"
import request from "../../../../utils/request"
import { Select, Row, Col, Button, Modal } from "react-dsgov"
import { format } from "date-fns"
import toast from "react-hot-toast"

const EnviarParaAnalise: React.FC = () => {
  const params = useParams()
  const id = params.id!
  const navigate = useNavigate()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: declaracao } = useSuspenseQuery({
    queryKey: ["declaracoes", id],
    queryFn: async () => {
      const response = await request(`/api/admin/declaracoes/${id}`)
      return response.json()
    }
  })

  const [analistas, setAnalistas] = useState({
    museologico: [],
    bibliografico: [],
    arquivistico: []
  })

  const [analistaSelecionado, setAnalistaSelecionado] = useState({
    museologico: "",
    bibliografico: "",
    arquivistico: ""
  })

  useEffect(() => {
    const fetchAnalistas = async () => {
      try {
        const [museologico, bibliografico, arquivistico] = await Promise.all([
          request(
            "/api/admin/declaracoes/analistas?especificidade=museologico"
          ).then((res) => res.json()),
          request(
            "/api/admin/declaracoes/analistas?especificidade=bibliografico"
          ).then((res) => res.json()),
          request(
            "/api/admin/declaracoes/analistas?especificidade=arquivistico"
          ).then((res) => res.json())
        ])

        setAnalistas({ museologico, bibliografico, arquivistico })

        setAnalistaSelecionado({
          museologico: museologico[0]?._id || "",
          bibliografico: bibliografico[0]?._id || "",
          arquivistico: arquivistico[0]?._id || ""
        })
      } catch (error) {
        toast.error("Erro ao buscar analistas.")
      }
    }

    fetchAnalistas()
  }, [])

  const handleAnalistaChange = (tipo: string, value: string) => {
    setAnalistaSelecionado((prev) => ({
      ...prev,
      [tipo]: value
    }))
  }

  const { mutate: enviarAnalise, isPending } = useMutation({
    mutationFn: async () => {
      // Filtrar apenas os analistas que estão presentes na declaração e com status "Recebida"
      const analistasSelecionados = {
        ...(declaracao?.museologico &&
          declaracao?.museologico.status === "Recebida" && {
            museologico: [analistaSelecionado.museologico].filter(Boolean)
          }),
        ...(declaracao?.bibliografico &&
          declaracao?.bibliografico.status === "Recebida" && {
            bibliografico: [analistaSelecionado.bibliografico].filter(Boolean)
          }),
        ...(declaracao?.arquivistico &&
          declaracao?.arquivistico.status === "Recebida" && {
            arquivistico: [analistaSelecionado.arquivistico].filter(Boolean)
          })
      }

      const response = await request(`/api/admin/declaracoes/${id}/analises`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ analistas: analistasSelecionados })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message)
      }
    },

    onSuccess: () => {
      toast.success("Declaração enviada para análise com sucesso!")
      navigate("/declaracoes")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao enviar a declaração para análise")
    }
  })

  const handleConfirmarEnvio = () => {
    setIsModalOpen(true)
  }

  const handleModalConfirm = () => {
    setIsModalOpen(false)
    enviarAnalise()
  }

  const handleModalCancel = () => {
    setIsModalOpen(false)
  }

  // Função para obter os nomes dos analistas selecionados
  const getNomesAnalistas = () => {
    const nomesUnicos = new Set<string>()

    // Verifica se o tipo de analista está presente na declaração e com status "Recebida"
    if (
      declaracao?.museologico &&
      declaracao?.museologico.status === "Recebida" &&
      analistaSelecionado.museologico
    ) {
      const analista = analistas.museologico.find(
        (a) => a._id === analistaSelecionado.museologico
      )
      if (analista) nomesUnicos.add(analista.nome)
    }
    if (
      declaracao?.bibliografico &&
      declaracao?.bibliografico.status === "Recebida" &&
      analistaSelecionado.bibliografico
    ) {
      const analista = analistas.bibliografico.find(
        (a) => a._id === analistaSelecionado.bibliografico
      )
      if (analista) nomesUnicos.add(analista.nome)
    }
    if (
      declaracao?.arquivistico &&
      declaracao?.arquivistico.status === "Recebida" &&
      analistaSelecionado.arquivistico
    ) {
      const analista = analistas.arquivistico.find(
        (a) => a._id === analistaSelecionado.arquivistico
      )
      if (analista) nomesUnicos.add(analista.nome)
    }

    const nomesArray = Array.from(nomesUnicos)

    if (nomesArray.length === 0) return ""
    if (nomesArray.length === 1) return nomesArray[0]
    return `${nomesArray.slice(0, -1).join(", ")} e ${nomesArray[nomesArray.length - 1]}`
  }

  return (
    <>
      <Link to="/declaracoes" className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
      <h2>Enviar declaração para análise</h2>
      <span className="br-tag mb-5">{declaracao.status}</span>
      <div className="flex gap-10 text-lg mb-5">
        <span>
          <span className="font-bold">Envio: </span>
          {format(declaracao.dataCriacao, "dd/MM/yyyy 'às' HH:mm")}{" "}
        </span>
        <span>
          <span className="font-bold">Ano: </span>
          {declaracao.anoDeclaracao.ano}
        </span>
        <span>
          <span className="font-bold">Museu: </span>
          {declaracao.museu_id.nome}
        </span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleConfirmarEnvio()
        }}
      >
        <Row>
          {declaracao?.museologico &&
            declaracao?.museologico.status === "Recebida" && (
              <Col>
                <Select
                  id="select-museologico"
                  label="Analista museológico"
                  placeholder="Selecione um analista"
                  options={analistas.museologico.map(
                    (analista: { nome: string; _id: string }) => ({
                      label: analista.nome,
                      value: analista._id
                    })
                  )}
                  value={analistaSelecionado.museologico}
                  onChange={(value) =>
                    handleAnalistaChange("museologico", value)
                  }
                />
              </Col>
            )}
          {declaracao?.bibliografico &&
            declaracao?.bibliografico.status === "Recebida" && (
              <Col>
                <Select
                  id="select-bibliografico"
                  label="Analista bibliográfico"
                  placeholder="Selecione um analista"
                  options={analistas.bibliografico.map(
                    (analista: { nome: string; _id: string }) => ({
                      label: analista.nome,
                      value: analista._id
                    })
                  )}
                  value={analistaSelecionado.bibliografico}
                  onChange={(value) =>
                    handleAnalistaChange("bibliografico", value)
                  }
                />
              </Col>
            )}
          {declaracao?.arquivistico &&
            declaracao?.arquivistico.status === "Recebida" && (
              <Col>
                <Select
                  id="select-arquivistico"
                  label="Analista arquivístico"
                  placeholder="Selecione um analista"
                  options={analistas.arquivistico.map(
                    (analista: { nome: string; _id: string }) => ({
                      label: analista.nome,
                      value: analista._id
                    })
                  )}
                  value={analistaSelecionado.arquivistico}
                  onChange={(value) =>
                    handleAnalistaChange("arquivistico", value)
                  }
                />
              </Col>
            )}
        </Row>
        <Row justify-content="end" className="mt-4 gap-2 p-2">
          <Button
            secondary
            type="button"
            onClick={() => navigate("/declaracoes")}
          >
            Cancelar
          </Button>
          <Button primary type="submit" loading={isPending}>
            Confirmar
          </Button>
        </Row>
      </form>
      {/* Modal de Confirmação */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <Modal
            title="Confirmar envio para análise"
            showCloseButton
            onCloseButtonClick={handleModalCancel}
          >
            <Modal.Body>
              Deseja, realmente, enviar a declaração do ano{" "}
              <b>{declaracao.anoDeclaracao.ano}</b> do museu{" "}
              <b>{declaracao.museu_id.nome}</b> para o(s) analista(s){" "}
              <b>{getNomesAnalistas()}</b>?
            </Modal.Body>
            <Modal.Footer justify-content="end">
              <div className="flex gap-2">
                <Button secondary small onClick={handleModalCancel}>
                  Cancelar
                </Button>
                <Button primary small onClick={handleModalConfirm}>
                  Confirmar
                </Button>
              </div>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </>
  )
}

export default EnviarParaAnalise
