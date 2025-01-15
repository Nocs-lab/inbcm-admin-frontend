import { useSuspenseQueries } from "@tanstack/react-query"
import useHttpClient from "../../utils/request"
import Chart from "react-google-charts"
import NotFound from "../../components/NotFound"

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

const regionsMap = {
  norte: ["AM", "RR", "AP", "PA", "TO", "RO", "AC"],
  nordeste: ["MA", "PI", "CE", "RN", "PE", "PB", "SE", "AL", "BA"],
  "centro-oeste": ["MT", "MS", "GO", "DF"],
  sudeste: ["SP", "RJ", "MG", "ES"],
  sul: ["PR", "SC", "RS"]
}

const Card: React.FC<{
  title: string
  value: number | string
  subtitle: string
}> = ({ title, value, subtitle }) => {
  return (
    <div className="br-card p-1 m-0">
      <div className="card-header flex items-end">
        <span className="text-5xl font-extrabold">{value}</span>
        <span className="text-xl font-bold ml-2">{title}</span>
      </div>
      <div className="card-content">
        <span className="text-2xl font-bold">{subtitle}</span>
      </div>
    </div>
  )
}

const Charts: React.FC<{
  params: URLSearchParams
  estados: string[]
  regioes: string[]
  inicio: string
  fim: string
}> = ({ params, estados, regioes, inicio, fim }) => {
  const request = useHttpClient()

  const [{ data }, { data: status }] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["dashboard", params.toString()],
        queryFn: async () => {
          {
            const res = await request(
              `/api/admin/dashboard/filtroDashBoard?${params.toString()}`
            )
            return await res.json()
          }
        }
      },
      {
        queryKey: ["status"],
        queryFn: async () => {
          {
            const res = await request(`/api/admin/dashboard/getStatusEnum`)
            return await res.json()
          }
        }
      }
    ]
  })

  const {
    quantidadeDeclaracoesPorAno: {
      quantidadePorAno: declaracoesPorAnoDashboard,
      statusPorAno: declaracoesPorStatusPorAno
    },
    quantidadePorEstadoERegiao: {
      quantidadePorEstado: declaracoesPorUFs,
      quantidadePorRegiao: declaracoesPorRegiao,
      statusPorRegiao: declaracoesPorStatusPorRegiao
    },
    cards: {
      quantidadeDeBens: bensCountPorTipo,
      totalDeclaracoes: declaracoesCount,
      totalMuseus: museusCount,
      statusPercentages: statusPorcentagem
    }
  } = data

  let locationText = ""

  if (estados) {
    locationText = ` no(s) estado(s) selecionado(s)`
  } else if (regioes) {
    locationText = ` na(s) região(oes) selecionada(s)`
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-50 gap-4">
        <Card
          title="declarações"
          value={declaracoesCount}
          subtitle="Enviadas"
        />
        <Card title="atingidos" value="10%" subtitle="da meta esperada" />
        <Card title="museus" value={museusCount} subtitle="declarantes" />
        <Card
          title="das declarações"
          value={statusPorcentagem["Recebida"]}
          subtitle="aguardando análise"
        />
        <Card
          title="das declarações"
          value={statusPorcentagem["Em análise"]}
          subtitle="em análise"
        />
        <Card
          title="das declarações"
          value={statusPorcentagem["Em conformidade"]}
          subtitle="em conformidade"
        />
        <Card
          title="das declarações"
          value={statusPorcentagem["Não conformidade"]}
          subtitle="não conformidade"
        />
        <Card
          title="itens"
          value={bensCountPorTipo["museologico"]}
          subtitle="museológicos"
        />
        <Card
          title="itens"
          value={bensCountPorTipo["bibliografico"]}
          subtitle="bibliográficos"
        />
        <Card
          title="itens"
          value={bensCountPorTipo["arquivistico"]}
          subtitle="arquivísticos"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-44">
        <div>
          <span className="text-lg font-gray-600 font-bold">
            Quantidade de declarações por ano
          </span>
          {Object.keys(declaracoesPorAnoDashboard).length > 0 &&
          Object.values(declaracoesPorAnoDashboard).every(
            (quantidade) => (quantidade as number) > 0
          ) ? (
            <Chart
              chartType="ColumnChart"
              data={[
                ["Ano", "Quantidade"],
                ...Object.entries(declaracoesPorAnoDashboard).map(
                  ([ano, quantidade]) => [ano, quantidade]
                )
              ]}
              width="100%"
              height="400px"
              legendToggle
              options={{
                hAxis: {
                  titleTextStyle: { color: "#607d8b" },
                  gridlines: { count: 0 },
                  textStyle: {
                    color: "#78909c",
                    fontName: "Roboto",
                    fontSize: "15",
                    bold: true
                  }
                },
                vAxis: {
                  minValue: 0,
                  gridlines: { color: "#cfd8dc", count: 4 },
                  baselineColor: "transparent"
                },
                legend: {
                  position: "top",
                  alignment: "center",
                  textStyle: {
                    color: "#607d8b",
                    fontName: "Roboto",
                    fontSize: "15"
                  }
                },
                colors: [
                  "#3f51b5",
                  "#2196f3",
                  "#03a9f4",
                  "#00bcd4",
                  "#009688",
                  "#4caf50",
                  "#8bc34a",
                  "#cddc39"
                ],
                areaOpacity: 0.24,
                lineWidth: 1,
                chartArea: {
                  backgroundColor: "transparent",
                  width: "100%",
                  height: "80%"
                },
                pieSliceBorderColor: "#eceff1",
                pieSliceTextStyle: { color: "#607d8b" },
                pieHole: 0.9,
                bar: { groupWidth: "100" },
                colorAxis: {
                  colors: ["#3f51b5", "#2196f3", "#03a9f4", "#00bcd4"]
                },
                backgroundColor: "transparent",
                datalessRegionColor: "#f00",
                displayMode: "regions"
              }}
            />
          ) : (
            <NotFound />
          )}
        </div>
        <div>
          <span className="text-lg font-gray-600 font-bold">
            {fim !== inicio
              ? `Quantidade de declarações por estado de ${inicio} a ${fim}`
              : `Quantidade de declarações por estado em ${inicio}`}
          </span>
          {Object.keys(declaracoesPorUFs).length > 0 &&
          Object.values(declaracoesPorUFs).every(
            (quantidade) => (quantidade as number) > 0
          ) ? (
            <Chart
              chartType="GeoChart"
              data={[
                ["Estado", "Quantidade de declarações"],
                ...Object.entries(declaracoesPorUFs).map(([uf, quantidade]) => [
                  statesNameMap[uf as keyof typeof statesNameMap],
                  quantidade
                ]),
                ...states
                  .filter((uf) => !declaracoesPorUFs[uf])
                  .map((uf) => [
                    statesNameMap[uf as keyof typeof statesNameMap],
                    0
                  ])
              ]}
              width="100%"
              height="400px"
              legendToggle
              mapsApiKey="AIzaSyAHwgrar0tacbSQmteaYxld0sZO_gl4IBg"
              options={{
                region: "BR",
                resolution: "provinces",
                colorAxis: {
                  colors: ["#d8eaff", "#3f51b5"]
                },
                colors: [
                  "#3f51b5",
                  "#2196f3",
                  "#03a9f4",
                  "#00bcd4",
                  "#009688",
                  "#4caf50",
                  "#8bc34a",
                  "#cddc39"
                ],
                hAxis: {
                  titleTextStyle: { color: "#607d8b" },
                  gridlines: { count: 0 },
                  textStyle: {
                    color: "#78909c",
                    fontName: "Roboto",
                    fontSize: "15",
                    bold: true
                  }
                },
                vAxis: {
                  minValue: 0,
                  gridlines: { color: "#cfd8dc", count: 4 },
                  baselineColor: "transparent"
                },
                legend: {
                  position: "top",
                  alignment: "left",
                  textStyle: {
                    color: "#607d8b",
                    fontName: "Roboto",
                    fontSize: "15"
                  }
                },
                areaOpacity: 0.24,
                lineWidth: 1,
                chartArea: {
                  backgroundColor: "transparent",
                  width: "100%",
                  height: "80%"
                },
                pieSliceBorderColor: "#eceff1",
                pieSliceTextStyle: { color: "#607d8b" },
                pieHole: 0.9,
                bar: { groupWidth: "100" },
                backgroundColor: "transparent",
                datalessRegionColor: "transparent",
                displayMode: "regions"
              }}
            />
          ) : (
            <NotFound />
          )}
        </div>
        <div>
          <span className="text-lg font-gray-600 font-bold">
            {fim !== inicio
              ? `Quantidade de declarações por região de ${inicio} a ${fim}`
              : `Quantidade de declarações por região em ${inicio}`}
          </span>
          {Object.values(declaracoesPorRegiao).some(
            (quantidade) => (quantidade as number) > 0
          ) ? (
            <Chart
              chartType="GeoChart"
              data={[
                ["Região", "Quantidade de declarações"],
                ...Object.entries(
                  declaracoesPorRegiao as {
                    [key: string]: number
                  }
                ).flatMap(([regiao, quantidade]: [string, number]) =>
                  regionsMap[regiao as keyof typeof regionsMap].map(
                    (uf: string) => [
                      {
                        v: statesNameMap[uf as keyof typeof statesNameMap],
                        f: regiao
                      },
                      quantidade
                    ]
                  )
                )
              ]}
              width="100%"
              height="400px"
              legendToggle
              mapsApiKey="AIzaSyAHwgrar0tacbSQmteaYxld0sZO_gl4IBg"
              options={{
                region: "BR",
                resolution: "provinces",
                colorAxis: {
                  colors: ["#d8eaff", "#3f51b5"]
                },
                colors: [
                  "#3f51b5",
                  "#2196f3",
                  "#03a9f4",
                  "#00bcd4",
                  "#009688",
                  "#4caf50",
                  "#8bc34a",
                  "#cddc39"
                ],
                hAxis: {
                  titleTextStyle: { color: "#607d8b" },
                  gridlines: { count: 0 },
                  textStyle: {
                    color: "#78909c",
                    fontName: "Roboto",
                    fontSize: "15",
                    bold: true
                  }
                },
                vAxis: {
                  minValue: 0,
                  gridlines: { color: "#cfd8dc", count: 4 },
                  baselineColor: "transparent"
                },
                legend: {
                  position: "top",
                  alignment: "left",
                  textStyle: {
                    color: "#607d8b",
                    fontName: "Roboto",
                    fontSize: "15"
                  }
                },
                areaOpacity: 0.24,
                lineWidth: 1,
                chartArea: {
                  backgroundColor: "transparent",
                  width: "100%",
                  height: "80%"
                },
                pieSliceBorderColor: "#eceff1",
                pieSliceTextStyle: { color: "#607d8b" },
                pieHole: 0.9,
                bar: { groupWidth: "100" },
                backgroundColor: "transparent",
                datalessRegionColor: "transparent",
                displayMode: "regions"
              }}
            />
          ) : (
            <NotFound />
          )}
        </div>
        <div>
          <span className="text-lg font-gray-600 font-bold">
            {fim !== inicio
              ? `Situação das declarações por região de ${inicio} a ${fim}`
              : `Situação das declarações por região em ${inicio}`}
          </span>
          {Object.values(
            declaracoesPorStatusPorRegiao as {
              [key: string]: { [key: string]: number }
            }
          )
            .flat()
            .some((quantidade) => (quantidade as unknown as number) > 0) ? (
            <Chart
              chartType="ColumnChart"
              data={[
                ["Região", ...status],
                ...Object.entries(
                  declaracoesPorStatusPorRegiao as {
                    [key: string]: { [key: string]: number }
                  }
                ).map(([regiao, status]) => [regiao, ...Object.values(status)])
              ]}
              width="100%"
              height="400px"
              legendToggle
              options={{
                hAxis: {
                  titleTextStyle: { color: "#607d8b" },
                  gridlines: { count: 0 },
                  textStyle: {
                    color: "#78909c",
                    fontName: "Roboto",
                    fontSize: "15",
                    bold: true
                  }
                },
                vAxis: {
                  minValue: 0,
                  gridlines: { color: "#cfd8dc", count: 4 },
                  baselineColor: "transparent"
                },
                legend: {
                  position: "top",
                  alignment: "center",
                  textStyle: {
                    color: "#607d8b",
                    fontName: "Roboto",
                    fontSize: "15"
                  }
                },
                colors: [
                  "#3f51b5",
                  "#2196f3",
                  "#03a9f4",
                  "#00bcd4",
                  "#009688",
                  "#4caf50",
                  "#8bc34a",
                  "#cddc39"
                ],
                areaOpacity: 0.24,
                lineWidth: 1,
                chartArea: {
                  backgroundColor: "transparent",
                  width: "100%",
                  height: "80%"
                },
                pieSliceBorderColor: "#eceff1",
                pieSliceTextStyle: { color: "#607d8b" },
                pieHole: 0.9,
                bar: { groupWidth: "100" },
                colorAxis: {
                  colors: ["#3f51b5", "#2196f3", "#03a9f4", "#00bcd4"]
                },
                backgroundColor: "transparent",
                datalessRegionColor: "#f00",
                displayMode: "regions"
              }}
            />
          ) : (
            <NotFound />
          )}
        </div>
        <div>
          <span className="text-lg font-gray-600 font-bold">
            Situação das declarações por ano{locationText}
          </span>
          {Object.values(declaracoesPorStatusPorAno).some((status) =>
            Object.values(status as object).some((quantidade) => quantidade > 0)
          ) ? (
            <Chart
              chartType="ColumnChart"
              data={[
                ["Ano", "Total", ...status],
                ...Object.entries(declaracoesPorStatusPorAno).map(
                  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'status' implicitly has an 'any' type.
                  ([ano, status]: [string, { [key: string]: number }]) => [
                    ano,
                    Object.values(status as { [key: string]: number }).reduce(
                      (acc, quantidade) => acc + quantidade,
                      0
                    ),
                    ...Array.from({ length: 5 }, (_, i) =>
                      status[i] ? status[i] : 0
                    )
                  ]
                )
              ]}
              width="100%"
              height="400px"
              legendToggle
              options={{
                hAxis: {
                  titleTextStyle: { color: "#607d8b" },
                  gridlines: { count: 0 },
                  textStyle: {
                    color: "#78909c",
                    fontName: "Roboto",
                    fontSize: "15",
                    bold: true
                  }
                },
                vAxis: {
                  minValue: 0,
                  gridlines: { color: "#cfd8dc", count: 4 },
                  baselineColor: "transparent"
                },
                legend: {
                  position: "top",
                  alignment: "center",
                  textStyle: {
                    color: "#607d8b",
                    fontName: "Roboto",
                    fontSize: "15"
                  }
                },
                colors: [
                  "#3f51b5",
                  "#2196f3",
                  "#03a9f4",
                  "#00bcd4",
                  "#009688",
                  "#4caf50",
                  "#8bc34a",
                  "#cddc39"
                ],
                areaOpacity: 0.24,
                lineWidth: 1,
                chartArea: {
                  backgroundColor: "transparent",
                  width: "100%",
                  height: "80%"
                },
                gridlines: {
                  color: "none"
                },
                pieSliceBorderColor: "#eceff1",
                pieSliceTextStyle: { color: "#607d8b" },
                pieHole: 0.9,
                bar: { groupWidth: "100" },
                colorAxis: {
                  colors: ["#3f51b5", "#2196f3", "#03a9f4", "#00bcd4"]
                },
                backgroundColor: "transparent",
                datalessRegionColor: "#f00",
                displayMode: "regions"
              }}
            />
          ) : (
            <NotFound />
          )}
        </div>
        <div>
          <span className="text-lg font-gray-600 font-bold">
            {fim !== inicio
              ? `Quantidade de bens por tipo de ${inicio} a ${fim}${locationText}`
              : `Quantidade de bens por tipo em ${inicio}${locationText}`}
          </span>
          {Object.values(bensCountPorTipo).some(
            (quantidade) => (quantidade as number) > 0
          ) ? (
            <Chart
              chartType="ColumnChart"
              data={[
                ["Tipo", "Quantidade"],
                ["Museológico", bensCountPorTipo["museologico"]],
                ["Bibliográfico", bensCountPorTipo["bibliografico"]],
                ["Arquivístico", bensCountPorTipo["arquivistico"]]
              ]}
              width="100%"
              height="400px"
              legendToggle
              options={{
                hAxis: {
                  titleTextStyle: { color: "#607d8b" },
                  gridlines: { count: 0 },
                  textStyle: {
                    color: "#78909c",
                    fontName: "Roboto",
                    fontSize: "15",
                    bold: true
                  }
                },
                vAxis: {
                  minValue: 0,
                  gridlines: { color: "#cfd8dc", count: 4 },
                  baselineColor: "transparent"
                },
                legend: {
                  position: "top",
                  alignment: "center",
                  textStyle: {
                    color: "#607d8b",
                    fontName: "Roboto",
                    fontSize: "15"
                  }
                },
                colors: [
                  "#3f51b5",
                  "#2196f3",
                  "#03a9f4",
                  "#00bcd4",
                  "#009688",
                  "#4caf50",
                  "#8bc34a",
                  "#cddc39"
                ],
                areaOpacity: 0.24,
                lineWidth: 1,
                chartArea: {
                  backgroundColor: "transparent",
                  width: "100%",
                  height: "80%"
                },
                pieSliceBorderColor: "#eceff1",
                pieSliceTextStyle: { color: "#607d8b" },
                pieHole: 0.9,
                bar: { groupWidth: "100" },
                colorAxis: {
                  colors: ["#3f51b5", "#2196f3", "#03a9f4", "#00bcd4"]
                },
                backgroundColor: "transparent",
                datalessRegionColor: "#f00",
                displayMode: "regions"
              }}
            />
          ) : (
            <NotFound />
          )}
        </div>
      </div>
    </>
  )
}

export default Charts
