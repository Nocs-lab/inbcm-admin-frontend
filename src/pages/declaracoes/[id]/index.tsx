import { useParams } from "react-router"
import DefaultLayout from "../../../layouts/default"
import { useSuspenseQuery } from "@tanstack/react-query"
import request from "../../../utils/request"
import { format } from "date-fns"
import { Link } from "react-router-dom"

const DeclaracaoPage: React.FC = () => {
  const params = useParams()
  const id = params.id!

  const { data } = useSuspenseQuery({
    queryKey: ["declaracoes", id],
    queryFn: async () => {
      const response = await request(`/api/admin/declaracoes/${id}/timeline`)
      return response.json()
    }
  })

  return (
    <DefaultLayout>
      <Link to={`/declaracoes/${id}`} className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
      <div className="col-auto mx-5">
        <nav
          className="br-step vertical"
          data-initial="1"
          data-label="right"
          role="none"
        >
          <div
            className="step-progress"
            role="listbox"
            aria-orientation="vertical"
            aria-label="Lista de Opções"
          >
            {data.map(
              (item: {
                dataEvento: Date
                nomeEvento: string
                autorEvento: string
              }) => (
                <button
                  key={item.dataEvento.toISOString() + item.nomeEvento}
                  className="step-progress-btn"
                  role="option"
                  aria-posinset={3}
                  aria-setsize={3}
                  type="button"
                >
                  <span className="step-info text-left">
                    {item.nomeEvento}
                    <br /> Por {item.autorEvento} em{" "}
                    {format(data.dataCriacao, "dd/MM/yyyy 'às' HH:mm")}
                  </span>
                </button>
              )
            )}
          </div>
        </nav>
      </div>
    </DefaultLayout>
  )
}

export default DeclaracaoPage
