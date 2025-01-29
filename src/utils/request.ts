import { pack, unpack } from "msgpackr"
import toast from "react-hot-toast"

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

  if (res.status === 401) {
    const refreshRes = await fetch("/api/admin/auth/refresh", {
      method: "POST",
      credentials: "include"
    })
    if (refreshRes.ok) {
      return request(path, init)
    } else {
      location.href = "/login"
    }
  } else if (!res.status.toString().startsWith("2")) {
    const error = unpack(await res.arrayBuffer()).message

    if (showError) {
      toast.error(error)
    }

    throw new Error(error)
  }

  res.json = async () => unpack(await res.arrayBuffer())

  return res
}
