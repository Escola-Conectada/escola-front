export interface UsuarioSummary {
  idUsuario: number
  nome: string
  email: string
  telefone: string
  dataNascimento?: string | null
  nomeMae?: string | null
  nomePai?: string | null
  endereco?: string | null
  fotoPerfilUrl?: string | null
  idPerfil: number
  descricaoPerfil: string
  tipoUsuario?: string
  boletimDigital?: BoletimDigitalResumoAluno | null
}

export interface UsuarioForm {
  nome: string
  email: string
  telefone: string
  dataNascimento: string
  nomeMae: string
  nomePai: string
  endereco: string
  idPerfil: number
}

export interface UsuarioCreate {
  nome: string
  email: string
  telefone: string
  dataNascimento?: string | null
  nomeMae?: string | null
  nomePai?: string | null
  endereco?: string | null
  tipoUsuario: string
}

export interface UsuarioUpdate {
  nome: string
  email: string
  telefone: string
  dataNascimento?: string | null
  nomeMae?: string | null
  nomePai?: string | null
  endereco?: string | null
  tipoUsuario?: string
}

export interface UsuarioArquivo {
  idArquivo?: number
  idUsuarioArquivo?: number
  idUsuario?: number | null
  nomeBlob?: string | null
  tipoArquivo?: string | null
  nomeOriginal?: string | null
  url?: string | null
  contentType?: string | null
  tamanhoBytes?: number | null
  criadoEmUtc?: string | null
}

export interface Holerite {
  idHolerite: number
  idUsuario: number
  nomeUsuario: string
  perfilUsuario: string
  competenciaMes: number
  competenciaAno: number
  competencia: string
  nomeOriginal: string
  url: string
  contentType: string
  tamanhoBytes: number
  criadoEmUtc: string
}

export interface HoleriteCompartilhamento {
  token: string
  url: string
  expiraEmUtc: string
}

export interface Notificacao {
  idNotificacao: number
  idUsuario: number
  tipo: string
  titulo: string
  mensagem: string
  link?: string | null
  idCadernetaDigital?: number | null
  idDisciplina?: number | null
  nomeDisciplina?: string | null
  mediaAritmetica?: number | null
  situacao?: string | null
  corSituacao?: string | null
  lida: boolean
  criadaEmUtc: string
  lidaEmUtc?: string | null
}

export interface NotificacaoPerfisPayload {
  idsPerfis?: number[]
  tiposUsuario?: string[]
  todosOsPerfis?: boolean
  titulo: string
  mensagem: string
  tipo?: string
  link?: string | null
}

export interface NotificacaoEnvio {
  total: number
  notificacoes: Notificacao[]
}

export interface ConfiguracaoAplicacao {
  nomeEscola: string
  atualizadoEmUtc: string
}

export interface ConfiguracaoAplicacaoPayload {
  nomeEscola: string
}

export interface Perfil {
  idPerfil: number
  descricaoPerfil: string
}

export interface AlunoTurmaEnsino {
  idAlunoTurmaEnsino: number
  idAlunoUsuario: number
  nomeAluno: string
  emailAluno: string
  idTipoEnsino: number
  nomeTipoEnsino: string
  idTurmaEnsino: number
  nomeTurmaEnsino: string
  codigoTurma: string
  idUsuarioResponsavel?: number | null
  nomeUsuarioResponsavel?: string | null
  matriculadoEmUtc: string
}

export interface AlunoTurmaEnsinoPayload {
  idAlunoUsuario: number
  idTurmaEnsino: number
}

export interface LoginCredentials {
  email: string
  senha: string
}

