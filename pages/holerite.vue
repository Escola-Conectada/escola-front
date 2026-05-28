<template>
  <section v-if="!auth.isAluno" class="grid gap-5 xl:grid-cols-[minmax(300px,420px)_minmax(0,1fr)]">
    <aside class="rounded-lg border border-[#d4dee9] bg-white p-4 shadow-[0_22px_55px_rgba(14,30,53,0.08)] sm:p-6">
      <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">Funcionario</p>
      <h2 class="mb-6 mt-2 text-xl font-normal text-[#071d3b]">Holerite ficticio</h2>

      <div class="grid gap-4">
        <label class="grid gap-2 text-sm font-extrabold text-[#071d3b]">
          <span>Competencia</span>
          <select
            v-model="competencia"
            class="min-h-11 rounded-md border border-[#ccd8e5] px-3 text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
          >
            <option
              v-for="item in competencias"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </option>
          </select>
        </label>

        <div class="grid gap-3 rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-4">
          <div>
            <span class="text-xs font-extrabold uppercase text-[#62728a]">Funcionario</span>
            <strong class="mt-1 block break-words text-sm text-[#071d3b]">{{ holerite.funcionario }}</strong>
          </div>
          <div>
            <span class="text-xs font-extrabold uppercase text-[#62728a]">Cargo</span>
            <strong class="mt-1 block text-sm text-[#071d3b]">{{ holerite.cargo }}</strong>
          </div>
          <div>
            <span class="text-xs font-extrabold uppercase text-[#62728a]">Matricula</span>
            <strong class="mt-1 block text-sm text-[#071d3b]">{{ holerite.matricula }}</strong>
          </div>
        </div>

        <p class="alert alert-warning">
          Holerite demonstrativo, sem valor trabalhista, fiscal ou contabil.
        </p>

        <div class="grid gap-2 sm:grid-cols-2">
          <button
            class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#d4dee9] bg-white px-4 text-sm font-extrabold text-[#51627a] transition hover:bg-[#edf3f8]"
            type="button"
            @click="copiarResumo"
          >
            <Copy class="h-5 w-5" aria-hidden="true" />
            Copiar
          </button>
          <button
            class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#147f72] px-4 text-sm font-extrabold text-white transition hover:bg-[#0f6c61]"
            type="button"
            @click="imprimir"
          >
            <Printer class="h-5 w-5" aria-hidden="true" />
            Imprimir
          </button>
        </div>

        <p v-if="mensagem" class="alert alert-success">{{ mensagem }}</p>
        <p v-if="erro" class="alert alert-error">{{ erro }}</p>
      </div>
    </aside>

    <article class="min-w-0 rounded-lg border border-[#d4dee9] bg-white p-4 shadow-[0_22px_55px_rgba(14,30,53,0.08)] sm:p-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">Sem valor oficial</p>
          <h2 class="m-0 mt-2 text-xl font-normal text-[#071d3b]">Contracheque demonstrativo</h2>
        </div>
        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] transition hover:bg-[#dfe8f1]"
          type="button"
          title="Atualizar demonstrativo"
          aria-label="Atualizar demonstrativo"
          @click="regerar"
        >
          <RefreshCcw class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div class="mt-5 grid gap-4 md:grid-cols-3">
        <div class="rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-4">
          <span class="text-xs font-extrabold uppercase text-[#62728a]">Proventos</span>
          <strong class="mt-2 block text-lg text-[#071d3b]">{{ formatarMoedaHolerite(holerite.totalProventos) }}</strong>
        </div>
        <div class="rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-4">
          <span class="text-xs font-extrabold uppercase text-[#62728a]">Descontos</span>
          <strong class="mt-2 block text-lg text-[#b42318]">{{ formatarMoedaHolerite(holerite.totalDescontos) }}</strong>
        </div>
        <div class="rounded-md border border-[#99f6e4] bg-[#e6fffb] p-4">
          <span class="text-xs font-extrabold uppercase text-[#0f766e]">Liquido ficticio</span>
          <strong class="mt-2 block text-lg text-[#0f766e]">{{ formatarMoedaHolerite(holerite.valorLiquido) }}</strong>
        </div>
      </div>

      <div class="mt-6 grid gap-6">
        <section class="grid gap-3">
          <div>
            <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">Proventos</p>
            <h3 class="m-0 mt-1 text-base font-extrabold text-[#071d3b]">Salarios e beneficios ficticios</h3>
          </div>
          <div class="overflow-hidden rounded-lg border border-[#d4dee9]">
            <div class="hidden grid-cols-[82px_minmax(0,1fr)_120px_140px] gap-3 bg-[#f5f8fb] px-4 py-3 text-xs font-extrabold uppercase text-[#51627a] md:grid">
              <span>Codigo</span>
              <span>Descricao</span>
              <span>Referencia</span>
              <span class="text-right">Valor</span>
            </div>
            <article
              v-for="rubrica in holerite.proventos"
              :key="rubrica.codigo"
              class="grid gap-2 border-t border-[#d4dee9] px-4 py-3 text-sm md:grid-cols-[82px_minmax(0,1fr)_120px_140px] md:items-center"
            >
              <span class="font-extrabold text-[#62728a]">{{ rubrica.codigo }}</span>
              <strong class="break-words text-[#071d3b]">{{ rubrica.descricao }}</strong>
              <span class="font-semibold text-[#51627a]">{{ rubrica.referencia }}</span>
              <span class="font-extrabold text-[#0f766e] md:text-right">{{ formatarMoedaHolerite(rubrica.valor) }}</span>
            </article>
          </div>
        </section>

        <section class="grid gap-3">
          <div>
            <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">Descontos</p>
            <h3 class="m-0 mt-1 text-base font-extrabold text-[#071d3b]">Taxas demonstrativas comuns</h3>
          </div>
          <div class="overflow-hidden rounded-lg border border-[#d4dee9]">
            <div class="hidden grid-cols-[82px_minmax(0,1fr)_120px_140px] gap-3 bg-[#f5f8fb] px-4 py-3 text-xs font-extrabold uppercase text-[#51627a] md:grid">
              <span>Codigo</span>
              <span>Descricao</span>
              <span>Referencia</span>
              <span class="text-right">Valor</span>
            </div>
            <article
              v-for="rubrica in holerite.descontos"
              :key="rubrica.codigo"
              class="grid gap-2 border-t border-[#d4dee9] px-4 py-3 text-sm md:grid-cols-[82px_minmax(0,1fr)_120px_140px] md:items-center"
            >
              <span class="font-extrabold text-[#62728a]">{{ rubrica.codigo }}</span>
              <strong class="break-words text-[#071d3b]">{{ rubrica.descricao }}</strong>
              <span class="font-semibold text-[#51627a]">{{ rubrica.referencia }}</span>
              <span class="font-extrabold text-[#b42318] md:text-right">{{ formatarMoedaHolerite(rubrica.valor) }}</span>
            </article>
          </div>
        </section>

        <section class="grid gap-3">
          <div>
            <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">Informativos</p>
            <h3 class="m-0 mt-1 text-base font-extrabold text-[#071d3b]">Bases e encargos ficticios</h3>
          </div>
          <div class="grid gap-2 md:grid-cols-3">
            <div
              v-for="rubrica in holerite.informativos"
              :key="rubrica.codigo"
              class="rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-3"
            >
              <span class="text-xs font-extrabold uppercase text-[#62728a]">{{ rubrica.descricao }}</span>
              <strong class="mt-2 block text-sm text-[#071d3b]">{{ formatarMoedaHolerite(rubrica.valor) }}</strong>
              <span class="mt-1 block text-xs font-extrabold text-[#62728a]">{{ rubrica.referencia }}</span>
            </div>
          </div>
        </section>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { Copy, Printer, RefreshCcw } from '@lucide/vue'
import {
  competenciaAtual,
  criarHoleriteFicticio,
  formatarCompetencia,
  formatarMoedaHolerite,
  montarResumoHolerite
} from '~/utils/holerite-ficticio'

definePageMeta({
  roles: [],
  middleware: ['funcionario']
})

const auth = useAuthStore()
const competencia = ref(competenciaAtual())
const mensagem = ref('')
const erro = ref('')
const atualizacao = ref(0)
const competencias = computed(() => {
  const now = new Date()

  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1)
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    return {
      value,
      label: formatarCompetencia(value)
    }
  })
})
const holerite = computed(() => {
  void atualizacao.value

  return criarHoleriteFicticio(criarUsuarioParaHolerite(), competencia.value)
})

async function copiarResumo() {
  erro.value = ''
  mensagem.value = ''

  try {
    await navigator.clipboard.writeText(montarResumoHolerite(holerite.value))
    mensagem.value = 'Resumo copiado.'
  } catch {
    erro.value = 'Nao foi possivel copiar o resumo.'
  }
}

function imprimir() {
  window.print()
}

function regerar() {
  atualizacao.value += 1
  mensagem.value = 'Demonstrativo atualizado.'
}

function criarUsuarioParaHolerite() {
  return {
    idUsuario: auth.usuario?.idUsuario ?? 0,
    nome: auth.usuario?.nome ?? 'Funcionario demonstracao',
    email: auth.usuario?.email ?? 'funcionario.demo@escola.invalid',
    descricaoPerfil: auth.usuario?.descricaoPerfil ?? 'Funcionario'
  }
}
</script>
