import type { UsuarioSummary } from '~/types/api'
import { getUsuarioPerfilTipo } from '~/utils/usuario-permissions'

export type HoleriteRubricaTipo = 'provento' | 'desconto' | 'informativo'

export interface HoleriteRubricaFicticia {
  codigo: string
  descricao: string
  referencia: string
  tipo: HoleriteRubricaTipo
  valor: number
}

export interface HoleriteFicticio {
  funcionario: string
  email: string
  perfil: string
  cargo: string
  matricula: string
  competencia: string
  geradoEmIso: string
  proventos: HoleriteRubricaFicticia[]
  descontos: HoleriteRubricaFicticia[]
  informativos: HoleriteRubricaFicticia[]
  totalProventos: number
  totalDescontos: number
  valorLiquido: number
}

export function criarHoleriteFicticio(
  usuario: Pick<UsuarioSummary, 'idUsuario' | 'nome' | 'email' | 'descricaoPerfil'>,
  competencia = competenciaAtual()
): HoleriteFicticio {
  const perfilTipo = getUsuarioPerfilTipo(usuario.descricaoPerfil)
  const salarioBase = obterSalarioBaseFicticio(perfilTipo)
  const gratificacao = perfilTipo === 'professor' ? 420 : perfilTipo === 'desconhecido' ? 180 : 720
  const auxilioAlimentacao = perfilTipo === 'professor' ? 680 : 820
  const auxilioTransporte = perfilTipo === 'professor' ? 280 : 320
  const baseTributavel = salarioBase + gratificacao
  const inss = arredondar(baseTributavel * obterAliquotaInssFicticia(baseTributavel))
  const irrf = arredondar(Math.max(0, (baseTributavel - inss) * obterAliquotaIrrfFicticia(baseTributavel) - 180))
  const valeTransporte = arredondar(salarioBase * 0.06)
  const planoSaude = perfilTipo === 'professor' ? 165 : 220
  const contribuicaoAssociativa = arredondar(salarioBase * 0.01)

  const proventos: HoleriteRubricaFicticia[] = [
    rubrica('100', 'Salario base ficticio', '30 dias', 'provento', salarioBase),
    rubrica('115', perfilTipo === 'professor' ? 'Gratificacao pedagogica ficticia' : 'Gratificacao administrativa ficticia', 'mensal', 'provento', gratificacao),
    rubrica('220', 'Auxilio alimentacao ficticio', 'mensal', 'provento', auxilioAlimentacao),
    rubrica('230', 'Auxilio transporte ficticio', 'mensal', 'provento', auxilioTransporte)
  ]
  const descontos: HoleriteRubricaFicticia[] = [
    rubrica('501', 'INSS demonstrativo ficticio', `${formatarPercentual(obterAliquotaInssFicticia(baseTributavel))}`, 'desconto', inss),
    rubrica('502', 'IRRF demonstrativo ficticio', `${formatarPercentual(obterAliquotaIrrfFicticia(baseTributavel))}`, 'desconto', irrf),
    rubrica('510', 'Vale transporte ficticio', '6%', 'desconto', valeTransporte),
    rubrica('520', 'Plano de saude ficticio', 'mensal', 'desconto', planoSaude),
    rubrica('530', 'Contribuicao associativa ficticia', '1%', 'desconto', contribuicaoAssociativa)
  ]
  const totalProventos = somarRubricas(proventos)
  const totalDescontos = somarRubricas(descontos)
  const informativos: HoleriteRubricaFicticia[] = [
    rubrica('801', 'FGTS informativo ficticio', '8%', 'informativo', arredondar(totalProventos * 0.08)),
    rubrica('802', 'Base INSS ficticia', 'informativo', 'informativo', baseTributavel),
    rubrica('803', 'Base IRRF ficticia', 'informativo', 'informativo', Math.max(0, baseTributavel - inss))
  ]

  return {
    funcionario: usuario.nome?.trim() || 'Funcionario demonstracao',
    email: usuario.email?.trim() || 'funcionario.demo@escola.invalid',
    perfil: usuario.descricaoPerfil || 'Funcionario',
    cargo: obterCargoFicticio(perfilTipo),
    matricula: `FUN-${String(usuario.idUsuario || 0).padStart(4, '0')}-${hashString(usuario.email || usuario.nome).toString().slice(0, 4)}`,
    competencia,
    geradoEmIso: new Date().toISOString(),
    proventos,
    descontos,
    informativos,
    totalProventos,
    totalDescontos,
    valorLiquido: arredondar(totalProventos - totalDescontos)
  }
}

export function montarResumoHolerite(holerite: HoleriteFicticio) {
  return [
    'Holerite ficticio - Escola High Tech',
    'SEM VALOR TRABALHISTA OU FISCAL',
    '',
    `Funcionario: ${holerite.funcionario}`,
    `Cargo: ${holerite.cargo}`,
    `Competencia: ${formatarCompetencia(holerite.competencia)}`,
    `Total de proventos: ${formatarMoedaHolerite(holerite.totalProventos)}`,
    `Total de descontos: ${formatarMoedaHolerite(holerite.totalDescontos)}`,
    `Valor liquido ficticio: ${formatarMoedaHolerite(holerite.valorLiquido)}`
  ].join('\n')
}

export function formatarMoedaHolerite(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatarCompetencia(value: string) {
  const [year, month] = value.split('-').map(Number)
  const date = new Date(year || new Date().getFullYear(), (month || 1) - 1, 1)

  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric'
  }).format(date)
}

export function competenciaAtual() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function obterSalarioBaseFicticio(perfilTipo: ReturnType<typeof getUsuarioPerfilTipo>) {
  if (perfilTipo === 'professor') return 5200
  if (perfilTipo === 'administrador' || perfilTipo === 'diretoria') return 7800

  return 3900
}

function obterCargoFicticio(perfilTipo: ReturnType<typeof getUsuarioPerfilTipo>) {
  if (perfilTipo === 'professor') return 'Professor escolar'
  if (perfilTipo === 'administrador') return 'Administrador escolar'
  if (perfilTipo === 'diretoria') return 'Diretoria escolar'

  return 'Funcionario escolar'
}

function obterAliquotaInssFicticia(base: number) {
  if (base <= 3000) return 0.08
  if (base <= 6000) return 0.11

  return 0.14
}

function obterAliquotaIrrfFicticia(base: number) {
  if (base <= 3000) return 0
  if (base <= 5500) return 0.075

  return 0.15
}

function rubrica(
  codigo: string,
  descricao: string,
  referencia: string,
  tipo: HoleriteRubricaTipo,
  valor: number
): HoleriteRubricaFicticia {
  return {
    codigo,
    descricao,
    referencia,
    tipo,
    valor: arredondar(valor)
  }
}

function somarRubricas(rubricas: HoleriteRubricaFicticia[]) {
  return arredondar(rubricas.reduce((total, rubrica) => total + rubrica.valor, 0))
}

function arredondar(value: number) {
  return Math.round(value * 100) / 100
}

function formatarPercentual(value: number) {
  return `${Math.round(value * 1000) / 10}%`
}

function hashString(value = '') {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(31, hash) + value.charCodeAt(index) | 0
  }

  return Math.abs(hash)
}