export interface GoogleLoginPayload {
  idToken: string
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

export interface DisciplinaCaderneta {
  idDisciplina: number
  nome: string
  idProfessorUsuario?: number | null
  nomeProfessor: string
  idTipoEnsino?: number | null
  nomeTipoEnsino?: string | null
  idTurmaEnsino?: number | null
  nomeTurmaEnsino?: string | null
  idAreaConhecimento?: number | null
  nomeAreaConhecimento?: string | null
  observacao?: string | null
  ofertaObrigatoria: boolean
  matriculaFacultativa: boolean
  ordem: number
}

export interface DisciplinaCadernetaPayload {
  nome: string
  idTurmaEnsino?: number | null
  idAreaConhecimento?: number | null
  observacao?: string | null
  ofertaObrigatoria?: boolean
  matriculaFacultativa?: boolean
}

export interface TipoEnsinoCurricular {
  idTipoEnsino: number
  nome: string
  ordem: number
  turmas: TurmaEnsinoCurricular[]
}

export interface TurmaEnsinoCurricular {
  idTurmaEnsino: number
  nome: string
  codigo: string
  ordem: number
  areasConhecimento: AreaConhecimentoCurricular[]
}

export interface AreaConhecimentoCurricular {
  idAreaConhecimento: number
  nome: string
  ordem: number
  disciplinas: DisciplinaCurricular[]
}

export interface DisciplinaCurricular {
  idDisciplina: number
  nome: string
  observacao?: string | null
  ofertaObrigatoria: boolean
  matriculaFacultativa: boolean
  ordem: number
}

export interface CadernetaDigitalSummary {
  idCadernetaDigital: number
  idAlunoUsuario: number
  nomeAluno: string
  emailAluno: string
  idDisciplina: number
  nomeDisciplina: string
  idProfessorUsuario?: number | null
  nomeProfessor: string
  idTipoEnsino?: number | null
  nomeTipoEnsino?: string | null
  idTurmaEnsino?: number | null
  nomeTurmaEnsino?: string | null
  idAreaConhecimento?: number | null
  nomeAreaConhecimento?: string | null
  notas: number[]
  mediaAritmetica: number
  situacao: string
  corSituacao: string
  presencas: number
  faltas: number
}

export interface CadernetaDigitalPayload {
  idAlunoUsuario: number
  idTipoEnsino: number
  idTurmaEnsino: number
  idDisciplina: number
  notas: number[]
  presencas: number
  faltas: number
}

export interface BoletimDigital {
  idBoletimDigital?: number | null
  idAlunoUsuario: number
  nomeAluno: string
  emailAluno: string
  idTipoEnsino: number
  nomeTipoEnsino: string
  idTurmaEnsino: number
  nomeTurmaEnsino: string
  status: string
  completo: boolean
  liberado: boolean
  pendenteDiretoria: boolean
  podeSolicitarLiberacao: boolean
  podeLiberar: boolean
  podeCompartilhar: boolean
  totalDisciplinas: number
  disciplinasLancadas: number
  disciplinasPendentes: number
  mediaGeral?: number | null
  situacaoGeral: string
  totalPresencas: number
  totalFaltas: number
  idProfessorSolicitanteUsuario?: number | null
  nomeProfessorSolicitante: string
  solicitadoEmUtc?: string | null
  idAdministradorLiberacaoUsuario?: number | null
  nomeAdministradorLiberacao: string
  liberadoEmUtc?: string | null
  disciplinas: BoletimDigitalDisciplina[]
}

export interface BoletimDigitalDisciplina {
  idDisciplina: number
  nomeDisciplina: string
  idProfessorUsuario?: number | null
  nomeProfessor: string
  idAreaConhecimento?: number | null
  nomeAreaConhecimento?: string | null
  ofertaObrigatoria: boolean
  matriculaFacultativa: boolean
  ordem: number
  lancado: boolean
  idCadernetaDigital?: number | null
  notas: number[]
  mediaAritmetica?: number | null
  situacao: string
  corSituacao: string
  presencas?: number | null
  faltas?: number | null
}

export interface BoletimDigitalResumoAluno {
  idBoletimDigital?: number | null
  idAlunoUsuario: number
  nomeAluno: string
  emailAluno: string
  idTurmaEnsino: number
  nomeTurmaEnsino: string
  status: string
  completo: boolean
  liberado: boolean
  pendenteLiberacao: boolean
  totalDisciplinas: number
  disciplinasLancadas: number
  disciplinasPendentes: number
  solicitadoEmUtc?: string | null
  nomeProfessorSolicitante: string
}

export interface BoletimDigitalCompartilhamento {
  token: string
  url: string
  texto: string
  emailCompartilhamentoUrl: string
  whatsAppCompartilhamentoUrl: string
  expiraEmUtc: string
}

export interface DisciplinaEvento {
  idEventoDisciplina: number
  idDisciplina: number
  nomeDisciplina: string
  idProfessorUsuario: number
  nomeProfessor: string
  tipo: string
  titulo: string
  descricao?: string | null
  data: string
  criadoEmUtc: string
  atualizadoEmUtc?: string | null
}

export interface DisciplinaEventoPayload {
  tipo: string
  titulo: string
  descricao?: string | null
  data: string
}

export interface CalendarioEscolarEvento {
  idEventoCalendarioEscolar: number
  data: string
  tipo: string
  titulo: string
  descricao?: string | null
  publicoAlvo: string
  perfisDestinatarios: string[]
  idUsuarioCriador: number
  nomeUsuarioCriador: string
  totalNotificados: number
  criadoEmUtc: string
}

export interface CalendarioEscolarAno {
  ano: number
  mesSelecionado: number
  eventos: CalendarioEscolarEvento[]
}

export interface CalendarioEscolarEventoPayload {
  data: string
  tipo: string
  titulo: string
  descricao?: string | null
  publicoAlvo?: string | null
}
