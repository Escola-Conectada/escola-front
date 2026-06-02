import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppConfigStore } from '~/stores/app-config'

const { apiMock } = vi.hoisted(() => ({
  apiMock: vi.fn()
}))

vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $api: apiMock
  })
}))

describe('app config store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    apiMock.mockReset()
  })

  it('shares the same in-flight request across concurrent loads', async () => {
    apiMock.mockResolvedValue({
      nomeEscola: 'Escola Conectada Customizavel',
      atualizadoEmUtc: '2026-06-02T18:00:00Z'
    })

    const appConfig = useAppConfigStore()
    const [first, second] = await Promise.all([
      appConfig.carregar(),
      appConfig.carregar()
    ])

    expect(apiMock).toHaveBeenCalledTimes(1)
    expect(first.nomeEscola).toBe('Escola Conectada Customizavel')
    expect(second.nomeEscola).toBe('Escola Conectada Customizavel')
    expect(appConfig.loaded).toBe(true)
  })
})
