import { useMemo, useState } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Chart } from "react-google-charts";
import DefaultLayout from "../layouts/default";
import request from "../utils/request";
import { Select } from "react-dsgov";

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

const regionsMap = {
  "Norte": ["AM", "RR", "AP", "PA", "TO", "RO", "AC"],
  "Nordeste": ["MA", "PI", "CE", "RN", "PE", "PB", "SE", "AL", "BA"],
  "Centro-Oeste": ["MT", "MS", "GO", "DF"],
  "Sudeste": ["SP", "RJ", "MG", "ES"],
  "Sul": ["PR", "SC", "RS"],
}

const states = Object.keys(statesNameMap);

const IndexPage = () => {
  const [ano, setAno] = useState("2024");
  const [museu, setMuseu] = useState<string | null>(null);

  const params = new URLSearchParams();
  params.append("anos", ano);
  if (museu) {
    params.append("museu", museu);
  }

  const { data: {
    declaracoesPorAnoDashboard,
    declaracoesPorUFs,
    status,
    declaracoesPorStatusPorAno,
    declaracoesPorRegiao,
    declaracoesAgrupadasPorAnalista,
    declaracoesCount,
    declaracoesEmConformidade,
    bensCountPorTipo,
    bensCountTotal,
  } } = useSuspenseQuery({
    queryKey: ["dashboard", params.toString()],
    queryFn: async () => {
      {
        const res = await request(`/api/admin/dashboard/?${params.toString()}`);
        return await res.json();
      }
    }
  });

  const { data: museus } = useQuery({
    queryKey: ["museus"],
    queryFn: async () => {
      const res = await request(`/api/admin/museus`);
      return await res.json()
    }
  });

  const analistasData = useMemo(() => {
    // Definindo os anos que você quer mostrar, incluindo os novos anos (2025, 2026)
    const anos = ["2021", "2022", "2023", "2024"];

    // Função pura que organiza os dados dos analistas
    const analistasMap = declaracoesAgrupadasPorAnalista.reduce(
      (acc, { analista, anoDeclaracao, quantidadeDeclaracoes }) => {
        // Se o analista ainda não está no mapa, inicializamos com um array de zeros
        if (!acc[analista.nome]) {
          acc[analista.nome] = Array(anos.length).fill(0); // Inicializa com zeros
        }
        // Encontrando o índice do ano
        const anoIndex = anos.indexOf(anoDeclaracao);
        if (anoIndex !== -1) {
          acc[analista.nome][anoIndex] = quantidadeDeclaracoes; // Atribui a quantidade correta
        }
        return acc; // Retorna o acumulador imutável
      },
      {}
    );

    // Estrutura final para o gráfico: cabeçalho seguido pelos dados de cada analista
    return [
      ["Analista", ...anos],
      ...Object.entries(analistasMap).map(([analista, quantidades]) => [
        analista,
        ...quantidades,
      ]),
    ];
  }, [declaracoesAgrupadasPorAnalista]);

  return (
    <DefaultLayout>
      <h1>Painel analítico</h1>
      <div className="mb-5">
        <span className="text-lg font-extrabold">Filtros</span>
        <div className="flex flex-wrap gap-5">
          <Select label="Inicio" value={ano} options={[{ label: "2021", value: "2021" }, { label: "2022", value: "2022" }, { label: "2023", value: "2023" }, { label: "2024", value: "2024" }]} onChange={(ano: string) => setAno(ano)} />
          <Select label="Fim" value={ano} options={[{ label: "2021", value: "2021" }, { label: "2022", value: "2022" }, { label: "2023", value: "2023" }, { label: "2024", value: "2024" }].filter((ano) => Number(ano.value) > Number(ano))} onChange={(ano: string) => setAno(ano)} />
          <Select label="Região" value={museu ?? undefined} options={Object.keys(regionsMap).map((regiao) => ({ label: regiao, value: regiao }))} onChange={(regiao: string) => setMuseu(regiao)} placeholder="Selecione uma região" />
          <Select label="Estado" disabled value={museu ?? undefined} options={states.map((uf) => ({ label: statesNameMap[uf], value: uf }))} onChange={(uf: string) => setMuseu(uf)} placeholder="Selecione um estado" />
          <Select label="Municipio" disabled value={museu ?? undefined} options={museus?.map((museu: { nome: string, _id: string }) => ({ label: museu.nome, value: museu._id })) ?? []} onChange={(museu: string) => setMuseu(museu)} placeholder="Selecione uma cidade" />
          <Select label="Museu" disabled value={museu ?? undefined} options={museus?.map((museu: { nome: string, _id: string }) => ({ label: museu.nome, value: museu._id })) ?? []} onChange={(museu: string) => setMuseu(museu)} placeholder="Selecione um museu" />
        </div>
      </div>
      <button className="br-button mb-5">aplicar filtros</button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-50 gap-10 auto-rows-fr">
        <div className="br-card p-3">
          <div className="card-header">
            <span className="text-6xl font-extrabold">{declaracoesCount}</span>
          </div>
          <div className="card-content mt-1">
            <span className="text-3xl font-bold">Declarações de {ano} recebidas</span>
          </div>
        </div>
        <div className="br-card p-3">
          <div className="card-header">
            <span className="text-6xl font-extrabold">{declaracoesEmConformidade}</span>
          </div>
          <div className="card-content mt-1">
            <span className="text-3xl font-bold">Declarações de {ano} analisadas</span>
          </div>
        </div>
        <div className="br-card p-3">
          <div className="card-header">
            <span className="text-6xl font-extrabold">10%</span>
          </div>
          <div className="card-content mt-1">
            <span className="text-3xl font-bold">% da meta de {ano} concluida</span>
          </div>
        </div>
        <div className="br-card p-3">
          <div className="card-header">
            <span className="text-6xl font-extrabold">{bensCountTotal}</span>
          </div>
          <div className="card-content mt-1">
            <span className="text-3xl font-bold">Bens de {ano} declarados</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-44">
      <div>
      <span className="text-lg font-gray-600 font-bold">Quantidade de declarações por ano</span>
      <Chart
        chartType="ColumnChart"
        data={[
          ["Ano", "Quantidade"],
          ...Object.entries(declaracoesPorAnoDashboard).map(([ano, quantidade]) => [
            ano,
            quantidade,
          ]),
        ]}
        width="100%"
        height="400px"
        legendToggle
        options={{
          hAxis: {
            titleTextStyle: {color: '#607d8b'},
            gridlines: { count:0},
            textStyle: { color: '#78909c', fontName: 'Roboto', fontSize: '15', bold: true}
          },
          vAxis: {
            minValue: 0,
            gridlines: {color:'#cfd8dc', count:4},
            baselineColor: 'transparent'
          },
          legend: {position: 'top', alignment: 'center', textStyle: {color:'#607d8b', fontName: 'Roboto', fontSize: '15'} },
          colors: ["#3f51b5","#2196f3","#03a9f4","#00bcd4","#009688","#4caf50","#8bc34a","#cddc39"],
          areaOpacity: 0.24,
          lineWidth: 1,
          chartArea: {
            backgroundColor: "transparent",
            width: '100%',
            height: '80%'
          },
          pieSliceBorderColor: '#eceff1',
          pieSliceTextStyle:  {color:'#607d8b' },
          pieHole: 0.9,
          bar: {groupWidth: "100" },
          colorAxis: {colors: ["#3f51b5","#2196f3","#03a9f4","#00bcd4"] },
          backgroundColor: 'transparent',
          datalessRegionColor: '#f00',
          displayMode: 'regions'
        }}
      />
      </div>
      <div>
      <span className="text-lg font-gray-600 font-bold">Quantidade de declarações por estado em {ano}</span>
      <Chart
        chartType="GeoChart"
        data={[
          ["Estado", "Quantidade de declarações"],
          ...Object.entries(declaracoesPorUFs).map(([uf, quantidade]) => [
            statesNameMap[uf as keyof typeof statesNameMap],
            quantidade,
          ]),
          ...states
            .filter((uf) => !declaracoesPorUFs[uf])
            .map((uf) => [statesNameMap[uf as keyof typeof statesNameMap], 0])
        ]}
        width="100%"
        height="400px"
        legendToggle
        mapsApiKey="AIzaSyAHwgrar0tacbSQmteaYxld0sZO_gl4IBg"
        options={{
          region: "BR",
          resolution: "provinces",
          colorAxis: {
            colors: ["#d8eaff", "#3f51b5"],
          },
          colors: ["#3f51b5","#2196f3","#03a9f4","#00bcd4","#009688","#4caf50","#8bc34a","#cddc39"],
          hAxis: {
            titleTextStyle: { color: '#607d8b' },
            gridlines: { count:0},
            textStyle: { color: '#78909c', fontName: 'Roboto', fontSize: '15', bold: true}
          },
          vAxis: {
            minValue: 0,
            gridlines: {color:'#cfd8dc', count:4},
            baselineColor: 'transparent'
          },
          legend: {position: 'top', alignment: 'left', textStyle: {color:'#607d8b', fontName: 'Roboto', fontSize: '15'} },
          areaOpacity: 0.24,
          lineWidth: 1,
          chartArea: {
            backgroundColor: "transparent",
            width: '100%',
            height: '80%'
          },
          pieSliceBorderColor: '#eceff1',
          pieSliceTextStyle:  {color:'#607d8b' },
          pieHole: 0.9,
          bar: {groupWidth: "100" },
          backgroundColor: 'transparent',
          datalessRegionColor: 'transparent',
          displayMode: 'regions',
        }}
      />
      </div>
      <div>
      <span className="text-lg font-gray-600 font-bold">Quantidade de declarações por região em {ano}</span>
      <Chart
        chartType="GeoChart"
        data={[
          ["Região", "Quantidade de declarações"],
          ...declaracoesPorRegiao.flatMap(([regiao, quantidade]) =>
            regionsMap[regiao].map((uf) => [
              { v: statesNameMap[uf as keyof typeof statesNameMap], f: regiao },
              quantidade,
            ])
          ),
        ]}
        width="100%"
        height="400px"
        legendToggle
        mapsApiKey="AIzaSyAHwgrar0tacbSQmteaYxld0sZO_gl4IBg"
        options={{
          region: "BR",
          resolution: "provinces",
          colorAxis: {
            colors: ["#d8eaff", "#3f51b5"],
          },
          colors: ["#3f51b5","#2196f3","#03a9f4","#00bcd4","#009688","#4caf50","#8bc34a","#cddc39"],
          hAxis: {
            titleTextStyle: { color: '#607d8b' },
            gridlines: { count:0},
            textStyle: { color: '#78909c', fontName: 'Roboto', fontSize: '15', bold: true}
          },
          vAxis: {
            minValue: 0,
            gridlines: {color:'#cfd8dc', count:4},
            baselineColor: 'transparent'
          },
          legend: {position: 'top', alignment: 'left', textStyle: {color:'#607d8b', fontName: 'Roboto', fontSize: '15'} },
          areaOpacity: 0.24,
          lineWidth: 1,
          chartArea: {
            backgroundColor: "transparent",
            width: '100%',
            height: '80%'
          },
          pieSliceBorderColor: '#eceff1',
          pieSliceTextStyle:  {color:'#607d8b' },
          pieHole: 0.9,
          bar: {groupWidth: "100" },
          backgroundColor: 'transparent',
          datalessRegionColor: 'transparent',
          displayMode: 'regions',
        }}
      />
      </div>
      <div>
      <span className="text-lg font-gray-600 font-bold">Situação das declarações por região em {ano}</span>
      <Chart
        chartType="ColumnChart"
        data={[["Região", ...status], ...declaracoesPorRegiao.map(([regiao, ...quantidades]) => {
          quantidades.splice(1, 1);
          return [regiao, ...quantidades];
        })]}
        width="100%"
        height="400px"
        legendToggle
        options={{
          hAxis: {
            titleTextStyle: {color: '#607d8b'},
            gridlines: { count:0},
            textStyle: { color: '#78909c', fontName: 'Roboto', fontSize: '15', bold: true}
          },
          vAxis: {
            minValue: 0,
            gridlines: {color:'#cfd8dc', count:4},
            baselineColor: 'transparent'
          },
          legend: {position: 'top', alignment: 'center', textStyle: {color:'#607d8b', fontName: 'Roboto', fontSize: '15'} },
          colors: ["#3f51b5","#2196f3","#03a9f4","#00bcd4","#009688","#4caf50","#8bc34a","#cddc39"],
          areaOpacity: 0.24,
          lineWidth: 1,
          chartArea: {
            backgroundColor: "transparent",
            width: '100%',
            height: '80%'
          },
          pieSliceBorderColor: '#eceff1',
          pieSliceTextStyle:  {color:'#607d8b' },
          pieHole: 0.9,
          bar: {groupWidth: "100" },
          colorAxis: {colors: ["#3f51b5","#2196f3","#03a9f4","#00bcd4"] },
          backgroundColor: 'transparent',
          datalessRegionColor: '#f00',
          displayMode: 'regions'
        }}
      />
      </div>
      {/*
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
      */}
      <div>
      <span className="text-lg font-gray-600 font-bold">Situação das declarações por ano</span>
      <Chart
        chartType="ColumnChart"
        data={[["Ano", "Total", ...status], ...declaracoesPorStatusPorAno.sort((a: number[], b: number[]) => a[0] - b[0])]}
        width="100%"
        height="400px"
        legendToggle
        options={{
          hAxis: {
            titleTextStyle: {color: '#607d8b'},
            gridlines: { count:0},
            textStyle: { color: '#78909c', fontName: 'Roboto', fontSize: '15', bold: true}
          },
          vAxis: {
            minValue: 0,
            gridlines: {color:'#cfd8dc', count:4},
            baselineColor: 'transparent'
          },
          legend: {position: 'top', alignment: 'center', textStyle: {color:'#607d8b', fontName: 'Roboto', fontSize: '15'} },
          colors: ["#3f51b5","#2196f3","#03a9f4","#00bcd4","#009688","#4caf50","#8bc34a","#cddc39"],
          areaOpacity: 0.24,
          lineWidth: 1,
          chartArea: {
            backgroundColor: "transparent",
            width: '100%',
            height: '80%'
          },
          gridlines: {
            color: "none"
          },
          pieSliceBorderColor: '#eceff1',
          pieSliceTextStyle:  {color:'#607d8b' },
          pieHole: 0.9,
          bar: {groupWidth: "100" },
          colorAxis: {colors: ["#3f51b5","#2196f3","#03a9f4","#00bcd4"] },
          backgroundColor: 'transparent',
          datalessRegionColor: '#f00',
          displayMode: 'regions'
        }}
      />
      </div>
      <div>
      <span className="text-lg font-gray-600 font-bold">Quantidade de declarações por analista</span>
      <Chart
        chartType="ColumnChart"
        data={analistasData}
        width="100%"
        height="400px"
        options={{
          hAxis: {
            titleTextStyle: {color: '#607d8b'},
            gridlines: { count:0},
            textStyle: { color: '#78909c', fontName: 'Roboto', fontSize: '15', bold: true}
          },
          vAxis: {
            minValue: 0,
            gridlines: {color:'#cfd8dc', count:4},
            baselineColor: 'transparent'
          },
          legend: {position: 'top', alignment: 'center', textStyle: {color:'#607d8b', fontName: 'Roboto', fontSize: '15'} },
          colors: ["#3f51b5","#2196f3","#03a9f4","#00bcd4","#009688","#4caf50","#8bc34a","#cddc39"],
          areaOpacity: 0.24,
          lineWidth: 1,
          chartArea: {
            backgroundColor: "transparent",
            width: '100%',
            height: '80%'
          },
          pieSliceBorderColor: '#eceff1',
          pieSliceTextStyle:  {color:'#607d8b' },
          pieHole: 0.9,
          bar: {groupWidth: "100" },
          colorAxis: {colors: ["#3f51b5","#2196f3","#03a9f4","#00bcd4"] },
          backgroundColor: 'transparent',
          datalessRegionColor: '#f00',
          displayMode: 'regions'
        }}
      />
      </div>
      <div>
      <span className="text-lg font-gray-600 font-bold">Quantidade de bens por tipo em {ano}</span>
      <Chart
        chartType="ColumnChart"
        data={[
          ["Tipo", "Quantidade"],
          ["Museológico", bensCountPorTipo["museologico"]],
          ["Bibliográfico", bensCountPorTipo["bibliografico"]],
          ["Arquivístico", bensCountPorTipo["arquivistico"]],
        ]}
        width="100%"
        height="400px"
        legendToggle
        options={{
          hAxis: {
            titleTextStyle: {color: '#607d8b'},
            gridlines: { count:0},
            textStyle: { color: '#78909c', fontName: 'Roboto', fontSize: '15', bold: true}
          },
          vAxis: {
            minValue: 0,
            gridlines: {color:'#cfd8dc', count:4},
            baselineColor: 'transparent'
          },
          legend: {position: 'top', alignment: 'center', textStyle: {color:'#607d8b', fontName: 'Roboto', fontSize: '15'} },
          colors: ["#3f51b5","#2196f3","#03a9f4","#00bcd4","#009688","#4caf50","#8bc34a","#cddc39"],
          areaOpacity: 0.24,
          lineWidth: 1,
          chartArea: {
            backgroundColor: "transparent",
            width: '100%',
            height: '80%'
          },
          pieSliceBorderColor: '#eceff1',
          pieSliceTextStyle:  {color:'#607d8b' },
          pieHole: 0.9,
          bar: {groupWidth: "100" },
          colorAxis: {colors: ["#3f51b5","#2196f3","#03a9f4","#00bcd4"] },
          backgroundColor: 'transparent',
          datalessRegionColor: '#f00',
          displayMode: 'regions'
        }}
      />
      </div>
      </div>
    </DefaultLayout>
  );
};

export default IndexPage;
