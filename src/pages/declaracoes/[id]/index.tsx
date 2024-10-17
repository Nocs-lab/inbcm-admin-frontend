import { useParams } from "react-router"
import DefaultLayout from "../../../layouts/default"
import { useSuspenseQuery } from "@tanstack/react-query"
import request from "../../../utils/request"

const DeclaracaoPage: React.FC = () => {
  const params = useParams()
  const id = params.id!

  const { data } = useSuspenseQuery({
    queryKey: ["declaracoes", id],
    queryFn: async () => {
      const response = await request(`/api/admin/declaracoes/${id}`);
      return response.json();
    },
  });

  console.log(data)

  return (
    <DefaultLayout>
      <h1>Declaração #{id}</h1>
      <div className="col-auto mx-5">
        <nav className="br-step vertical" data-initial="1" data-label="right" role="none">
          <div className="step-progress" role="listbox" aria-orientation="vertical" aria-label="Lista de Opções">
            <button className="step-progress-btn" role="option" aria-posinset={3} aria-setsize={3} type="button" disabled><span className="step-info text-left opacity-50">Aguardando finalização da análise</span></button>
            <button className="step-progress-btn" role="option" aria-posinset={1} aria-setsize={3} type="button"><span className="step-info text-left">Declaração em análise<br/>Por Vitor Daniel</span></button>
            <button className="step-progress-btn" role="option" aria-posinset={2} aria-setsize={3} type="button"><span className="step-info text-left">Declarção enviada para análise <br/>Por Vitor Daniel</span></button>
            <button className="step-progress-btn" role="option" aria-posinset={3} aria-setsize={3} type="button"><span className="step-info text-left">Declaração recebida<br/>Por Vitor Daniel</span></button>
            <button className="step-progress-btn" role="option" aria-posinset={3} aria-setsize={3} type="button"><span className="step-info text-left">Declaração enviada<br/>Por Vitor Daniel</span></button>
          </div>
        </nav>
      </div>
    </DefaultLayout>
  )
}

export default DeclaracaoPage
