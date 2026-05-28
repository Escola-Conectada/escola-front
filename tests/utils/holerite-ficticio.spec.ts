import { describe, expect, it } from 'vitest'
import {
  criarHoleriteFicticio,
  formatarCompetencia,
  montarResumoHolerite
} from '~/utils/holerite-ficticio'

const professor = {
  idUsuario: 18,
  nome: 'Ana Professora',
  email: 'ana.professora@example.com',
  descricaoPerfil: 'Professor'
}

const administrador = {
  idUsuario: 2,
  nome: 'Administrador Sistema',
  email: 'admin@example.com',
  descricaoPerfil: 'Administrador'
}

describe('criarHoleriteFicticio', () => {
  it('gera holerite demonstrativo com proventos, descontos e liquido', () => {
    const holerite = criarHoleriteFicticio(professor, '2026-05')

    expect(holerite.proventos.length).toBeGreaterThan(0)
    expect(holerite.descontos.length).toBeGreaterThan(0)
    expect(holerite.totalProventos).toBeGreaterThan(holerite.totalDescontos)
    expect(holerite.valorLiquido).toBe(holerite.totalProventos - holerite.totalDescontos)
  })

  it('usa valores base diferentes por perfil', () => {
    const holeriteProfessor = criarHoleriteFicticio(professor, '2026-05')
    const holeriteAdministrador = criarHoleriteFicticio(administrador, '2026-05')

    expect(holeriteAdministrador.totalProventos).toBeGreaterThan(holeriteProfessor.totalProventos)
  })

  it('inclui FGTS apenas como informativo ficticio', () => {
    const holerite = criarHoleriteFicticio(professor, '2026-05')

    expect(holerite.informativos.some((rubrica) => rubrica.descricao.includes('FGTS'))).toBe(true)
    expect(holerite.descontos.some((rubrica) => rubrica.descricao.includes('FGTS'))).toBe(false)
  })
})

describe('montarResumoHolerite', () => {
  it('marca o resumo como sem valor oficial', () => {
    const holerite = criarHoleriteFicticio(professor, '2026-05')

    expect(montarResumoHolerite(holerite)).toContain('SEM VALOR TRABALHISTA OU FISCAL')
  })
})

describe('formatarCompetencia', () => {
  it('formata competencia no padrao brasileiro', () => {
    expect(formatarCompetencia('2026-05')).toBe('maio de 2026')
  })
})
