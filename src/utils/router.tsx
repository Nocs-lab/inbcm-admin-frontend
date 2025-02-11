import { createBrowserRouter } from "react-router"
import routes from "~react-pages"
import DefaultLayout from "../layouts/default"

const loginRoute = routes.find((route) => route.path === "login")!
routes.splice(routes.indexOf(loginRoute), 1)

const router = createBrowserRouter([
  { children: routes, element: <DefaultLayout /> },
  loginRoute
])

export default router
