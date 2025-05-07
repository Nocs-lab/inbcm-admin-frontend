import React, { useEffect, useMemo, useState } from "react"
import {
  Column,
  ColumnFiltersState,
  RowData,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  ColumnDef,
  flexRender,
  VisibilityState
} from "@tanstack/react-table"
import { FaCaretUp, FaCaretDown } from "react-icons/fa"
import clsx from "clsx"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "select"
  }
}

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  type = "text",
  placeholder,
  list,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
  type?: "text" | "number"
  placeholder?: string
  list?: string
} & Omit<React.HTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return (
    <input
      {...props}
      value={value}
      type={type}
      placeholder={placeholder}
      list={list}
      onChange={(e) => setValue(e.currentTarget.value)}
      className={clsx(props.className, "p-1 border border-gray-700 text-xs")}
    />
  )
}

function Filter({ column }: { column: Column<unknown, unknown> }) {
  const { filterVariant } = column.columnDef.meta ?? {}
  const columnFilterValue = column.getFilterValue()
  const uniqueValues = column.getFacetedUniqueValues()
  const sortedUniqueValues = useMemo(() => {
    if (column.id === "retificacao") {
      return ["true", "false"]
    }
    if (column.id === "acervo") {
      return ["A", "B", "M"]
    }
    return Array.from(uniqueValues.keys()).sort()
  }, [uniqueValues, column.id])

  const optionMapping = (value: string) => {
    if (column.id === "retificacao") {
      return value === "true" ? "Retificadora" : "Original"
    }
    if (column.id === "acervo") {
      return value
    }
    switch (value.toString()) {
      case "0":
        return "Para aprovar"
      case "1":
        return "Ativo"
      case "2":
        return "Inativo"
      case "3":
        return "Não aprovado"
      case "admin":
        return "Administrador"
      case "analyst":
        return "Analista"
      case "declarant":
        return "Declarante"
      default:
        return value
    }
  }

  if (filterVariant === "date") {
    return (
      <input
        type="date"
        value={(columnFilterValue ?? "") as string}
        onChange={(e) => column.setFilterValue(e.target.value)}
        className="p-1 border border-gray-700 text-xs"
      />
    )
  }

  return filterVariant === "select" ? (
    <select
      onChange={(e) => {
        const value = e.currentTarget.value
        column.setFilterValue(value === "" ? "" : value)
      }}
      value={columnFilterValue?.toString()}
    >
      <option value="">(Todos)</option>
      {sortedUniqueValues.map((value) => (
        <option value={value} key={JSON.stringify(value)}>
          {optionMapping(value) !== value ? optionMapping(value) : value}
        </option>
      ))}
    </select>
  ) : (
    <>
      <datalist id={column.id + "list"}>
        {sortedUniqueValues.map((value: string) => (
          <option value={value} key={JSON.stringify(value)} />
        ))}
      </datalist>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? "") as string}
        onChange={(value) => column.setFilterValue(value)}
        placeholder={`Pesquisar... (${column.getFacetedUniqueValues().size})`}
        className="w-36 border shadow rounded"
        list={column.id + "list"}
      />
      <div className="h-1" />
    </>
  )
}

