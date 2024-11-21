import { useState } from "react"
import DefaultLayout from "../layouts/default"
import { Select } from "react-dsgov"
import Charts from "./_components/Charts"
import { Suspense } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import request from "../utils/request"

const statesNameMap = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins"
}

const regionsMap = {
  Norte: ["AM", "RR", "AP", "PA", "TO", "RO", "AC"],
  Nordeste: ["MA", "PI", "CE", "RN", "PE", "PB", "SE", "AL", "BA"],
  "Centro-Oeste": ["MT", "MS", "GO", "DF"],
  Sudeste: ["SP", "RJ", "MG", "ES"],
  Sul: ["PR", "SC", "RS"]
}

const states = Object.keys(statesNameMap)

const IndexPage = () => {
  const [inicio, setInicio] = useState("2024")
  const [fim, setFim] = useState("2024")
  const [regiao, setRegiao] = useState<string | null>(null)
  const [estado, setEstado] = useState<string | null>(null)
  const [municipio, setMunicipio] = useState<string | null>(null)

  // Fetch anos válidos
  const { data: anos } = useSuspenseQuery({
    queryKey: ["anos-validos"],
    queryFn: async () => {
      const res = await request("/api/admin/declaracoes/anos-validos/10")
      const data = await res.json()
      return data.anos.sort((a: number, b: number) => b - a) // Ordena do mais recente ao mais antigo
    }
  })

  console.log(anos)

  const { data: cidades } = useSuspenseQuery({
    queryKey: ["cidades"],
    queryFn: async () => {
      const res = await request("/api/admin/museus/listarCidades")

      return await res.json()
    }
  })

  const params = new URLSearchParams()
  for (const ano of Array.from(
    { length: Number(fim) - Number(inicio) + 1 },
    (_, i) => String(Number(inicio) + i)
  )) {
    params.append("anos", ano)
  }
  const estados = estado
    ? [estado]
    : regiao
      ? regionsMap[regiao as keyof typeof regionsMap]
      : []

  for (const uf of estados) {
    params.append("estados", uf)
  }

  if (municipio) {
    params.append("cidades", municipio)
  }

  return (
    <DefaultLayout>
      <h1>Painel analítico</h1>
      <fieldset
        className="rounded-lg p-3 grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        style={{ border: "2px solid #e0e0e0" }}
      >
        <legend className="text-lg font-extrabold px-3 m-0">Filtros</legend>
        <Select
          label="Início"
          value={inicio ?? undefined}
          options={anos.map((ano: number) => ({
            label: String(ano),
            value: String(ano)
          }))}
          onChange={(ano: string) => setInicio(ano)}
          className="w-full"
        />
        <Select
          label="Fim"
          value={fim ?? undefined}
          options={anos
            .filter((ano: number) => !inicio || ano >= Number(inicio))
            .map((ano: number) => ({ label: String(ano), value: String(ano) }))}
          onChange={(ano: string) => setFim(ano)}
          className="w-full"
        />
        <Select
          label="Região"
          value={regiao ?? undefined}
          options={Object.keys(regionsMap).map((regiao) => ({
            label: regiao,
            value: regiao
          }))}
          onChange={(regiao: string) => setRegiao(regiao)}
          placeholder="Selecione uma região"
          className="w-full"
        />
        <Select
          label="Estado"
          disabled={!regiao}
          value={estado ?? undefined}
          options={states
            .map((uf) => ({
              label: statesNameMap[uf as keyof typeof statesNameMap],
              value: uf
            }))
            .filter((uf) =>
              regiao
                ? regionsMap[regiao as keyof typeof regionsMap].includes(
                    uf.value
                  )
                : true
            )}
          onChange={(uf: string) => setEstado(uf)}
          placeholder="Selecione um estado"
          className="w-full"
        />
        <Select
          label="Município"
          disabled={!estado}
          value={municipio ?? undefined}
          options={
            cidades
              .filter((cidade: { estado: string }) => cidade.estado === estado)
              .map((cidade: { municipio: string }) => ({
                label: cidade.municipio,
                value: cidade.municipio
              })) ?? []
          }
          onChange={(municipio: string) => setMunicipio(municipio)}
          placeholder="Selecione uma cidade"
          className="w-full"
        />
      </fieldset>
      <Suspense
        fallback={
          <div className="w-screen h-90 flex items-center justify-center">
            <div
              className="br-loading medium"
              role="progressbar"
              aria-label="carregando exemplo medium exemplo"
            ></div>
          </div>
        }
      >
        <Charts
          params={params}
          estado={estado}
          regiao={regiao}
          inicio={inicio}
          fim={fim}
        />
      </Suspense>
    </DefaultLayout>
  )
}

export default IndexPage
