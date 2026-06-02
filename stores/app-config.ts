import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import { ref } from 'vue'
import type { ConfiguracaoAplicacao, ConfiguracaoAplicacaoPayload } from '~/types/api'
import { normalizeApiError } from '~/utils/api-client'

export const DEFAULT_SCHOOL_NAME = 'Escola Conectada'

export const useAppConfigStore = defineStore('app-config', () => {
  const nomeEscola = ref(DEFAULT_SCHOOL_NAME)
  const atualizadoEmUtc = ref('')
  const carregando = ref(false)
  const salvando = ref(false)
  const error = ref('')
  const loaded = ref(false)
  let carregarRequest: Promise<ConfiguracaoAplicacao> | null = null

  async function carregar(force = false) {
    if (loaded.value && !force) {
      return getCurrentConfig()
    }

    if (carregarRequest && !force) {
      return carregarRequest
    }

    carregando.value = true
    error.value = ''

    const request = (async () => {
      try {
        const { $api } = useNuxtApp()
        const response = await $api<ConfiguracaoAplicacao>('/configuracoes/aplicacao')
        aplicar(response)
        loaded.value = true
        return response
      } catch (err) {
        error.value = normalizeApiError(err)
        return getCurrentConfig()
      }
    })()

    carregarRequest = request

    try {
      return await request
    } finally {
      if (carregarRequest === request) {
        carregarRequest = null
        carregando.value = false
      }
    }
  }

  async function atualizar(payload: ConfiguracaoAplicacaoPayload) {
    salvando.value = true
    error.value = ''

    try {
      const { $api } = useNuxtApp()
      const response = await $api<ConfiguracaoAplicacao>('/configuracoes/aplicacao', {
        method: 'PUT',
        body: payload
      })
      aplicar(response)
      loaded.value = true
      return response
    } catch (err) {
      error.value = normalizeApiError(err)
      throw err
    } finally {
      salvando.value = false
    }
  }

  function aplicar(configuracao: ConfiguracaoAplicacao) {
    nomeEscola.value = configuracao.nomeEscola?.trim() || DEFAULT_SCHOOL_NAME
    atualizadoEmUtc.value = configuracao.atualizadoEmUtc || ''
  }

  function getCurrentConfig(): ConfiguracaoAplicacao {
    return {
      nomeEscola: nomeEscola.value,
      atualizadoEmUtc: atualizadoEmUtc.value
    }
  }

  return {
    nomeEscola,
    atualizadoEmUtc,
    carregando,
    salvando,
    error,
    loaded,
    carregar,
    atualizar
  }
})
