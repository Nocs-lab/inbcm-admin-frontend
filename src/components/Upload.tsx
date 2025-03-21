import { useEffect, useRef, useState, type ComponentProps } from "react"

type Props = Omit<ComponentProps<"input">, "value"> & {
  onChange: (files: File | null) => void
  value: File | null
  error?: string
  multiple?: boolean
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const Upload: React.FC<Props> = ({
  onChange,
  value,
  error,
  multiple = false,
  ...props
}) => {
  const [files, setFiles] = useState<File | null>(value)
  const [fileError, setFileError] = useState<string | null>(null)

  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setFiles(value)
  }, [value])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null

    if (file) {
      // Verifica a extensão do arquivo
      const allowedExtensions = [".pdf", ".doc", ".docx", ".txt"]
      const fileExtension = file.name.split(".").pop()?.toLowerCase()

      if (!fileExtension || !allowedExtensions.includes(`.${fileExtension}`)) {
        setFileError(
          "Somente arquivos .pdf, .doc, .docx e .txt são permitidos."
        )
        e.target.value = "" // Limpa o input
        onChange(null) // Notifica o componente pai
        return
      }

      // Verifica o tamanho do arquivo
      if (file.size > MAX_FILE_SIZE) {
        setFileError("O arquivo deve ter no máximo 10MB.")
        e.target.value = "" // Limpa o input
        onChange(null) // Notifica o componente pai
        return
      }

      // Se o arquivo for válido
      setFileError(null)
      setFiles(file)
      onChange(file) // Notifica o componente pai
    } else {
      onChange(null) // Notifica o componente pai
    }
  }

  return (
    <div>
      <div className="br-upload">
        <label className="upload-label" htmlFor="multiple-files">
          <span>
            Arquivo complementar (.pdf, .doc, .docx, .txt) - Tam. máx. 10MB
          </span>
        </label>
        <input
          className="upload-input"
          id="multiple-files"
          type="file"
          multiple={multiple}
          aria-hidden
          aria-label="enviar arquivo"
          ref={ref}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt" // Restringe os tipos de arquivo no seletor
          {...props}
        />
        <button
          className="upload-button"
          type="button"
          aria-hidden="true"
          onClick={() => ref.current?.click()}
        >
          <i className="fas fa-upload" aria-hidden="true"></i>
          <span>Selecione {multiple ? "os arquivos" : "o arquivo"}</span>
        </button>
        <div className="upload-list">
          {files && (
            <div key={files.name} className="br-item d-flex">
              <div className="content text-primary-default mr-auto">
                {files.name}
              </div>
              <div className="support mr-n2">
                <span className="mr-1">
                  {(files.size / 1024).toFixed(2)} KB
                </span>
                <button
                  className="br-button"
                  type="button"
                  aria-label={`Remover ${files.name}`}
                  onClick={() => {
                    setFiles(null)
                    onChange(null)
                  }}
                >
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {fileError && (
        <span className="feedback danger mt-1" role="alert">
          {fileError}
        </span>
      )}
      {error && (
        <span className="feedback danger mt-1" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

export default Upload
