import { createBrowserRouter } from "react-router"
import routes from "~react-pages"
import DefaultLayout from "../layouts/default"

// Encontra as rotas públicas

const loginRoute =
  routes.find((route) => route.path === "/login") ||
  routes.find((route) => route.path === "login")
const solicitarAcessoRoute =
  routes.find((route) => route.path === "/solicitarAcesso") ||
  routes.find((route) => route.path === "solicitarAcesso")
const solicitarSenhaRoute =
  routes.find((route) => route.path === "/solicitarSenha") ||
  routes.find((route) => route.path === "solicitarSenha")
const resetarSenhaRoute =
  routes.find((route) => route.path === "/resetarSenha") ||
  routes.find((route) => route.path === "resetarSenha")

// Filtra as rotas privadas
const privateRoutes = routes.filter(
  (route) =>
    route !== loginRoute &&
    route !== solicitarAcessoRoute &&
    route !== solicitarSenhaRoute &&
    route !== resetarSenhaRoute
)

const router = createBrowserRouter([
  // Rotas públicas (sem layout)
  ...(loginRoute ? [loginRoute] : []),
  ...(solicitarAcessoRoute ? [solicitarAcessoRoute] : []),
  ...(solicitarSenhaRoute ? [solicitarSenhaRoute] : []),
  ...(resetarSenhaRoute ? [resetarSenhaRoute] : []),

  // Rotas privadas (com layout)
  {
    element: <DefaultLayout />,
    children: privateRoutes
  }
])

export default router
