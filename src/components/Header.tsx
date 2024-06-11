import { Link, useNavigate, useLocation } from 'react-router-dom';
import logoImbramSimples from '../images/logo-ibram-simples.png';
import useStore from '../utils/store';
import React, { useState } from 'react';

const Header: React.FC = () => {
  const { setUser, ...rest } = useStore()
  const user = rest.user!
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const pathnameMap = {
    "/": "Dashboard",
    "/declaracoes": "Declarações recebidas"
  }

  const name = pathnameMap[pathname as keyof typeof pathnameMap] || "Página não encontrada"

  const logout = () => {
    setUser(null)
    navigate("/login")
  }

  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className="br-header">
      <div className="container-lg">
        <div className="header-top">
          <div className="header-logo"><img src={logoImbramSimples} alt="logo"/><span className="br-divider vertical"></span>
            <div className="header-sign">Instituto Brasileiro de Museus</div>
          </div>
          <div className="header-actions">
            <div className="header-links dropdown">
              <button className="br-button circle small" type="button" data-toggle="dropdown" aria-label="Abrir Acesso Rápido"><i className="fas fa-ellipsis-v" aria-hidden="true"></i>
              </button>
              <div className="br-list">
                <div className="header">
                  <div className="title">Acesso Rápido</div>
                </div>
                {Object.entries(pathnameMap).map(([path, name]) => (
                  <Link key={path} className="br-item" to={path}>{name}</Link>
                ))}
              </div>
            </div><span className="br-divider vertical mx-half mx-sm-1"></span>
            <div className="header-functions dropdown">
              <button className="br-button circle small" type="button" data-toggle="dropdown" aria-label="Abrir Funcionalidades do Sistema"><i className="fas fa-th" aria-hidden="true"></i>
              </button>
              <div className="br-list">
                <div className="header">
                  <div className="title">Funcionalidades do Sistema</div>
                </div>
                <div className="br-item">
                  <button className="br-button circle small" type="button" aria-label="Funcionalidade 2"><i className="fas fa-headset" aria-hidden="true"></i><span className="text">Funcionalidade 2</span>
                  </button>
                </div>
                <div className="br-item">
                  <button className="br-button circle small" type="button" aria-label="Funcionalidade 4"><i className="fas fa-adjust" aria-hidden="true"></i><span className="text">Funcionalidade 4</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="header-search-trigger">
              <button className="br-button circle" type="button" aria-label="Abrir Busca" data-toggle="search" data-target=".header-search"><i className="fas fa-search" aria-hidden="true"></i>
              </button>
            </div>
            <div>
              <button className="br-sign-in" type="button" id="avatar-dropdown-trigger" onClick={() => setUserMenuOpen(old => !old)} data-toggle="dropdown" data-target="avatar-menu" aria-label={`Olá, ${user.name.split(" ")[0]}`}><span className="br-avatar" title={user.name}><span className="content bg-orange-vivid-30 text-pure-0">{user.name.charAt(0).toUpperCase()}</span></span><span className="ml-2 text-gray-80 text-weight-regular">Olá, <span className="text-weight-semi-bold">{user.name.split(" ")[0]}</span></span><i className="fas fa-caret-down" aria-hidden="true"></i></button>
              <div className="br-list z-50" id="avatar-menu" hidden={!userMenuOpen} role="menu" aria-labelledby="avatar-dropdown-trigger">
                <a className="br-item" href="javascript:void(0)" role="menuitem">Dados pessoais</a>
                <button className="br-item" onClick={logout} role="menuitem">Sair</button>
                <a className="br-item" href="javascript:void(0)" role="menuitem">Notificações</a>
              </div>
            </div>
          </div>
        </div>
        <div className="header-bottom">
          <div className="header-menu">
            <div className="header-info">
              <div className="header-title">Inventário Nacional de Bens Culturais Musealizados</div>
              <div className="header-subtitle">{name}</div>
            </div>
          </div>
          <div className="header-search">
            <div className="br-input has-icon">
              <label htmlFor="searchbox-14841">Texto da pesquisa</label>
              <input id="searchbox-14841" type="text" placeholder="O que você procura?"/>
              <button className="br-button circle small" type="button" aria-label="Pesquisar"><i className="fas fa-search" aria-hidden="true"></i>
              </button>
            </div>
            <button className="br-button circle search-close ml-1" type="button" aria-label="Fechar Busca" data-dismiss="search"><i className="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header;
