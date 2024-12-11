import { Link, useNavigate } from "react-router-dom"
import logoImbramSimples from "../images/logo-ibram-simples.png"
import useStore from "../utils/store"
import React, { useState } from "react"

const Header: React.FC = () => {
  const { setUser, ...rest } = useStore()
  const user = rest.user!
  const navigate = useNavigate()

  const pathnameMap = {
    "/": "Painel analítico",
    "/museus": "Museus",
    "/gestao": "Gestão",
    "/declaracoes": "Declarações",
    "/usuarios": "Usuários"
  }

  const logout = () => {
    setUser(null)
    navigate("/login")
  }

  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className="br-header compact large fixed">
      <div className="container-lg">
        <div className="header-top">
          <div className="header-logo">
            <img src={logoImbramSimples} alt="logo" />
            <span className="br-divider vertical"></span>
            <div className="header-sign">Instituto Brasileiro de Museus</div>
          </div>
          <div className="header-actions">
            <div className="header-links dropdown">
              <button
                className="br-button circle small"
                type="button"
                data-toggle="dropdown"
                aria-label="Abrir Acesso Rápido"
              >
                <i className="fas fa-ellipsis-v" aria-hidden="true"></i>
              </button>
              <div className="br-list">
                <div className="header">
                  <div className="title">Acesso Rápido</div>
                </div>
                {Object.entries(pathnameMap).map(([path, name]) => (
                  <Link key={path} className="br-item" to={path}>
                    {name}
                  </Link>
                ))}
              </div>
            </div>
            <span className="br-divider vertical mx-half mx-sm-1"></span>
            <div className="header-login">
              <div>
                <button
                  className="br-sign-in p-0"
                  type="button"
                  id="avatar-dropdown-trigger"
                  data-testid="avatar-dropdown-trigger"
                  onClick={() => setUserMenuOpen((old) => !old)}
                  data-toggle="dropdown"
                  data-target="avatar-menu"
                >
                  <span className="br-avatar" title={user.name}>
                    <span className="content bg-orange-vivid-30 text-pure-0">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </span>
                  <span
                    className="ml-2 mr-1 text-gray-80 text-weight-regular"
                    data-testid="username"
                  >
                    <span className="text-weight-semi-bold">
                      {user.name.split(" ")[0]}
                    </span>
                  </span>
                  <i className="fas fa-caret-down" aria-hidden="true"></i>
                </button>
                <div
                  className="br-list z-50 w-1/5 min-w-[8rem] p-2"
                  id="avatar-menu"
                  hidden={!userMenuOpen}
                  role="menu"
                  aria-labelledby="avatar-dropdown-trigger"
                >
                  <button
                    className="br-item flex items-center space-x-2"
                    onClick={logout}
                    role="menuitem"
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="header-bottom">
          <div className="header-menu">
            <div className="header-info">
              <div className="header-subtitle">
                Instituto Brasileiro de Museus
              </div>
              <div className="header-title">
                Inventário Nacional de Bens Culturais Musealizados
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
