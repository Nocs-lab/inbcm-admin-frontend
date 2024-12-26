import DefaultLayout from "../layouts/default"
import Select from "../components/MultiSelect"
import Charts from "./_components/Charts"
import { Suspense, useEffect } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import request from "../utils/request"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

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

const schema = z.object({
  inicio: z.string(),
  fim: z.string(),
  regioes: z.array(z.string()),
  estados: z.array(z.string()),
  municipios: z.array(z.string())
})

type FormValues = z.infer<typeof schema>

const IndexPage = () => {
  const currentYear = new Date().getFullYear() // Obtém o ano atual
  const anos = Array.from({ length: 10 }, (_, i) => currentYear - i) // Últimos 10 anos

  const { data: cidades } = useSuspenseQuery({
    queryKey: ["cidades"],
    queryFn: async () => {
      const res = await request("/api/admin/museus/listarCidades")

      return await res.json()
    }
  })

  const { handleSubmit, watch, control, setValue, reset } = useForm<FormValues>(
    {
      resolver: zodResolver(schema),
      mode: "onBlur",
      defaultValues: {
        inicio: currentYear.toString(),
        fim: currentYear.toString(),
        regioes: [],
        estados: [],
        municipios: []
      }
    }
  )

  const [inicio, fim, regioes, estados, municipios] = watch([
    "inicio",
    "fim",
    "regioes",
    "estados",
    "municipios"
  ])

  useEffect(() => {
    if (regioes) {
      setValue(
        "estados",
        estados.filter((uf) =>
          regioes.some((regiao) =>
            regionsMap[regiao as keyof typeof regionsMap].includes(uf)
          )
        )
      )
    }
  }, [regioes])

  const estadosByRegiao = states.filter((uf) =>
    regioes
      ? regioes.some((regiao) =>
          regionsMap[regiao as keyof typeof regionsMap].includes(uf)
        )
      : true
  )

  const params = new URLSearchParams()
  for (const ano of Array.from(
    { length: Number(fim) - Number(inicio) + 1 },
    (_, i) => String(Number(inicio) + i)
  )) {
    params.append("anos", ano)
  }

  if (estados.length === 0) {
    for (const uf of estadosByRegiao) {
      params.append("estados", uf)
    }
  } else {
    for (const uf of estados) {
      params.append("estados", uf)
    }
  }

  for (const municipio of municipios) {
    params.append("cidades", municipio)
  }

  return (
    <DefaultLayout>
      <h1>Painel analítico</h1>
      <form onSubmit={handleSubmit((data) => console.log(data))}>
        <fieldset
          className="rounded-lg p-3"
          style={{ border: "2px solid #e0e0e0" }}
        >
          <legend className="text-lg font-extrabold px-3 m-0">Filtros</legend>
          <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <Controller
              control={control}
              name="inicio"
              render={({ field }) => (
                <Select
                  label="Início"
                  options={anos.map((ano) => ({
                    label: String(ano),
                    value: String(ano)
                  }))}
                  className="w-full"
                  {...field}
                />
              )}
            />
            <Controller
              control={control}
              name="fim"
              render={({ field }) => (
                <Select
                  label="Fim"
                  options={anos
                    .filter((ano) => !inicio || ano >= Number(inicio))
                    .map((ano) => ({
                      label: String(ano),
                      value: String(ano)
                    }))}
                  className="w-full"
                  {...field}
                />
              )}
            />
            <Controller
              control={control}
              name="regioes"
              render={({ field }) => (
                <Select
                  label="Região"
                  type="multiple"
                  options={Object.keys(regionsMap).map((regiao) => ({
                    label: regiao,
                    value: regiao
                  }))}
                  placeholder="Selecione uma região"
                  className="w-full"
                  {...field}
                />
              )}
            />
            <Controller
              control={control}
              name="estados"
              render={({ field }) => (
                <Select
                  label="Estado"
                  disabled={regioes.length === 0}
                  type="multiple"
                  options={estadosByRegiao.map((uf) => ({
                    label: statesNameMap[uf as keyof typeof statesNameMap],
                    value: uf
                  }))}
                  placeholder="Selecione um estado"
                  className="w-full"
                  {...field}
                />
              )}
            />
            <Controller
              control={control}
              name="municipios"
              render={({ field }) => (
                <Select
                  label="Município"
                  disabled={estados.length === 0}
                  type="multiple"
                  options={
                    cidades
                      .filter((cidade: { estado: string }) =>
                        estados.includes(cidade.estado)
                      )
                      .map((cidade: { municipio: string }) => ({
                        label: cidade.municipio,
                        value: cidade.municipio
                      })) ?? []
                  }
                  placeholder="Selecione uma cidade"
                  className="w-full"
                  {...field}
                />
              )}
            />
          </div>
          <button
            type="reset"
            className="br-button primary mt-4"
            onClick={() => reset()}
          >
            Limpar
          </button>
        </fieldset>
      </form>
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
          estados={estados}
          regioes={regioes}
          inicio={inicio}
          fim={fim}
        />
      </Suspense>
    </DefaultLayout>
  )
}

export default IndexPage
