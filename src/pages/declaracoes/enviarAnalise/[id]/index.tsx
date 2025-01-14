import DefaultLayout from "../../../../layouts/default"
import { useSuspenseQuery, useMutation } from "@tanstack/react-query"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import useHttpClient from "../../../../utils/request"
import { Select, Row, Col, Button } from "react-dsgov"
import { format } from "date-fns"
import toast from "react-hot-toast"

const EnviarParaAnalise: React.FC = () => {
  const params = useParams()
  const id = params.id!
  const navigate = useNavigate()
  const request = useHttpClient()

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
      // Filtrar apenas os analistas que estão presentes na declaração
      const analistasSelecionados = {
        ...(declaracao?.museologico && {
          museologico: [analistaSelecionado.museologico].filter(Boolean)
        }),
        ...(declaracao?.bibliografico && {
          bibliografico: [analistaSelecionado.bibliografico].filter(Boolean)
        }),
        ...(declaracao?.arquivistico && {
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
  return (
    <DefaultLayout>
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
          {declaracao.anoDeclaracao}
        </span>
        <span>
          <span className="font-bold">Museu: </span>
          {declaracao.museu_id.nome}
        </span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          enviarAnalise()
        }}
      >
        <Row>
          {declaracao?.museologico && (
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
                onChange={(value) => handleAnalistaChange("museologico", value)}
              />
            </Col>
          )}
          {declaracao?.bibliografico && (
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
          {declaracao?.arquivistico && (
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
    </DefaultLayout>
  )
}

export default EnviarParaAnalise
