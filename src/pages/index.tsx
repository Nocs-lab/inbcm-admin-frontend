import { useSuspenseQuery } from "@tanstack/react-query"
import request from "../utils/request"

const IndexPage = () => {
  const { data } = useSuspenseQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await request("/api/admin/dashboard")
      return res.json() as Promise<{ token: string }>
    },
    refetchOnWindowFocus: false
  })

  const iframeUrl = `${import.meta.env.VITE_METABASE_SITE_URL}/embed/dashboard/${data.token}#bordered=false&titled=false`

  return (
    <>
      <h2>Painel analítico</h2>
      <iframe src={iframeUrl} width="100%" height={2000} />
    </>
  )
}

export default IndexPage
