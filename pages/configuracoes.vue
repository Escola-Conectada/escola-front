<template>
  <section class="grid gap-5">
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

      <p v-if="mensagem" class="alert alert-success mt-4">{{ mensagem }}</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { MonitorCog, Moon, Sun } from '@lucide/vue'
import type { Component } from 'vue'
import {
  DEFAULT_APP_THEME,
  persistAppTheme,
  readStoredAppTheme,
  type AppTheme
} from '~/utils/theme'

definePageMeta({
  roles: []
})

interface ThemeOption {
  value: AppTheme
  label: string
  icon: Component
}

const theme = ref<AppTheme>(DEFAULT_APP_THEME)
const mensagem = ref('')
const themeOptions: ThemeOption[] = [
  { value: 'light', label: 'Tema claro', icon: Sun },
  { value: 'dark', label: 'Tema escuro', icon: Moon }
]

onMounted(() => {
  theme.value = readStoredAppTheme()
})

function setTheme(value: AppTheme) {
  theme.value = value
  persistAppTheme(value)
  mensagem.value = 'Preferencia salva.'
}
</script>
