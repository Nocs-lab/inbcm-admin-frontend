import { useState, useRef } from "preact/hooks"
import { forwardRef, useImperativeHandle } from "preact/compat"
import clsx from "clsx"
import type { FieldError } from "react-hook-form"

type Props = React.HTMLAttributes<HTMLInputElement> & {
  label: string
  error?: FieldError
}

const Input = forwardRef<HTMLInputElement, Props>(({ label, name, type, error, ...rest }, outerRef) => {
  const innerRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(outerRef, () => innerRef.current!, []);

  const [seePassword, setSeePassword] = useState(false)

  const isPassword = type === "password"
  const isFile = type === "file"
  const inputType = isPassword && seePassword ? "text" : type

  const [file, setFile] = useState<File | null>(null)

  return (
    <div
      className={clsx(isFile ? "br-upload" : "br-input", error && !isFile && "danger", isPassword && "input-button")}
      data-danger={isFile && error ? "data-danger" : undefined}
    >
      <label className={clsx(isFile && "upload-label")} htmlFor={name}>
        <span>
          {label}
        </span>
      </label>
      <input
        className={clsx(isFile && "upload-input")}
        type={inputType}
        {...rest}
        ref={innerRef}
        name={name}
        onChange={(e) => {
          rest.onChange?.(e)
          if (isFile) {
            setFile(e.currentTarget.files?.[0] ?? null)
          }
        }}
      />
      {isPassword && (
        <button
          className="br-button"
          type="button"
          aria-label={seePassword ? "Ocultar senha" : "Mostrar senha"}
          role="switch"
          aria-checked={seePassword}
          onClick={() => setSeePassword((prev) => !prev)}
        >
          <i className={clsx("fas", seePassword ? "fa-eye-slash" : "fa-eye")} aria-hidden="true"></i>
        </button>
      )}
      {isFile && (
        <>
          <button className="upload-button" type="button" aria-hidden="true" onClick={() => innerRef.current?.click()}>
            <i className="fas fa-upload" aria-hidden="true"></i>
            <span>Selecione o arquivo</span>
          </button>
          <div className="upload-list">
            {file && (
              <div className="br-item d-flex">
                <div className="content text-primary-default mr-auto">{file.name}</div>
                <div className="name"></div>
                <div
                  className="br-tooltip"
                  role="tooltip"
                  data-popper-placement="top"
                  style="position: absolute; inset: auto auto 0px 0px; margin: 0px; transform: translate(130px, -46px);"
                >
                  <span className="text" role="tooltip">{file.name}</span>
                  <div data-popper-arrow="" className="arrow" style="position: absolute; left: 0px; transform: translate(68px, 0px);"></div>
                </div>
                <div className="support mr-n2">
                  <span className="mr-1">{(file.size / 1024).toFixed(2)} KB</span>
                  <button
                    className="br-button"
                    type="button"
                    aria-label={`Remover ${file.name}`}
                    onClick={() => {
                      innerRef.current!.value = ""
                      setFile(null)
                    }}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      {error && (
        <span className="feedback danger" role="alert" id="danger">
          <i className="fas fa-times-circle" aria-hidden="true"></i>
          {error.message}
        </span>
      )}
    </div>
  )
})

export default Input

