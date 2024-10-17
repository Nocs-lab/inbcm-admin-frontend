import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
  Column,
  ColumnFiltersState,
  RowData,
  VisibilityState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import clsx from "clsx";
import { format } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal } from "react-dsgov";
import DefaultLayout from "../../layouts/default";
import request from "../../utils/request";
import { stateRegions } from ".././../utils/regioes";
import { Link } from "react-router-dom";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "select";
  }
}

const columnHelper = createColumnHelper<{
  _id: string;
  anoDeclaracao: string;
  retificacao: boolean;
  status: string;
  dataCriacao: Date;
  regiao: string;
  museu_id: {
    _id: string;
    nome: string;
    endereco: {
      municipio: string;
      uf: string;
      regiao: string;
    };
  };
}>();

const columns = [
  columnHelper.accessor("anoDeclaracao", {
    cell: (info) => info.getValue(),
    header: "Ano",
    meta: {
      filterVariant: "select",
    },
  }),
  columnHelper.accessor("retificacao", {
    cell: (info) => (info.getValue() ? "Retificada" : "Original"),
    header: "Tipo",
    meta: {
      filterVariant: "select",
    },

  }),
  columnHelper.accessor("dataCriacao", {
    cell: (info) => format(info.getValue(), "dd/MM/yyyy HH:mm"),
    header: "Recebido em",
    enableColumnFilter: false,
  }),
  columnHelper.accessor("museu_id.endereco.regiao", {
    cell: (info) => info.getValue(),
    header: "Região",
    enableColumnFilter: true,
    meta: {
      filterVariant: "select",
    },
  }),
  columnHelper.accessor("museu_id.nome", {
    cell: (info) => info.getValue(),
    header: "Museu",
  }),
  columnHelper.accessor("museu_id.endereco.municipio", {
    cell: (info) => info.getValue(),
    header: "Cidade",
  }),
  columnHelper.accessor("museu_id.endereco.uf", {
    cell: (info) => info.getValue(),
    header: "UF",
    meta: {
      filterVariant: "select",
    },
  }),
  columnHelper.accessor("status", {
    cell: (info) => {
      const status = info.getValue();

      return (
        <span className="whitespace-nowrap font-bold">
          {status}
        </span>
      )
    },
    header: "Situação",
    enableColumnFilter: false,
  }),
  columnHelper.display({
    id: "enviarParaAnalise",
    header: "Ações",
    cell: ({ row }) => {
      const [modalAberta, setModalAberta] = useState(false);

      const { mutate, isPending } = useMutation({
        mutationFn: () => {
          return request(`/api/admin/declaracoes/atualizarStatus/${row.original._id}`, {
            method: "PUT",
            data: {
              status: "Em análise",
            },
          });
        },
        onSuccess: () => {
          window.location.reload();
        },
      });

      return (
        <>
          <Modal
            useScrim
            showCloseButton
            title="Confirmar"
            modalOpened={modalAberta}
            onCloseButtonClick={() => setModalAberta(false)}
          >
            <Modal.Body>
              Tem certeza que deseja enviar esta declaração para análise?
            </Modal.Body>
            <Modal.Footer justify-content="end">
              <Button primary small m={2} loading={isPending} onClick={mutate}>
                Confirmar
              </Button>
              <Button
                secondary
                small
                m={2}
                onClick={() => setModalAberta(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
            </Modal.Footer>
          </Modal>
          <Button small onClick={() => setModalAberta(true)} className="!font-thin">
            <i className="fa-solid fa-magnifying-glass-arrow-right p-2"></i>
            Enviar para análise
          </Button>
        </>
      );
    },
  }),
  columnHelper.display({
    id: "definirStatus",
    header: "Ações",
    cell: ({ row }) => {
      const [modalAberta, setModalAberta] = useState(false);

      const { mutate, isPending } = useMutation({
        mutationFn: (status: "Em conformidade" | "Não conformidade") => {
          return request(`/api/admin/declaracoes/atualizarStatus/${row.original._id}`, {
            method: "PUT",
            data: {
              status,
            },
          });
        },
        onSuccess: () => {
          window.location.reload();
        },
      });

      return (
        <>
          <Modal
            useScrim
            showCloseButton
            title="Alterar status"
            modalOpened={modalAberta}
            onCloseButtonClick={() => setModalAberta(false)}
          >
            <Modal.Body>Informe o novo status da declaração:</Modal.Body>
            <Modal.Footer justify-content="end">
              <Button
                primary
                small
                m={2}
                loading={isPending}
                onClick={() => mutate("Em conformidade")}
              >
                Alterar para "Em conformidade"
              </Button>
              <Button
                primary
                small
                m={2}
                loading={isPending}
                onClick={() => mutate("Não conformidade")}
              >
                Alterar para "Não conformidade"
              </Button>
              <Button
                secondary
                small
                m={2}
                onClick={() => setModalAberta(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
            </Modal.Footer>
          </Modal>
          <Button small onClick={() => setModalAberta(true)} className="!font-thin">
            <i className="fa-solid fa-circle-check p-2"></i>
            Concluir análise
          </Button>
        </>
      );
    },
  }),
  columnHelper.accessor("_id", {
    cell: (info) => (
      <Link to={`/declaracoes/${info.getValue()}`}>Visualizar</Link>
    ),
    header: "Visualizar",
    enableColumnFilter: false,
  }),
];

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.HTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.currentTarget.value)}
    />
  );
}

