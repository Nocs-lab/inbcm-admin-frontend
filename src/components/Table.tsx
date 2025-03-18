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
import ReactPaginate from "react-paginate"
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
  const sortedUniqueValues = useMemo(
    () => Array.from(uniqueValues.keys()).sort(),
    [uniqueValues]
  )
  const optionMapping = (value: string) => {
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
        // Converte o valor selecionado para número antes de definir o filtro
        column.setFilterValue(value === "" ? "" : value)
      }}
      value={columnFilterValue?.toString()}
    >
      <option value="">Todos</option>
      {sortedUniqueValues.map((value) => (
        <option value={value} key={value}>
          {optionMapping(value)}
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
    autoResetPageIndex: false,
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
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  scope="col"
                  className="cursor-pointer select-none hover:active"
                  onClick={() => header.column.getToggleSortingHandler()}
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
                <label htmlFor="per-page">Itens por página</label>
                <select
                  className="bg-white rounded border border-gray-500 p-1"
                  id="per-page"
                  aria-label="Itens por página"
                  value={table.getState().pagination.pageSize}
                  onChange={(e) =>
                    table.setPageSize(Number(e.currentTarget.value))
                  }
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
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
          <div className="pagination-go-to-page d-none d-sm-flex ml-auto"></div>
          <span className="br-divider d-none d-sm-block mx-3"></span>
          <div className="pagination-arrows ml-auto ml-sm-0">
            <ReactPaginate
              breakLinkClassName="br-button circle"
              breakLabel="..."
              nextLinkClassName="br-button circle"
              nextLabel={
                <i className="fas fa-angle-right" aria-hidden="true"></i>
              }
              onPageChange={({ selected }) => table.setPageIndex(selected)}
              pageRangeDisplayed={5}
              pageCount={table.getPageCount()}
              previousLinkClassName="br-button circle"
              activeClassName="disabled"
              previousLabel={
                <i className="fas fa-angle-left" aria-hidden="true"></i>
              }
              pageLinkClassName="br-button circle"
              renderOnZeroPageCount={null}
            />
          </div>
        </nav>
      </div>
    </div>
  )
}

export default Table
