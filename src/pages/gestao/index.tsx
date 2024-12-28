import { useSuspenseQueries } from "@tanstack/react-query"
import DefaultLayout from "../../layouts/default"
import request from "../../utils/request"
import { Suspense } from "react"
import Charts from "./_components/Charts"
import { Select } from "react-dsgov"
import { useState } from "react"

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

const states = Object.keys(statesNameMap)

const Gestao: React.FC = () => {
  const [{ data: museus }, { data: cidades }] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["museus"],
        queryFn: async () => {
          const res = await request("/api/admin/museus")

          return await res.json()
        }
      },
      {
        queryKey: ["cidades"],
        queryFn: async () => {
          const res = await request("/api/admin/museus/listarCidades")

          return await res.json()
        }
      }
    ]
  })

  const [inicio, setInicio] = useState("2024")
  const [fim, setFim] = useState("2024")
  const [estado, setEstado] = useState<string | null>(null)
  const [municipio, setMunicipio] = useState<string | null>(null)
  const [museu, setMuseu] = useState<string | null>(null)

  const params = new URLSearchParams()

  for (const ano of Array.from(
    { length: Number(fim) - Number(inicio) + 1 },
    (_, i) => String(Number(inicio) + i)
  )) {
    params.append("anos", ano)
  }

  if (museu) {
    params.append("museu", museu)
  }

  return (
    <DefaultLayout>
      <h2>Gestão</h2>
      <fieldset
        className="rounded-lg p-3 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        style={{ border: "2px solid #e0e0e0" }}
      >
        <legend className="text-lg font-extrabold px-3 m-0">Filtros</legend>
        <Select
          label="Inicio"
          value={inicio}
          options={[
            { label: "2021", value: "2021" },
            { label: "2022", value: "2022" },
            { label: "2023", value: "2023" },
            { label: "2024", value: "2024" }
          ]}
          onChange={(ano: string) => setInicio(ano)}
          className="w-full"
        />
        <Select
          label="Fim"
          value={fim}
          options={[
            { label: "2021", value: "2021" },
            { label: "2022", value: "2022" },
            { label: "2023", value: "2023" },
            { label: "2024", value: "2024" }
          ].filter((ano) => Number(ano.value) >= Number(inicio))}
          onChange={(ano: string) => setFim(ano)}
          className="w-full"
        />
        <Select
          label="Estado"
          value={estado ?? undefined}
          options={states.map((uf) => ({
            label: statesNameMap[uf as keyof typeof statesNameMap],
            value: uf
          }))}
          onChange={(uf: string) => setEstado(uf)}
          disabled={museu !== null}
          placeholder="Selecione um estado"
          className="w-full"
        />
        <Select
          label="Município"
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
          disabled={!estado || museu !== null}
          placeholder="Selecione uma cidade"
          className="w-full"
        />
        <Select
          placeholder="Selecione um museu"
          label="Museu"
          options={museus
            .filter((museu: { endereco: { municipio: string } }) =>
              municipio !== null ? museu.endereco.municipio === municipio : true
            )
            .map((museu: { nome: string; _id: string }) => ({
              label: museu.nome,
              value: museu._id
            }))}
          value={museu ?? undefined}
          onChange={(museu: string) => setMuseu(museu)}
          className="w-full lg:col-span-3 xl:col-span-4"
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
        <Charts params={params} inicio={inicio} fim={fim} museu={museu} />
      </Suspense>
    </DefaultLayout>
  )
}

export default Gestao
