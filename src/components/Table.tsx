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
    />
  )
}

function Filter({ column }: { column: Column<unknown, unknown> }) {
  const { filterVariant } = column.columnDef.meta ?? {}
  const columnFilterValue = column.getFilterValue()
  const uniqueValues = column.getFacetedUniqueValues()
  const sortedUniqueValues = useMemo(
    () => Array.from(uniqueValues.keys()).sort(),
    [uniqueValues]
  )

  return filterVariant === "select" ? (
    <select
      onChange={(e) => column.setFilterValue(e.currentTarget.value)}
      value={columnFilterValue?.toString()}
    >
      <option value="">Todos</option>
      {sortedUniqueValues.map((value) => (
        <option value={value} key={value}>
          {value}
        </option>
      ))}
    </select>
  ) : (
    <>
      <datalist id={column.id + "list"}>
        {sortedUniqueValues.map((value: string) => (
          <option value={value} key={value} />
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
}> = ({ title, data, columns, actions }) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [visibility, setVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      columnVisibility: visibility
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <div
      className="br-table overflow-auto"
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
              {headerGroup.headers.map((header) => {
                const isActionsColumn =
                  header.column.id === "_id" &&
                  header.column.columnDef.header === "Ações"
                return (
                  <th key={header.id} colSpan={header.colSpan} scope="col">
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : "",
                            onClick: header.column.getToggleSortingHandler()
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {!isActionsColumn &&
                            ({
                              asc: " ⬆️",
                              desc: " ⬇️"
                            }[header.column.getIsSorted() as string] ??
                              " ➡️")}
                        </div>
                        {header.column.getCanFilter() && (
                          <Filter
                            column={header.column as Column<unknown, unknown>}
                          />
                        )}
                      </>
                    )}
                  </th>
                )
              })}
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
                  <td key={cell.id} data-th={cell.column.columnDef.header}>
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
                <label htmlFor="per-page-selection-random-90012">Exibir</label>
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
                data.length
              )}
            </span>
            &nbsp;de&nbsp;<span className="total">{data.length}</span>
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
  )
}

export default Table
