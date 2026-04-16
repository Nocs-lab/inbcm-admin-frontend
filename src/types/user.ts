import { Museu } from "./museu"

export interface Profile {
  _id: string
  name: string
  description?: string
}

export interface User {
  _id: string
  nome: string
  email: string
  cpf: string
  profile?: Profile
  museus: Museu[]
  especialidadeAnalista?: string[]
  situacao?: number
}
