# INBCM Frontend de Administração

## Principais funcionalidades

- Visualizar declarações recebidas
- Visualizar gráficos com dados das declarações

## Principais tecnologias e bibliotecas utilizadas

- [Node.js](https://nodejs.org/): Ambiente de execução JavaScript
- [TypeScript](https://www.typescriptlang.org/): Superset de JavaScript que adiciona tipagem estática
- [React](https://react.dev/): Biblioteca para construção de interfaces
- [Tailwind CSS](https://tailwindcss.com/): Framework CSS
- [Design System do Governo Federal](https://www.gov.br/ds/home): Padrão digital de design do governo federal
- [Tanstack Query](https://tanstack.com/query/latest/): Biblioteca para gerenciamento de estado e cache de dados vindos da API
- [Tanstack Table](https://tanstack.com/table/latest/): Biblioteca para construção de tabelas
- [React Hook Form](https://react-hook-form.com/): Biblioteca para construção de formulários
- [Vite](https://vitejs.dev/): Bundler e servidor de desenvolvimento

## Estrutura de pastas

- `src`: Código-fonte da aplicação
  - `components`: Componentes React que são utilizados em mais de uma página
  - `pages`: Páginas da aplicação (cada arquivo corresponde a uma rota, ex: `src/pages/index.tsx` corresponde à rota `/` e `src/pages/submissoes/novo.tsx` corresponde à rota `/submissoes/novo`)
  - `layouts`: Layouts da aplicação (cabeçalho, rodapé, etc)
  - `images`: Imagens utilizadas na aplicação
  - `utils`: Funções utilitárias

## Como rodar o projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/)
- [PNPM](https://pnpm.io/)

### Passos

1. Clone o repositório
2. Instale as dependências com `pnpm install`
3. Execute o servidor de desenvolvimento com `pnpm dev`
