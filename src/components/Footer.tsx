import logoIbramBranco from "../images/logo-ibram-branco.png"
import logoIfrn from "../images/logo-ifrn.png"
import logoNocs from "../images/logo-nocs.png"

const Footer: React.FC = () => {
  const { data: versaoBackend } = useQuery({
    queryKey: ["version"],
    queryFn: async () => {
      const res = await fetch("/api/public")
      return res.headers.get("x-version")
    }
  })

  return (
    <footer className="br-footer mt-auto">
      <div className="container-lg">
        <div className="logo">
          <img src={logoIbramBranco} alt="Imagem" />
        </div>
        <div className="d-none d-sm-block">
          <div className="row align-items-end justify-content-between py-5">
            <div className="col">
              <div className="social-network">
                <div className="social-network-title">Redes Sociais</div>
                <div className="d-flex">
                  <a
                    className="br-button circle"
                    href="https://www.facebook.com/MuseusBR/"
                    aria-label="Compartilhar por Facebook"
                  >
                    <i className="fab fa-facebook-f" aria-hidden="true"></i>
                  </a>
                  <a
                    className="br-button circle"
                    href="https://www.youtube.com/channel/UCAUcQbl5S0_PPKYK2E-78Yw"
                    aria-label="Compartilhar por Youtube"
                  >
                    <i className="fab fa-youtube" aria-hidden="true"></i>
                  </a>
                  <a
                    className="br-button circle"
                    href="https://www.instagram.com/museusbr/"
                    aria-label="Compartilhar por Instagram"
                  >
                    <i className="fab fa-instagram" aria-hidden="true"></i>
                  </a>
                </div>
              </div>
            </div>
            <div className="col assigns flex items-center justify-center">
              Desenvolvido por:
              <img className="ml-4" src={logoNocs} alt="Imagem" />
              <img className="ml-4" src={logoIfrn} alt="Imagem" />
            </div>
          </div>
        </div>
      </div>
      <span className="br-divider my-3"></span>
      <div className="container-lg">
        <div className="info">
          <div className="text-down-01 text-medium pb-3">
            Versão do cliente: {import.meta.env.VITE_SHORT_SHA ?? "dev"} |
            Versão do servidor: {versaoBackend}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
