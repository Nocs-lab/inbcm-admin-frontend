export interface Ano {
  _id: string
  ano: number
  dataFimSubmissao: Date
  dataInicioSubmissao: Date
  dataInicioRetificacao: Date
  dataFimRetificacao: Date
  metaDeclaracoesEnviadas: number
  declaracaoVinculada: boolean
}

export interface EmailConfig {
  emailHost: string
  emailPort: string
  emailUser: string
  emailPass: string
  emailFrom: string
}

export interface PortalConfig {
  url: string
  node_de_usuario: string
  senha: string
}
