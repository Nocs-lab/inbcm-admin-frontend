import React from "react";
import DefaultLayout from "../layouts/default";
import useStore from "../utils/store";
import { Chart } from "react-google-charts";
import { useSuspenseQueries } from "@tanstack/react-query";
import request from "../utils/request";
import { getColorStatus } from "../utils/colorStatus";

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
  TO: "Tocantins",
};

const states = Object.keys(statesNameMap);

const regioes = {
  Norte: ["AC", "AP", "AM", "PA", "RO", "RR", "TO"],
  Nordeste: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
  "Centro-Oeste": ["DF", "GO", "MT", "MS"],
  Sudeste: ["ES", "MG", "RJ", "SP"],
  Sul: ["PR", "RS", "SC"],
};

const IndexPage = () => {
  const { user } = useStore();

  const [
    { data: declaracoesPorAno },
    { data: declaracoesPorEstado },
    { data: declaracoesPorStatus },
  ] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["declaracoesPorAno"],
        queryFn: async () => {
          const res = await request("/api/dashboard/anoDeclaracao");
          return await res.json();
        },
      },
      {
        queryKey: ["declaracoesPorEstado"],
        queryFn: async () => {
          const res = await request("/api/dashboard/UF");
          return await res.json();
        },
      },
      {
        queryKey: ["declaracoesPorStatus"],
        queryFn: async () => {
          const res = await request("/api/dashboard/status");
          return await res.json();
        },
      },
    ],
  });

  const orderedStatuses = [
    "Recebida",
    "Em análise",
    "Em conformidade",
    "Não conformidade",
  ];
  const statusColors = orderedStatuses.map(
    (status) => getColorStatus(status).backgroundColor
  );

  return (
    <DefaultLayout>
      <h1>Olá {user?.name.split(" ")[0]}!</h1>
      <Chart
        chartType="ColumnChart"
        data={[
          ["Ano", "Quantidade"],
          ...Object.entries(declaracoesPorAno).map(([ano, quantidade]) => [
            ano,
            quantidade,
          ]),
        ]}
        width="100%"
        height="400px"
        legendToggle
        options={{
          title: "Declarações por ano",
          legend: { position: "bottom", alignment: "center" },
        }}
      />
      <Chart
        chartType="GeoChart"
        data={[
          ["Estado", "Quantidade de declarações"],
          ...Object.entries(declaracoesPorEstado).map(([uf, quantidade]) => [
            statesNameMap[uf],
            quantidade,
          ]),
          ...states
            .filter((uf) => !declaracoesPorEstado[uf])
            .map((uf) => [statesNameMap[uf], 0]),
        ]}
        width="100%"
        height="800px"
        legendToggle
        mapsApiKey="AIzaSyAHwgrar0tacbSQmteaYxld0sZO_gl4IBg"
        options={{
          title: "Declarações por estado",
          region: "BR",
          resolution: "provinces",
          colorAxis: {
            colors: ["#acb2b9", "#2f3f4f"],
          },
        }}
      />
      <Chart
        chartType="ColumnChart"
        data={[
          ["Região", "Quantidade"],
          ...Object.entries(regioes).map(([regiao, estados]) => [
            regiao,
            estados.reduce(
              (acc, uf) => acc + (declaracoesPorEstado[uf] || 0),
              0
            ),
          ]),
        ]}
        width="100%"
        height="400px"
        legendToggle
        options={{
          title: "Declarações por região",
        }}
      />
      <Chart
        chartType="ColumnChart"
        data={[
          ["Tipo", "Quantidade"],
          ["Meta de declarações", 100],
          ["Declarações realizadas", 80],
        ]}
        width="100%"
        height="400px"
        legendToggle
        options={{
          title: "Meta de declarações x Declarações realizadas",
          vAxis: {
            viewWindow: {
              min: 0,
            },
          },
        }}
      />
      <Chart
        chartType="ColumnChart"
        data={[
          [
            "Ano",
            "Recebida",
            "Em análise",
            "Em conformidade",
            "Não conformidade",
          ],
          ["2021", 100, 80, 50, 20],
          ["2022", 120, 90, 60, 30],
          ["2023", 130, 100, 70, 40],
          ["2024", 140, 110, 80, 50],
        ]}
        width="100%"
        height="400px"
        legendToggle
        options={{
          title: "Declarações por situação",
          vAxis: { title: "Quantidade", minValue: 0 },
          colors: statusColors,
          legend: {
            position: "bottom",
            textStyle: {
              fontSize: 14,
            },
          },
          bar: { groupWidth: "70%" },
        }}
      />

      <Chart
        chartType="ColumnChart"
        data={[
          ["Analista", "2021", "2022", "2023", "2024"],
          ["Andrea Simões", 600, 1000, 800, 300],
          ["Carla Pimenta", 400, 300, 600, 200],
          ["Carlos André", 500, 700, 800, 50],
          ["Eduardo Cavalcanti", 300, 900, 1000, 600],
          ["Felipe Arruda", 700, 100, 800, 500],
        ]}
        width="100%"
        height="400px"
        options={{
          title: "Quantidade de declarações por analista",
          vAxis: { title: "Quantidade", minValue: 0 },
          colors: ["#1f77b4", "#ff7f0e", "#2ca02c", "#17becf"], // Cores para 2021, 2022, 2023, 2024
          legend: { position: "bottom", alignment: "center" },
          bar: { groupWidth: "60%" },
        }}
      />
    </DefaultLayout>
  );
};

export default IndexPage;
