import { useState, useEffect } from "react"
import { Modal, Button } from "react-dsgov"
import logoIbramBranco from "../images/Logotipo _IBRAM_Branco.png"
import logoIfrn from "../images/logo-ifrn.png"
import logoNocs from "../images/logo-nocs.png"

interface Release {
  versao: string
  data: string
  novidades: string[]
  bugs: string[]
}

interface VersionData {
  versao: string
  releases: Release[]
}

const Footer: React.FC = () => {
  const [versionData, setVersionData] = useState<VersionData | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [expandido, setExpandido] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/version.json?t=${Date.now()}`)
      .then((r) => r.json())
      .then(setVersionData)
      .catch(() => {})
  }, [])

  const toggleExpand = (versao: string) => {
    setExpandido((prev) => (prev === versao ? null : versao))
  }

  return (
    <>
      {versionData && (
        <Modal
          useScrim
          showCloseButton
          title="Novidades e Correções"
          modalOpened={modalAberto}
          onCloseButtonClick={() => setModalAberto(false)}
          className="large"
        >
          <Modal.Body>
            <table className="w-full table-auto border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 w-8"></th>
                  <th className="p-2">Versão</th>
                  <th className="p-2">Data</th>
                  <th className="p-2 text-right">Novidades</th>
                  <th className="p-2 text-right">Correções</th>
                </tr>
              </thead>
              <tbody>
                {versionData.releases.map((release) => (
                  <>
                    <tr
                      key={release.versao}
                      className="border-t cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleExpand(release.versao)}
                    >
                      <td className="p-2 text-center">
                        <i
                          className={`fas ${expandido === release.versao ? "fa-chevron-down" : "fa-chevron-right"} text-xs text-gray-400`}
                        />
                      </td>
                      <td className="p-2 font-medium">
                        v{release.versao}
                        {release.versao === versionData.versao && (
                          <i
                            className="fas fa-check-circle text-green-600 ml-2"
                            title="Versão atual"
                          />
                        )}
                      </td>
                      <td className="p-2 text-gray-500">{release.data}</td>
                      <td className="p-2 text-right text-green-700 font-medium">
                        {release.novidades.length}
                      </td>
                      <td className="p-2 text-right text-gray-600 font-medium">
                        {release.bugs.length}
                      </td>
                    </tr>
                    {expandido === release.versao && (
                      <tr key={`${release.versao}-detail`}>
                        <td colSpan={5} className="px-6 py-3 border-b">
                          <ul className="space-y-1">
                            {release.novidades.map((item, i) => (
                              <li key={i} className="text-green-600 text-sm">
                                + {item}
                              </li>
                            ))}
                            {release.bugs.map((item, i) => (
                              <li key={i} className="text-gray-800 text-sm">
                                • {item}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </Modal.Body>
          <Modal.Footer justify-content="end">
            <Button primary onClick={() => setModalAberto(false)}>
              Fechar
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <footer className="br-footer mt-auto">
        <div className="container-lg">
          <div className="logo">
            <img
              src={logoIbramBranco}
              alt="Imagem"
              style={{
                maxWidth: "300px",
                maxHeight: "100px",
                width: "auto",
                height: "auto"
              }}
            />
          </div>
          <div className="d-none d-sm-block">
            <div className="row align-items-end justify-content-between py-5">
              <div className="col">
                <div className="social-network ml-11">
                  <div className="social-network-title">Redes Sociais</div>
                  <div className="d-flex">
                    <a
                      className="br-button circle"
                      href="https://www.facebook.com/MuseusBR/"
                      aria-label="Compartilhar por Facebook"
                      target="_blank"
                    >
                      <i className="fab fa-facebook-f" aria-hidden="true"></i>
                    </a>
                    <a
                      className="br-button circle"
                      href="https://www.youtube.com/channel/UCAUcQbl5S0_PPKYK2E-78Yw"
                      aria-label="Compartilhar por Youtube"
                      target="_blank"
                    >
                      <i className="fab fa-youtube" aria-hidden="true"></i>
                    </a>
                    <a
                      className="br-button circle"
                      href="https://www.instagram.com/museusbr/"
                      aria-label="Compartilhar por Instagram"
                      target="_blank"
                    >
                      <i className="fab fa-instagram" aria-hidden="true"></i>
                    </a>
                  </div>
                </div>
              </div>
              <div className="col assigns flex items-center justify-center">
                Desenvolvido por:
                <a href="https://nocs.ifrn.edu.br/" target="_blank">
                  <img className="ml-4" src={logoNocs} alt="Imagem" />
                </a>
                <a
                  href="https://portal.ifrn.edu.br/campus/parnamirim/"
                  target="_blank"
                >
                  <img className="ml-4" src={logoIfrn} alt="Imagem" />
                </a>
              </div>
            </div>
          </div>

          {versionData && (
            <div className="text-center py-1">
              <button
                type="button"
                className="br-button tertiary small text-xs opacity-60"
                onClick={() => setModalAberto(true)}
              >
                v{versionData.versao} — ver novidades
              </button>
            </div>
          )}
        </div>

        <span className="br-divider my-3"></span>
      </footer>
    </>
  )
}

export default Footer
