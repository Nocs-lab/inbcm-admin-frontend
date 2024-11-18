import { useSuspenseQuery } from "@tanstack/react-query"
import request from "../../utils/request"
import { useMemo } from "react"
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

const statePreposicaoMap = {
  AC: "do",
  AL: "de",
  AP: "do",
  AM: "do",
  BA: "da",
  CE: "do",
  DF: "do",
  ES: "do",
  GO: "de",
  MA: "do",
  MT: "do",
  MS: "do",
  MG: "de",
  PA: "do",
  PB: "da",
  PR: "do",
  PE: "de",
  PI: "do",
  RJ: "do",
  RN: "do",
  RS: "do",
  RO: "de",
  RR: "de",
  SC: "de",
  SP: "de",
  SE: "de",
  TO: "de"
}

const regionsMap = {
  Norte: ["AM", "RR", "AP", "PA", "TO", "RO", "AC"],
  Nordeste: ["MA", "PI", "CE", "RN", "PE", "PB", "SE", "AL", "BA"],
  "Centro-Oeste": ["MT", "MS", "GO", "DF"],
  Sudeste: ["SP", "RJ", "MG", "ES"],
  Sul: ["PR", "SC", "RS"]
}

const Charts: React.FC<{
  params: URLSearchParams
  estado: string | null
  regiao: string | null
  inicio: string
  fim: string
}> = ({ params, estado, regiao, inicio, fim }) => {
  const {
    data: {
      declaracoesPorAnoDashboard,
      declaracoesPorUFs,
      status,
      declaracoesPorStatusPorAno,
      declaracoesPorRegiao,
      declaracoesAgrupadasPorAnalista,
      declaracoesCount,
      declaracoesEmConformidade,
      bensCountPorTipo,
      bensCountTotal
    }
  } = useSuspenseQuery({
    queryKey: ["dashboard", params.toString()],
    queryFn: async () => {
      {
        const res = await request(`/api/admin/dashboard/?${params.toString()}`)
        return await res.json()
      }
    }
  })

  let locationText = ""

  if (estado) {
    locationText = ` no estado ${statePreposicaoMap[estado as keyof typeof statePreposicaoMap]} ${statesNameMap[estado as keyof typeof statesNameMap]}`
  } else if (regiao) {
    locationText = ` na região ${regiao}`
  }

  const analistasData = useMemo(() => {
    // Definindo os anos que você quer mostrar, incluindo os novos anos (2025, 2026)
    const anos = ["2021", "2022", "2023", "2024"]

    // Função pura que organiza os dados dos analistas
    const analistasMap = declaracoesAgrupadasPorAnalista.reduce(
      (
        acc: Record<string, number[]>,
        {
          analista,
          anoDeclaracao,
          quantidadeDeclaracoes
        }: {
          analista: { nome: string }
          anoDeclaracao: string
          quantidadeDeclaracoes: number
        }
      ) => {
        // Se o analista ainda não está no mapa, inicializamos com um array de zeros
        if (!acc[analista.nome]) {
          acc[analista.nome] = Array(anos.length).fill(0) // Inicializa com zeros
        }
        // Encontrando o índice do ano
        const anoIndex = anos.indexOf(anoDeclaracao)
        if (anoIndex !== -1) {
          acc[analista.nome][anoIndex] = quantidadeDeclaracoes // Atribui a quantidade correta
        }
        return acc // Retorna o acumulador imutável
      },
      {} as Record<string, number[]>
    )

    // Estrutura final para o gráfico: cabeçalho seguido pelos dados de cada analista
    return [
      ["Analista", ...anos],
      ...Object.entries(analistasMap).map(([analista, quantidades]) => [
        analista,
        ...(quantidades as number[])
      ])
    ]
  }, [declaracoesAgrupadasPorAnalista])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-50 gap-10 auto-rows-fr">
        <div className="br-card p-3">
          <div className="card-header">
            <span className="text-6xl font-extrabold">{declaracoesCount}</span>
          </div>
          <div className="card-content mt-1">
            <span className="text-3xl font-bold">
              {fim !== inicio
                ? `Declarações de ${inicio} a ${fim} recebidas`
                : `Declarações de ${inicio} recebidas`}
            </span>
          </div>
        </div>
        <div className="br-card p-3">
          <div className="card-header">
            <span className="text-6xl font-extrabold">
              {declaracoesEmConformidade}
            </span>
          </div>
          <div className="card-content mt-1">
            <span className="text-3xl font-bold">
              {fim !== inicio
                ? `Declarações de ${inicio} a ${fim} analisadas`
                : `Declarações de ${inicio} analisadas`}
            </span>
          </div>
        </div>
        <div className="br-card p-3">
          <div className="card-header">
            <span className="text-6xl font-extrabold">10%</span>
          </div>
          <div className="card-content mt-1">
            <span className="text-3xl font-bold">
              {fim !== inicio
                ? `das metas de ${inicio} a ${fim} concluida`
                : `da meta de ${inicio} concluida`}
            </span>
          </div>
        </div>
        <div className="br-card p-3">
          <div className="card-header">
            <span className="text-6xl font-extrabold">{bensCountTotal}</span>
          </div>
          <div className="card-content mt-1">
            <span className="text-3xl font-bold">
              {fim !== inicio
                ? `Bens de ${inicio} a ${fim} cadastrados`
                : `Bens de ${inicio} cadastrados`}
            </span>
          </div>
        </div>
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
          {declaracoesPorRegiao
            .flat()
            .some(
              (quantidade: number) => !isNaN(quantidade) && quantidade > 0
            ) ? (
            <Chart
              chartType="GeoChart"
              data={[
                ["Região", "Quantidade de declarações"],
                ...declaracoesPorRegiao.flatMap(
                  ([regiao, quantidade]: [string, number]) =>
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
          {declaracoesPorRegiao
            .flat()
            .some(
              (quantidade: number) => !isNaN(quantidade) && quantidade > 0
            ) ? (
            <Chart
              chartType="ColumnChart"
              data={[
                ["Região", ...status],
                ...declaracoesPorRegiao.map(
                  ([regiao, ...quantidades]: [string, ...number[]]) => {
                    const quantidadesArray = quantidades as number[]
                    quantidadesArray.splice(1, 1)
                    return [regiao, ...quantidadesArray]
                  }
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
            Situação das declarações por ano{locationText}
          </span>
          {declaracoesPorStatusPorAno
            .flat()
            .some(
              (quantidade: number) => !isNaN(quantidade) && quantidade > 0
            ) ? (
            <Chart
              chartType="ColumnChart"
              data={[
                ["Ano", "Total", ...status],
                ...declaracoesPorStatusPorAno.sort(
                  (a: number[], b: number[]) => a[0] - b[0]
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
            Quantidade de declarações por analista{locationText}
          </span>
          {analistasData.length > 1 ? (
            <Chart
              chartType="ColumnChart"
              data={analistasData}
              width="100%"
              height="400px"
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
