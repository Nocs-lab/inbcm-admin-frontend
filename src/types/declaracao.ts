// src/types/declaracao.ts

export interface Especialidade {
  status?: string
  pendencias?: string[]
  analistasResponsaveisNome?: string[]
}

export interface MuseuDaDeclaracao {
  _id: string
  nome: string
  endereco?: {
    municipio: string
    uf: string
    regiao: string
  }
}

export interface Declaracao {
  _id: string
  anoDeclaracao: {
    ano: number
  }
  status: string
  retificacao: boolean

  // Informações de envio e datas
  responsavelEnvioNome: string
  responsavelEnvio?: {
    nome: string
  }
  dataCriacao: Date
  dataEnvioAnalise?: Date
  dataFimAnalise?: Date
  dataExclusao?: Date
  regiao?: string

  // Relacionamentos
  museu_id: MuseuDaDeclaracao

  // Analistas e Especialidades
  analistasResponsaveisNome?: string[]
  museologico?: Especialidade
  arquivistico?: Especialidade
  bibliografico?: Especialidade
}
