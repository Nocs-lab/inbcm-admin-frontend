// src/types/museu.ts
import { Paginacao } from "./common.ts"

export interface Endereco {
  logradouro?: string
  numero?: string
  municipio: string
  bairro?: string
  uf?: string
}

export interface Museu {
  _id: string
  nome: string
  endereco: Endereco
  esferaAdministraiva?: string
}

export interface RespostaMuseus {
  museus: Museu[]
  pagination: Paginacao
}
