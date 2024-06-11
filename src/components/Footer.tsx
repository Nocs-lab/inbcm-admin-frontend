import logoIbramBranco from '../images/logo-ibram-branco.png';
import logoIfrn from '../images/logo-ifrn.png';
import logoNocs from '../images/logo-nocs.png';

const Footer: React.FC = () => {
  return (
    <footer className="br-footer">
      <div className="container-lg">
        <div className="logo"><img src={logoIbramBranco} alt="Imagem"/></div>
        <div className="br-list horizontal" data-toggle="data-toggle" data-sub="data-sub">
          <div className="col-2"><a className="br-item header" href="javascript:void(0)">
              <div className="content text-down-01 text-bold text-uppercase">Categoria 1</div>
              <div className="support"><i className="fas fa-angle-down" aria-hidden="true"></i>
              </div></a>
            <div className="br-list"><span className="br-divider d-md-none"></span><a className="br-item" href="javascript:void(0)">
                <div className="content">Deserunt</div></a><a className="br-item" href="javascript:void(0)">
                <div className="content">Deserunt</div></a><span className="br-divider d-md-none"></span>
            </div>
          </div>
          <div className="col-2"><a className="br-item header" href="javascript:void(0)">
              <div className="content text-down-01 text-bold text-uppercase">Categoria 2</div>
              <div className="support"><i className="fas fa-angle-down" aria-hidden="true"></i>
              </div></a>
            <div className="br-list"><span className="br-divider d-md-none"></span><a className="br-item" href="javascript:void(0)">
                <div className="content">Deserunt</div></a><a className="br-item" href="javascript:void(0)">
                <div className="content">Ad deserunt nostrud</div></a><a className="br-item" href="javascript:void(0)">
                <div className="content">Est ex deserunt</div></a><span className="br-divider d-md-none"></span>
            </div>
          </div>
          <div className="col-2"><a className="br-item header" href="javascript:void(0)">
              <div className="content text-down-01 text-bold text-uppercase">Categoria 3</div>
              <div className="support"><i className="fas fa-angle-down" aria-hidden="true"></i>
              </div></a>
            <div className="br-list"><span className="br-divider d-md-none"></span><a className="br-item" href="javascript:void(0)">
                <div className="content">Est ex deserunt</div></a><a className="br-item" href="javascript:void(0)">
                <div className="content">Est ex deserunt</div></a><a className="br-item" href="javascript:void(0)">
                <div className="content">Ex qui laborum consectetur aute commodo</div></a><span className="br-divider d-md-none"></span>
            </div>
          </div>
          <div className="col-2"><a className="br-item header" href="javascript:void(0)">
              <div className="content text-down-01 text-bold text-uppercase">Categoria 4</div>
              <div className="support"><i className="fas fa-angle-down" aria-hidden="true"></i>
              </div></a>
            <div className="br-list"><span className="br-divider d-md-none"></span><a className="br-item" href="javascript:void(0)">
                <div className="content">Duis incididunt consectetur</div></a><a className="br-item" href="javascript:void(0)">
                <div className="content">Ad deserunt nostrud</div></a><span className="br-divider d-md-none"></span>
            </div>
          </div>
          <div className="col-2"><a className="br-item header" href="javascript:void(0)">
              <div className="content text-down-01 text-bold text-uppercase">Categoria 5</div>
              <div className="support"><i className="fas fa-angle-down" aria-hidden="true"></i>
              </div></a>
            <div className="br-list"><span className="br-divider d-md-none"></span><a className="br-item" href="javascript:void(0)">
                <div className="content">Nulla occaecat eiusmod</div></a><a className="br-item" href="javascript:void(0)">
                <div className="content">Ex qui laborum consectetur aute commodo</div></a><a className="br-item" href="javascript:void(0)">
                <div className="content">Deserunt</div></a><a className="br-item" href="javascript:void(0)">
                <div className="content">Est ex deserunt</div></a><span className="br-divider d-md-none"></span>
            </div>
          </div>
          <div className="col-2"><a className="br-item header" href="javascript:void(0)">
              <div className="content text-down-01 text-bold text-uppercase">Categoria 6</div>
              <div className="support"><i className="fas fa-angle-down" aria-hidden="true"></i>
              </div></a>
            <div className="br-list"><span className="br-divider d-md-none"></span><a className="br-item" href="javascript:void(0)">
                <div className="content">Ex qui laborum consectetur aute commodo</div></a><a className="br-item" href="javascript:void(0)">
                <div className="content">Ex qui laborum consectetur aute commodo</div></a><span className="br-divider d-md-none"></span>
            </div>
          </div>
        </div>
        <div className="d-none d-sm-block">
          <div className="row align-items-end justify-content-between py-5">
            <div className="col">
              <div className="social-network">
                <div className="social-network-title">Redes Sociais</div>
                <div className="d-flex">
                  <a className="br-button circle" href="https://www.facebook.com/MuseusBR/" aria-label="Compartilhar por Facebook">
                    <i className="fab fa-facebook-f" aria-hidden="true"></i>
                  </a>
                  <a className="br-button circle" href="https://www.youtube.com/channel/UCAUcQbl5S0_PPKYK2E-78Yw" aria-label="Compartilhar por Youtube">
                    <i className="fab fa-youtube" aria-hidden="true"></i>
                  </a>
                  <a className="br-button circle" href="https://www.instagram.com/museusbr/" aria-label="Compartilhar por Instagram">
                    <i className="fab fa-instagram" aria-hidden="true"></i>
                  </a>
                </div>
              </div>
            </div>
            <div className="col assigns flex items-center justify-center">
              Desenvolvido por:
              <img className="ml-4" src={logoIfrn} alt="Imagem"/>
              <img className="ml-4" src={logoNocs} alt="Imagem"/>
            </div>
          </div>
        </div>
      </div><span className="br-divider my-3"></span>
      <div className="container-lg">
        <div className="info">
          <div className="text-down-01 text-medium pb-3">Texto destinado a exibição de informações relacionadas à&nbsp;<strong>licença de uso.</strong></div>
        </div>
      </div>
    </footer>
  )
}

export default Footer;
