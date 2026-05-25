export interface UsuarioSummary {
  idUsuario: number
  nome: string
  email: string
  telefone: string
  idPerfil: number
  descricaoPerfil: string
  tipoUsuario?: string
}

export interface UsuarioForm {
  nome: string
  email: string
  telefone: string
  idPerfil: number
}

export interface UsuarioCreate {
  nome: string
  email: string
  telefone: string
  tipoUsuario: string
}

export interface UsuarioUpdate {
  nome: string
  email: string
  telefone: string
  tipoUsuario?: string
}

export interface Perfil {
  idPerfil: number
  descricaoPerfil: string
}

export interface LoginCredentials {
  email: string
  senha: string
}

export interface AuthResponse {
  token: string
  expiraEm: string
  usuario: UsuarioSummary
  deveAlterarSenhaPadrao: boolean
}

export interface AlterarSenhaPayload {
  senhaAtual: string
  novaSenha: string
  confirmacaoSenha: string
}

export interface EsqueciSenhaPayload {
  email: string
}

export interface EsqueciSenhaResponse {
  mensagem: string
}
