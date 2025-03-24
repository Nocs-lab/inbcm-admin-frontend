import React, { useState, useRef } from "react"
import { useNavigate, Link, NavLink } from "react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import logoImbramSimples from "../images/logo-ibram-simples.png"
import request from "../utils/request"
import useStore from "../utils/store"
import clsx from "clsx"

const Header: React.FC = () => {
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { setUser } = useStore()

  const pathnameMap = {
    "/": "Painel analítico",
    "/periodos": "Períodos",
    "/declaracoes": "Declarações",
    "/usuarios": "Usuários"
  }

  const { data: user } = useSuspenseQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await request("/api/public/users")
      const data = await response.json()

      return data
    }
  })

  const logout = () => {
    setUser(null)
    navigate("/login")
  }

  return (
    <header className="br-header compact large fixed">
      <div className="container-lg">
        <div className="header-top p-2">
          <div className="header-logo">
            <Link to="/">
              <img
                src={logoImbramSimples}
                alt="logo"
                style={{
                  maxWidth: "100px",
                  maxHeight: "50px",
                  width: "auto",
                  height: "auto"
                }}
              />
            </Link>
            <div className="header-subtitle">
              Instituto Brasileiro de Museus
            </div>
            <span className="br-divider vertical"></span>
            <div className="header-sign">Instituto Brasileiro de Museus</div>
          </div>
          {user && (
            <div className="header-actions relative">
              {/* Links fixos no desktop, dropdown no mobile */}
              <div className="hidden md:flex space-x-4 whitespace-nowrap">
                {user.profile.name === "admin" &&
                  Object.entries(pathnameMap).map(([path, name]) => (
                    <NavLink
                      key={path}
                      className={({ isActive }) =>
                        clsx("br-item py-2 px-4", isActive && "underline")
                      }
                      to={path}
                    >
                      {name}
                    </NavLink>
                  ))}
              </div>

              {/* Dropdown só no mobile */}
              <div className="md:hidden relative" ref={dropdownRef}>
                <button
                  className="br-button circle small"
                  type="button"
                  aria-label="Abrir Acesso Rápido"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <i className="fas fa-ellipsis-v" aria-hidden="true"></i>
                </button>
                <div
                  className={clsx(
                    "absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg transition-all duration-200 transform",
                    dropdownOpen
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 hidden"
                  )}
                >
                  {user.profile.name === "admin" &&
                    Object.entries(pathnameMap).map(([path, name]) => (
                      <NavLink
                        key={path}
                        className={({ isActive }) =>
                          clsx(
                            "br-item block py-2 px-4",
                            isActive && "underline"
                          )
                        }
                        to={path}
                        onClick={() => setDropdownOpen(false)}
                      >
                        {name}
                      </NavLink>
                    ))}
                </div>
              </div>

              <span className="br-divider vertical mx-half mx-sm-1"></span>
              <div className="header-login relative">
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
                    <span className="br-avatar" title={user.nome}>
                      <span className="content bg-orange-vivid-30 text-pure-0">
                        {user.nome.charAt(0).toUpperCase()}
                      </span>
                    </span>
                    <span
                      className="ml-2 mr-1 text-gray-80 text-weight-regular"
                      data-testid="username"
                    >
                      <span className="text-weight-semi-bold">
                        {user.nome.split(" ")[0]}
                      </span>
                    </span>
                    <i className="fas fa-caret-down" aria-hidden="true"></i>
                  </button>
                  <div
                    className="br-list z-50 w-full"
                    id="avatar-menu"
                    hidden={!userMenuOpen}
                    role="menu"
                    aria-labelledby="avatar-dropdown-trigger"
                  >
                    <Link to="/perfil">
                      <button className="br-item flex items-center space-x-2">
                        <i className="fa-solid fa-user"></i>
                        <span>Perfil</span>
                      </button>
                    </Link>
                    <button
                      className="br-button circle small"
                      type="button"
                      data-toggle="dropdown"
                      aria-label="Abrir Acesso Rápido"
                    >
                      <i className="fas fa-ellipsis-v" aria-hidden="true"></i>
                    </button>
                    <div className="br-list">
                      {user.profile.name === "admin" &&
                        Object.entries(pathnameMap).map(
                          ([path, name]: [string, string]) => (
                            <NavLink
                              key={path}
                              className={({ isActive }) =>
                                clsx(
                                  "br-item block py-2 px-4",
                                  isActive && "underline"
                                )
                              }
                              to={path}
                            >
                              {name}
                            </NavLink>
                          )
                        )}
                    </div>
                  </div>
                  <span className="br-divider vertical mx-half mx-sm-1"></span>
                  <div className="header-login relative">
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
                        <span className="br-avatar" title={user.nome}>
                          <span className="content bg-orange-vivid-30 text-pure-0">
                            {user.nome.charAt(0).toUpperCase()}
                          </span>
                        </span>
                        <span
                          className="ml-2 mr-1 text-gray-80 text-weight-regular"
                          data-testid="username"
                        >
                          <span className="text-weight-semi-bold">
                            {user.nome.split(" ")[0]}
                          </span>
                        </span>
                        <i className="fas fa-caret-down" aria-hidden="true"></i>
                      </button>
                      <div
                        className="br-list z-50 w-full"
                        id="avatar-menu"
                        hidden={!userMenuOpen}
                        role="menu"
                        aria-labelledby="avatar-dropdown-trigger"
                      >
                        <Link to="/perfil">
                          <button className="br-item flex items-center space-x-2">
                            <i className="fa-solid fa-user"></i>
                            <span>Perfil</span>
                          </button>
                        </Link>
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
              )}
            </div>
          )}
        </div>
        <div className="header-bottom p-2">
          <div className="header-menu">
            <div className="header-info">
              <div className="header-title">
                Inventário Nacional de Bens Culturais Musealizados
              </div>
            </div>
          </div>
        </header>
      ) : null}
    </>
  )
}

export default Header
