import React, { forwardRef, useState } from "react"
import type { FieldError } from "react-hook-form"
import clsx from "clsx"

type Props = React.HTMLAttributes<HTMLInputElement> & {
  label: string
  error?: FieldError
  name: string
  options: {
    label: string
    value: string
  }[]
}

const Select = forwardRef<HTMLInputElement, Props>(
  ({ label, options, name, error, ...rest }, ref) => {
    const [open, setOpen] = useState(false)

    return (
      <>
        <div className="br-select">
          <div
            className="br-input"
            tabIndex={0}
            onClick={() => setOpen((prev) => !prev)}
            role="combobox"
            aria-expanded={open}
          >
            <label>{label}</label>
            <input disabled placeholder={label} />
            <button
              className="br-button"
              type="button"
              aria-label="Exibir lista"
              tabIndex={-1}
              data-trigger="data-trigger"
            >
              <i
                className={clsx(
                  "fas",
                  open ? "fa-chevron-up" : "fa-chevron-down"
                )}
                aria-hidden="true"
              ></i>
            </button>
          </div>
          <div className="br-list" role="listbox">
            {options.map((option) => (
              <div
                className="br-item"
                tabIndex={-1}
                key={option.value}
                role="option"
              >
                <div className="br-radio">
                  <input
                    type="radio"
                    name={name}
                    {...rest}
                    value={option.value}
                    ref={ref}
                  />
                  <label htmlFor={option.value}>{option.label}</label>
                </div>
              </div>
            ))}
          </div>
        </div>
        {error && (
          <span className="feedback danger" role="alert">
            <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
            {error.message}
          </span>
        )}
      </>
    )
  }
)

export default Select
