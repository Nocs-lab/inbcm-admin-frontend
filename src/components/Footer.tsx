import logoIbramBranco from "../images/Logotipo _IBRAM_Branco.png"
import logoIfrn from "../images/logo-ifrn.png"
import logoNocs from "../images/logo-nocs.png"

const Footer: React.FC = () => {
  return (
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
    </footer>
  )
}

export default Footer
