import { Modal, Button } from "react-dsgov"

const museologicoFields = {
  nderegistro: "Nº de Registro",
  outrosnumeros: "Outros Números",
  situacao: "Situação",
  denominacao: "Denominação",
  titulo: "Título",
  autor: "Autor",
  classificacao: "Classificação",
  resumodescritivo: "Resumo Descritivo",
  dimensoes: "Dimensões",
  materialtecnica: "Material/Técnica",
  estadodeconservacao: "Estado de Conservação",
  localdeproducao: "Local de Produção",
  datadeproducao: "Data de produção",
  condicoesdereproducao: "Condições de Reprodução",
  midiasrelacionadas: "Mídias Relacionadas"
}

const bibliograficoFields = {
  nderegistro: "Nº de Registro",
  outrosnumeros: "Outros Números",
  situacao: "Situação",
  titulo: "Título",
  tipo: "Tipo",
  identificacaoderesponsabilidade: "Identificação da Responsabilidade",
  localdeproducao: "Local de Produção",
  editora: "Editora",
  datadeproducao: "Data de Produção",
  dimensaofisica: "Dimensão física",
  materialtecnica: "Material/Técnica",
  encadernacao: "Encadernação",
  resumodescritivo: "Resumo Descritivo",
  estadodeconservacao: "Estado de Conservação",
  assuntoprincipal: "Assunto Principal",
  assuntocronologico: "Assunto Cronológico",
  assuntogeografico: "Assunto Geográfico",
  condicoesdereproducao: "Condições de Reprodução",
  midiasrelacionadas: "Mídias Relacionadas"
}

const arquivisticoFields = {
  coddereferencia: "Código de Referência",
  titulo: "Título",
  data: "Data",
  niveldedescricao: "Nível de Descrição",
  dimensaoesuporte: "Dimensão e Suporte",
  nomedoprodutor: "Nome do Produtor",
  historiaadministrativabiografia: "História Administrativa/Biografia",
  historiaarquivistica: "História Arquivística",
  procedencia: "Procedência",
  ambitoeconteudo: "Âmbito e Conteúdo",
  sistemadearranjo: "Sistema de Arranjo",
  condicoesdereproducao: "Condições de Reprodução",
  existenciaelocalizacaodosoriginais: "Existência e Localização dos Originais",
  notassobreconservacao: "Notas sobre Conservação",
  pontosdeacessoeindexacaodeassuntos:
    "Pontos de Acesso e Indexação de Assuntos",
  midiasrelacionadas: "Mídias Relacionadas"
}

const MismatchsModal: React.FC<{
  opened: boolean
  onClose: () => void
  museologicoErrors: string[]
  bibliograficoErrors: string[]
  arquivisticoErrors: string[]
}> = ({
  opened,
  onClose,
  museologicoErrors,
  bibliograficoErrors,
  arquivisticoErrors
}) => {
  const handleScrimClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    // Verifica se o clique foi no scrim e não dentro do modal
    if (event.target === event.currentTarget) {
      onClose()
    }
  }
  return (
    <Modal
      useScrim
      modalOpened={opened}
      title="Resumo de pendências"
      showCloseButton
      onCloseButtonClick={() => onClose()}
      className="min-w-1/2"
      onClick={handleScrimClick}
    >
      <Modal.Body>
        <p className="text-gray-600 mb-6">
          Abaixo, seguem as pendências que foram encontradas no envio da
          declaração. Há linhas em que campos obrigatórios não foram
          preenchidos. Observe o resumo a seguir:
        </p>
        <table className="w-full table-auto border-collapse mb-6 shadow-sm">
          <thead className="bg-black">
            <tr>
              <th className="border-bottom" border-left scope="col">
                Tipo de Acervo
              </th>
              <th className="border-bottom" border-left scope="col">
                Campos não preenchidos
              </th>
            </tr>
          </thead>
          <tbody>
            {museologicoErrors.length > 0 && (
              <tr>
                <td className="border-right" scope="rowgroup">
                  Museológico
                </td>
                <td>
                  {museologicoErrors
                    .map(
                      (field) =>
                        `"${museologicoFields[field as keyof typeof museologicoFields] ?? field}"`
                    )
                    .join(", ")}
                </td>
              </tr>
            )}
            {bibliograficoErrors.length > 0 && (
              <tr>
                <td className="border-right" scope="rowgroup">
                  Bibliográfico
                </td>
                <td>
                  {bibliograficoErrors
                    .map(
                      (field) =>
                        `"${bibliograficoFields[field as keyof typeof bibliograficoFields]}"`
                    )
                    .join(", ")}
                </td>
              </tr>
            )}
            {arquivisticoErrors.length > 0 && (
              <tr>
                <td className="border-right" scope="rowgroup">
                  Arquivístico
                </td>
                <td>
                  {arquivisticoErrors
                    .map(
                      (field) =>
                        `"${arquivisticoFields[field as keyof typeof arquivisticoFields]}"`
                    )
                    .join(", ")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Modal.Body>
      <Modal.Footer justify-content="center">
        <Button primary onClick={onClose}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default MismatchsModal