const Table: React.FC<{
  title?: string
  actions?: JSX.Element
  data: unknown[]
  columns: ColumnDef<unknown>[]
  itensPagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    onPageChange: (page: number) => void
    onLimitChange: (limit: number) => void
  }
}> = ({ title, data, columns, actions, itensPagination }) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [visibility, setVisibility] = useState<VisibilityState>({})
  const [frontendPagination, setFrontendPagination] = useState({
    pageIndex: 0,
    pageSize: 10 // Define o valor inicial como 10 itens por página
  })

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageIndex: itensPagination ? itensPagination.page - 1 : 0,
        pageSize: itensPagination ? itensPagination.limit : 10
      }
    },
    state: {
      columnFilters,
      columnVisibility: visibility,
      pagination: itensPagination
        ? {
            pageIndex: itensPagination.page - 1,
            pageSize: itensPagination.limit
          }
        : frontendPagination // Usa o estado de paginação do frontend
    },
    autoResetPageIndex: false,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setVisibility,
    onPaginationChange: !itensPagination
      ? setFrontendPagination // Atualiza o estado de paginação no frontend
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination: !!itensPagination,
    pageCount: itensPagination?.totalPages
  })

  const PaginationFooter = () => {
    // Modo com paginação do backend
    if (itensPagination) {
      return (
        <div className="table-footer">
          <nav className="br-pagination" aria-label="paginação">
            <div className="pagination-per-page">
              <div className="br-select">
                <div className="br-input">
                  <label htmlFor="per-page-selection">Exibir</label>
                  <select
                    id="per-page-selection"
                    value={itensPagination.limit}
                    onChange={(e) =>
                      itensPagination.onLimitChange(Number(e.target.value))
                    }
                  >
                    {[10, 20, 30, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <span className="br-divider d-none d-sm-block mx-3"></span>

            <div className="pagination-information d-none d-sm-flex">
              <span>
                {(itensPagination.page - 1) * itensPagination.limit + 1}
              </span>
              &ndash;
              <span>
                {Math.min(
                  itensPagination.page * itensPagination.limit,
                  itensPagination.total
                )}
              </span>
              &nbsp;de&nbsp;<span>{itensPagination.total}</span>
              &nbsp;itens
            </div>

            <div className="pagination-go-to-page d-none d-sm-flex ml-auto">
              <div className="br-input">
                <label htmlFor="go-to-page">Página</label>
                <input
                  id="go-to-page"
                  type="number"
                  min="1"
                  max={itensPagination.totalPages}
                  value={itensPagination.page}
                  onChange={(e) => {
                    const page = Math.max(
                      1,
                      Math.min(
                        Number(e.target.value),
                        itensPagination.totalPages
                      )
                    )
                    itensPagination.onPageChange(page)
                  }}
                />
              </div>
            </div>

            <span className="br-divider d-none d-sm-block mx-3"></span>

            <div className="pagination-arrows ml-auto ml-sm-0">
              <button
                className="br-button circle"
                type="button"
                aria-label="Voltar página"
                onClick={() =>
                  itensPagination.onPageChange(itensPagination.page - 1)
                }
                disabled={itensPagination.page <= 1}
              >
                <i className="fas fa-angle-left" aria-hidden="true"></i>
              </button>
              <button
                className="br-button circle"
                type="button"
                aria-label="Página seguinte"
                onClick={() =>
                  itensPagination.onPageChange(itensPagination.page + 1)
                }
                disabled={itensPagination.page >= itensPagination.totalPages}
              >
                <i className="fas fa-angle-right" aria-hidden="true"></i>
              </button>
            </div>
          </nav>
        </div>
      )
    }

    // Modo com paginação do frontend
    return (
      <div className="table-footer">
        <nav className="br-pagination" aria-label="paginação">
          <div className="pagination-per-page">
            <div className="br-select">
              <div className="br-input">
                <label htmlFor="per-page-selection">Exibir</label>
                <select
                  id="per-page-selection"
                  value={frontendPagination.pageSize}
                  onChange={(e) =>
                    setFrontendPagination((prev) => ({
                      ...prev,
                      pageSize: Number(e.target.value),
                      pageIndex: 0 // Reseta para a primeira página
                    }))
                  }
                >
                  {[10, 20, 30, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <span className="br-divider d-none d-sm-block mx-3"></span>

          <div className="pagination-go-to-page d-none d-sm-flex ml-auto">
            <span>
              {frontendPagination.pageIndex * frontendPagination.pageSize + 1}
            </span>
            &ndash;
            <span>
              {Math.min(
                (frontendPagination.pageIndex + 1) *
                  frontendPagination.pageSize,
                data.length
              )}
            </span>
            &nbsp;de&nbsp;<span>{data.length}</span>
            &nbsp;itens
          </div>

          <div className="pagination-arrows ml-auto ml-sm-0">
            <button
              className="br-button circle"
              type="button"
              aria-label="Voltar página"
              onClick={() =>
                setFrontendPagination((prev) => ({
                  ...prev,
                  pageIndex: prev.pageIndex - 1
                }))
              }
              disabled={frontendPagination.pageIndex <= 0}
            >
              <i className="fas fa-angle-left" aria-hidden="true"></i>
            </button>
            <button
              className="br-button circle"
              type="button"
              aria-label="Página seguinte"
              onClick={() =>
                setFrontendPagination((prev) => ({
                  ...prev,
                  pageIndex: prev.pageIndex + 1
                }))
              }
              disabled={
                (frontendPagination.pageIndex + 1) *
                  frontendPagination.pageSize >=
                data.length
              }
            >
              <i className="fas fa-angle-right" aria-hidden="true"></i>
            </button>
          </div>
        </nav>
      </div>
    )
  }

  return (
    <div
      className="br-table "
      data-search="data-search"
      data-selection="data-selection"
      data-collapse="data-collapse"
      data-random="data-random"
    >
      {(title || actions) && (
        <div className="table-header">
          <div className="top-bar">
            <div className="table-title">{title}</div>
            {actions && (
              <div className="actions-trigger text-nowrap">{actions}</div>
            )}
          </div>
        </div>
      )}
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  scope="col"
                  className="cursor-pointer select-none hover:active text-xs p-2"
                  onClick={() => header.column.getToggleSortingHandler()}
                  style={{ minWidth: "80px" }}
                >
                  {header.isPlaceholder ? null : (
                    <>
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() &&
                          {
                            asc: <FaCaretUp />,
                            desc: <FaCaretDown />
                          }[header.column.getIsSorted() as string]}
                      </div>
                      {header.column.getCanFilter() && (
                        <Filter
                          column={header.column as Column<unknown, unknown>}
                        />
                      )}
                    </>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => {
                // Verifica se a coluna é a de status
                const isStatusColumn = cell.column.id === "status"

                return (
                  <td
                    key={cell.id}
                    data-th={cell.column.columnDef.header}
                    className="text-xs p-2"
                    style={{ wordBreak: "break-word" }}
                  >
                    <span
                      className={`text-base text-center ${isStatusColumn ? "font-bold" : ""}`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <PaginationFooter />
    </div>
  )
}

export default Table
