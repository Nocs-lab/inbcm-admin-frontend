import clsx from "clsx";
import type { FieldError } from "react-hook-form";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  ComponentProps,
} from "react";

type Props = ComponentProps<"input"> & {
  label: string;
  error?: FieldError;
  file?: File | null;
  setFile?: (file: File | null) => void;
};

// TODO: Criar um componente exclusivo para upload de arquivos
const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, name, type, error, file, setFile, ...rest }, outerRef) => {
    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(outerRef, () => innerRef.current!, []);

    const [seePassword, setSeePassword] = useState(false);

    const isPassword = type === "password";
    const isFile = type === "file";
    const inputType = isPassword && seePassword ? "text" : type;

    return (
      <div
        className={clsx(
          "w-full",
          isFile ? "br-upload" : "br-input",
          error && !isFile && "danger",
          isPassword && "input-button",
        )}
        data-danger={isFile && error ? "data-danger" : undefined}
      >
        <label className={clsx(isFile && "upload-label")} htmlFor={name}>
          <span>{label}</span>
        </label>
        <input
          className={clsx(isFile && "upload-input")}
          type={inputType}
          {...rest}
          ref={innerRef}
          name={name}
          id={name}
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
            <i
              className={clsx("fas", seePassword ? "fa-eye-slash" : "fa-eye")}
              aria-hidden="true"
            ></i>
          </button>
        )}
        {isFile && (
          <>
            <button
              className="upload-button"
              type="button"
              aria-hidden="true"
              onClick={() => innerRef.current?.click()}
            >
              <i className="fas fa-upload" aria-hidden="true"></i>
              <span>Selecione o arquivo</span>
            </button>
            <div className="upload-list">
              {file && (
                <div className="br-item d-flex">
                  <div className="content text-primary-default mr-auto">
                    {file.name}
                  </div>
                  <div className="name"></div>
                  <div
                    className="br-tooltip"
                    role="tooltip"
                    data-popper-placement="top"
                    style={{
                      position: "absolute",
                      inset: "auto auto 0px 0px",
                      margin: "0px",
                      transform: "translate(130px, -46px)",
                    }}
                  >
                    <span className="text" role="tooltip">
                      {file.name}
                    </span>
                    <div
                      data-popper-arrow=""
                      className="arrow"
                      style={{
                        position: "absolute",
                        left: "0px",
                        transform: "translate(68px, 0px)",
                      }}
                    ></div>
                  </div>
                  <div className="support mr-n2">
                    <span className="mr-1">
                      {(file.size / 1024).toFixed(2)} KB
                    </span>
                    <button
                      className="br-button"
                      type="button"
                      aria-label={`Remover ${file.name}`}
                      onClick={() => {
                        setFile?.(null);
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
    );
  },
);

export default Input;
