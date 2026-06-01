<template>
  <section class="grid gap-5 xl:grid-cols-[minmax(280px,420px)_minmax(0,1fr)]">
    <article class="rounded-lg border border-[#d4dee9] bg-white/95 p-4 shadow-[0_22px_55px_rgba(14,30,53,0.08)] backdrop-blur-sm sm:p-5">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">Configuracoes</p>
          <h2 class="m-0 mt-2 text-xl font-normal text-[#071d3b]">Aparencia</h2>
        </div>
        <MonitorCog class="h-7 w-7 text-[#147f72]" aria-hidden="true" />
      </div>

      <div class="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          v-for="option in themeOptions"
          :key="option.value"
          class="grid min-h-28 gap-3 rounded-lg border p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-[#147f72]/15"
          :class="theme === option.value
            ? 'border-[#147f72] bg-[#eaf4f1] text-[#006b61]'
            : 'border-[#d4dee9] bg-white text-[#071d3b] hover:border-[#147f72] hover:bg-[#f8fbfd]'"
          type="button"
          :title="option.label"
          :aria-label="option.label"
          :aria-pressed="theme === option.value"
          @click="setTheme(option.value)"
        >
          <component :is="option.icon" class="h-6 w-6" aria-hidden="true" />
          <span class="text-sm font-extrabold">{{ option.label }}</span>
        </button>
      </div>

      <p v-if="mensagemTema" class="alert alert-success mt-4">{{ mensagemTema }}</p>
    </article>

    <article class="rounded-lg border border-[#d4dee9] bg-white/95 p-4 shadow-[0_22px_55px_rgba(14,30,53,0.08)] backdrop-blur-sm sm:p-5">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">Instituicao</p>
          <h2 class="m-0 mt-2 break-words text-xl font-normal text-[#071d3b]">{{ appConfig.nomeEscola }}</h2>
        </div>
        <Building2 class="h-7 w-7 text-[#147f72]" aria-hidden="true" />
      </div>

      <form class="mt-5 grid gap-4" @submit.prevent="salvarNomeEscola">
        <label class="grid gap-2 text-sm font-extrabold text-[#071d3b]">
          <span>Nome da escola</span>
          <input
            v-model.trim="nomeEscola"
            class="min-h-11 rounded-md border border-[#ccd8e5] bg-white px-3 text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10 disabled:bg-[#f5f8fb] disabled:text-[#62728a]"
            type="text"
            maxlength="120"
            :disabled="!podeEditarNomeEscola || appConfig.salvando"
            required
          />
          <span class="text-xs font-extrabold text-[#62728a]">{{ nomeEscola.length }}/120</span>
        </label>

        <div class="grid gap-2 sm:grid-cols-[1fr_auto]">
          <p v-if="!podeEditarNomeEscola" class="m-0 rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-3 text-sm font-semibold text-[#51627a]">
            Apenas administrador pode alterar esta opcao.
          </p>
          <span v-else />

          <button
            v-if="podeEditarNomeEscola"
            class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#147f72] px-4 text-sm font-extrabold text-white transition hover:bg-[#0f6c61] disabled:cursor-wait disabled:opacity-70"
            type="submit"
            :disabled="appConfig.salvando"
          >
            <Save class="h-5 w-5" aria-hidden="true" />
            {{ appConfig.salvando ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>

        <p v-if="mensagemNomeEscola" class="alert alert-success">{{ mensagemNomeEscola }}</p>
        <p v-if="erroNomeEscola" class="alert alert-error">{{ erroNomeEscola }}</p>
      </form>
    </article>
  </section>
</template>

<script setup lang="ts">
import { Building2, MonitorCog, Moon, Save, Sun } from '@lucide/vue'
import type { Component } from 'vue'
import {
  DEFAULT_APP_THEME,
  persistAppTheme,
  readStoredAppTheme,
  type AppTheme
} from '~/utils/theme'
import { normalizeApiError } from '~/utils/api-client'
import { getUsuarioPerfilTipo } from '~/utils/usuario-permissions'

definePageMeta({
  roles: []
})

interface ThemeOption {
  value: AppTheme
  label: string
  icon: Component
}

const auth = useAuthStore()
const appConfig = useAppConfigStore()
const theme = ref<AppTheme>(DEFAULT_APP_THEME)
const mensagemTema = ref('')
const nomeEscola = ref('')
const mensagemNomeEscola = ref('')
const erroNomeEscola = ref('')
const podeEditarNomeEscola = computed(() => getUsuarioPerfilTipo(auth.usuario?.descricaoPerfil) === 'administrador')
const themeOptions: ThemeOption[] = [
  { value: 'light', label: 'Tema claro', icon: Sun },
  { value: 'dark', label: 'Tema escuro', icon: Moon }
]

onMounted(async () => {
  theme.value = readStoredAppTheme()
  await appConfig.carregar()
})

watch(() => appConfig.nomeEscola, (value) => {
  nomeEscola.value = value
}, { immediate: true })

function setTheme(value: AppTheme) {
  theme.value = value
  persistAppTheme(value)
  mensagemTema.value = 'Preferencia salva.'
}

async function salvarNomeEscola() {
  if (!podeEditarNomeEscola.value) {
    erroNomeEscola.value = 'Apenas administrador pode alterar esta opcao.'
    return
  }

  const nome = nomeEscola.value.trim()
  mensagemNomeEscola.value = ''
  erroNomeEscola.value = ''

  if (!nome) {
    erroNomeEscola.value = 'Informe o nome da escola.'
    return
  }

  if (nome.length > 120) {
    erroNomeEscola.value = 'O nome da escola deve ter ate 120 caracteres.'
    return
  }

  try {
    await appConfig.atualizar({ nomeEscola: nome })
    mensagemNomeEscola.value = 'Nome da escola atualizado.'
  } catch (err) {
    erroNomeEscola.value = normalizeApiError(err)
  }
}
</script>
