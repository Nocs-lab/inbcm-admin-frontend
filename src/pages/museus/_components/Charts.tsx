import { useSuspenseQuery } from "@tanstack/react-query"
import NotFound from "../../../components/NotFound"
import request from "../../../utils/request"
import Chart from "react-google-charts"

const Charts: React.FC<{
  params: URLSearchParams
  inicio: string
  fim: string
  museu: string | null
}> = ({ params, inicio, fim, museu }) => {
  const {
    data: { bensCountPorTipo }
  } = useSuspenseQuery({
    queryKey: ["dashboard", params.toString()],
    queryFn: async () => {
      {
        const res = await request(`/api/admin/dashboard/?${params.toString()}`)
        return await res.json()
      }
    }
  })

  return (
    <div>
      {museu !== null && (
        <>
          <span className="text-lg font-gray-600 font-bold">
            {fim !== inicio
              ? `Quantidade de bens por tipo de ${inicio} a ${fim}`
              : `Quantidade de bens por tipo em ${inicio}`}
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
        </>
      )}
    </div>
  )
}

export default Charts