function Filter({ column }: { column: Column<any, unknown> }) {
  const { filterVariant } = column.columnDef.meta ?? {};
  const columnFilterValue = column.getFilterValue();
  const sortedUniqueValues = useMemo(
    () => Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues(), filterVariant],
  );

  return filterVariant === "select" ? (
    <select
      onChange={(e) => column.setFilterValue(e.target.value ?? "")}
      value={columnFilterValue?.toString()}
    >
      <option value="">Todas</option>
      {sortedUniqueValues.sort((a, b) => b - a).map((value) => (
        <option value={value} key={value}>
          {value}
        </option>
      ))}
    </select>
  ) : (
    <>
      <datalist id={column.id + "list"}>
        {sortedUniqueValues.map((value: any) => (
          <option value={value} key={value} />
        ))}
      </datalist>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? "") as string}
        onChange={(value) => column.setFilterValue(value)}
        placeholder={`Pesquisar... (${column.getFacetedUniqueValues().size})`}
        className="w-full border shadow rounded"
        list={column.id + "list"}
      />
      <div className="h-1" />
    </>
  );
}

const DeclaracoesPage = () => {
  const { data: result } = useSuspenseQuery({
    queryKey: ["declaracoes"],
    queryFn: async () => {
      const response = await request("/api/admin/declaracoes/declaracoesFiltradas", {
        method: "POST",
      });
      return response.json();
    },
  });

  const data = useMemo(
    () =>
      result.data.map((row) => ({
        ...row,
        museu_id: {
          ...row.museu_id,
          endereco: {
            ...row.museu_id.endereco,
            regiao:
              stateRegions[
                row.museu_id.endereco.uf as keyof typeof stateRegions
              ],
          },
        },
      })),
    [result],
  );

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    { id: "status", value: "Recebida" },
  ]);
  const [visibility, setVisibility] = useState<VisibilityState>({
    status: false,
    definirStatus: false,
    _id: true
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      columnVisibility: visibility,
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });

  return (
    <DefaultLayout>
      <h2>Listagem de Declarações</h2>
      <div className="br-tab small">
        <nav className="tab-nav">
          <ul>
            <li
              className={clsx(
                "tab-item",
                columnFilters.some(
                  (f) => f.id === "status" && f.value === "Recebida",
                ) && "active",
              )}
              title="Recebidas"
            >
              <button
                type="button"
                data-panel="panel-4-small"
                onClick={() => {
                  table.setColumnFilters((old) => [
                    ...old.filter((f) => f.id !== "status"),
                    { id: "status", value: "Recebida" },
                  ]);
                  table.setColumnVisibility((old) => ({
                    ...old,
                    status: false,
                    enviarParaAnalise: true,
                    definirStatus: false,
                  }));
                }}
              >
                <span className="name">Recebidas</span>
              </button>
            </li>
            <li
              className={clsx(
                "tab-item",
                columnFilters.some(
                  (f) => f.id === "status" && f.value === "Em análise",
                ) && "active",
              )}
              title="Em análise"
            >
              <button
                type="button"
                data-panel="panel-3-small"
                onClick={() => {
                  table.setColumnFilters((old) => [
                    ...old.filter((f) => f.id !== "status"),
                    { id: "status", value: "Em análise" },
                  ]);
                  table.setColumnVisibility((old) => ({
                    ...old,
                    status: false,
                    enviarParaAnalise: false,
                    definirStatus: true,
                  }));
                }}
              >
                <span className="name">Em análise</span>
              </button>
            </li>
            <li
              className={clsx(
                "tab-item",
                columnFilters.some(
                  (f) => f.id === "status" && f.value === "Em conformidade",
                ) && "active",
              )}
              title="Em conformidade"
            >
              <button
                type="button"
                data-panel="panel-2-small"
                onClick={() => {
                  table.setColumnFilters((old) => [
                    ...old.filter((f) => f.id !== "status"),
                    { id: "status", value: "Em conformidade" },
                  ]);
                  table.setColumnVisibility((old) => ({
                    ...old,
                    status: false,
                    enviarParaAnalise: false,
                    definirStatus: false,
                  }));
                }}
              >
                <span className="name">Em conformidade</span>
              </button>
            </li>
            <li
              className={clsx(
                "tab-item",
                columnFilters.some(
                  (f) => f.id === "status" && f.value === "Não conformidade",
                ) && "active",
              )}
              title="Em conformidade"
            >
              <button
                type="button"
                data-panel="panel-2-small"
                onClick={() => {
                  table.setColumnFilters((old) => [
                    ...old.filter((f) => f.id !== "status"),
                    { id: "status", value: "Não conformidade" },
                  ]);
                  table.setColumnVisibility((old) => ({
                    ...old,
                    status: false,
                    enviarParaAnalise: false,
                    definirStatus: false,
                  }));
                }}
              >
                <span className="name">Não conformidade</span>
              </button>
            </li>
            <li
              className={clsx(
                "tab-item",
                !columnFilters.some((f) => f.id === "status") && "active",
              )}
              title="Todas"
            >
              <button
                type="button"
                data-panel="panel-1-small"
                onClick={() => {
                  table.setColumnFilters((old) =>
                    old.filter((f) => f.id !== "status"),
                  );
                  table.setColumnVisibility((old) => ({
                    ...old,
                    status: true,
                    enviarParaAnalise: false,
                    definirStatus: false,
                  }));
                }}
              >
                <span className="name">Todas</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
      {table.getRowCount() > 0 ? (
        <div
          className="br-table overflow-auto"
          data-search="data-search"
          data-selection="data-selection"
          data-collapse="data-collapse"
          data-random="data-random"
        >
          <table>
            <caption>Título da Tabela</caption>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th key={header.id} colSpan={header.colSpan} scope="col">
                        {header.isPlaceholder ? null : (
                          <>
                            <div
                              {...{
                                className: header.column.getCanSort()
                                  ? "cursor-pointer select-none"
                                  : "",
                                onClick:
                                  header.column.getToggleSortingHandler(),
                              }}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                              {{
                                asc: " 🔼",
                                desc: " 🔽",
                              }[header.column.getIsSorted() as string] ?? null}
                            </div>
                            {header.column.getCanFilter() && (
                              <div>
                                <Filter column={header.column} />
                              </div>
                            )}
                          </>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} data-th={cell.column.columnDef.header}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">
            <nav
              className="br-pagination"
              aria-label="paginação"
              data-total="50"
              data-current="1"
              data-per-page="20"
            >
              <div className="pagination-per-page">
                <div className="br-select">
                  <div className="br-input">
                    <label htmlFor="per-page-selection-random-90012">
                      Exibir
                    </label>
                    <input
                      id="per-page-selection-random-90012"
                      type="text"
                      placeholder=" "
                    />
                    <button
                      className="br-button"
                      type="button"
                      aria-label="Exibir lista"
                      tabIndex={-1}
                      data-trigger="data-trigger"
                    >
                      <i className="fas fa-angle-down" aria-hidden="true"></i>
                    </button>
                  </div>
                  <div className="br-list" tabIndex={0}>
                    <div className="br-item" tabIndex={-1}>
                      <div className="br-radio">
                        <input
                          id="per-page-10-random-90012"
                          type="radio"
                          name="per-page-random-90012"
                          value="per-page-10-random-90012"
                          checked
                        />
                        <label htmlFor="per-page-10-random-90012">10</label>
                      </div>
                    </div>
                    <div className="br-item" tabIndex={-1}>
                      <div className="br-radio">
                        <input
                          id="per-page-20-random-90012"
                          type="radio"
                          name="per-page-random-90012"
                          value="per-page-20-random-90012"
                        />
                        <label htmlFor="per-page-20-random-90012">20</label>
                      </div>
                    </div>
                    <div className="br-item" tabIndex={-1}>
                      <div className="br-radio">
                        <input
                          id="per-page-30-random-90012"
                          type="radio"
                          name="per-page-random-90012"
                          value="per-page-30-random-90012"
                        />
                        <label htmlFor="per-page-30-random-90012">30</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <span className="br-divider d-none d-sm-block mx-3"></span>
              <div className="pagination-information d-none d-sm-flex">
                <span className="current">
                  {table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    1}
                </span>
                &ndash;
                <span className="per-page">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) *
                      table.getState().pagination.pageSize,
                    data.length,
                  )}
                </span>
                &nbsp;de&nbsp;
                <span className="total">{table.getRowCount()}</span>
                &nbsp;itens
              </div>
              <div className="pagination-go-to-page d-none d-sm-flex ml-auto">
                <div className="br-select">
                  <div className="br-input">
                    <label htmlFor="go-to-selection-random-55067">Página</label>
                    <input
                      id="go-to-selection-random-55067"
                      type="text"
                      placeholder=" "
                    />
                    <button
                      className="br-button"
                      type="button"
                      aria-label="Exibir lista"
                      tabIndex={-1}
                      data-trigger="data-trigger"
                    >
                      <i className="fas fa-angle-down" aria-hidden="true"></i>
                    </button>
                  </div>
                  <div className="br-list" tabIndex={0}>
                    <div className="br-item" tabIndex={-1}>
                      <div className="br-radio">
                        <input
                          id="go-to-1-random-55067"
                          type="radio"
                          name="go-to-random-55067"
                          value="go-to-1-random-55067"
                          checked
                        />
                        <label htmlFor="go-to-1-random-55067">1</label>
                      </div>
                    </div>
                    <div className="br-item" tabIndex={-1}>
                      <div className="br-radio">
                        <input
                          id="go-to-2-random-55067"
                          type="radio"
                          name="go-to-random-55067"
                          value="go-to-2-random-55067"
                        />
                        <label htmlFor="go-to-2-random-55067">2</label>
                      </div>
                    </div>
                    <div className="br-item" tabIndex={-1}>
                      <div className="br-radio">
                        <input
                          id="go-to-3-random-55067"
                          type="radio"
                          name="go-to-random-55067"
                          value="go-to-3-random-55067"
                        />
                        <label htmlFor="go-to-3-random-55067">3</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <span className="br-divider d-none d-sm-block mx-3"></span>
              <div className="pagination-arrows ml-auto ml-sm-0">
                <button
                  className="br-button circle"
                  type="button"
                  aria-label="Voltar página"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <i className="fas fa-angle-left" aria-hidden="true"></i>
                </button>
                <button
                  className="br-button circle"
                  type="button"
                  aria-label="Página seguinte"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <i className="fas fa-angle-right" aria-hidden="true"></i>
                </button>
              </div>
            </nav>
          </div>
        </div>
      ) : (
        <div className="br-message info">
          <div className="icon">
            <i className="fas fa-info-circle fa-lg" aria-hidden="true"></i>
          </div>
          <div
            className="content"
            aria-label="Informação. Seus dados só serão salvos após o preenchimento do primeiro campo do formulário."
            role="alert"
          >
            <span className="message-body">Nenhum registro encontrado</span>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default DeclaracoesPage;
