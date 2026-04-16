import { pack, unpack } from "msgpackr"
import toast from "react-hot-toast"
import router from "./router"

export default async function request(
  path: string,
  init?: RequestInit & { data?: unknown },
  showError = true
): Promise<Response> {
  const headers = { Accept: "application/x-msgpack", ...init?.headers } as {
    [key: string]: string
  }

  if (init?.data !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/x-msgpack"
  }

  const res = await fetch(`${path}`, {
    ...init,
    headers,
    credentials: "include",
    body: init?.data !== undefined ? pack(init.data) : init?.body
  })

  // FUNÇÃO AUXILIAR: Extrai o erro com segurança
  const getErrorMessage = async (response: Response) => {
    const contentType = response.headers.get("content-type")

    // Só tenta fazer o unpack se o servidor realmente respondeu com MessagePack
    if (contentType && contentType.includes("application/x-msgpack")) {
      try {
        const data = unpack(await response.arrayBuffer())
        return data.message || "Ocorreu um erro na requisição."
      } catch (e) {
        return "Erro ao decodificar a resposta do servidor."
      }
    }

    return `Servidor indisponível ou erro de conexão (Status: ${response.status}).`
  }

  if (res.status === 401) {
    if (path.includes("/login")) {
      const errorMsg = await getErrorMessage(res) // Usa a função segura

      if (showError) {
        toast.error(errorMsg)
      }
      throw new Error(errorMsg)
    }

    const refreshRes = await fetch("/api/admin/auth/refresh", {
      method: "POST",
      credentials: "include"
    })

    if (refreshRes.ok) {
      return request(path, init)
    } else {
      router.navigate("/login")
    }
  } else if (!res.status.toString().startsWith("2")) {
    const errorMsg = await getErrorMessage(res) // Usa a função segura

    if (showError) {
      toast.error(errorMsg)
    }

    throw new Error(errorMsg)
  }

  // Protegendo o res.json() para requisições bem-sucedidas que possam não ser MessagePack
  res.json = async () => {
    const contentType = res.headers.get("content-type")
    if (contentType && contentType.includes("application/x-msgpack")) {
      return unpack(await res.arrayBuffer())
    }
    // Se por algum motivo o backend retornar JSON ou texto num status 200
    return res.text()
  }

  return res
}
