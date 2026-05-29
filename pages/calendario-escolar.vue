<template>
  <section class="grid gap-5 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
      <form
        v-if="podeGerenciarAgenda"
        class="rounded-lg border border-[#d4dee9] bg-white/95 p-4 shadow-[0_22px_55px_rgba(14,30,53,0.08)] backdrop-blur-sm sm:p-6"
        @submit.prevent="salvarAgenda"
      >
        <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">{{ agendaFormCategoria }}</p>
        <h2 class="mb-6 mt-2 text-xl font-normal text-[#071d3b]">{{ agendaFormTitulo }}</h2>

        <div class="grid gap-4">
          <label v-if="podeGerenciarEventoDisciplina" class="grid gap-2 text-sm font-extrabold text-[#071d3b]">
            <span>Disciplina</span>
            <select
              v-model.number="agendaForm.idDisciplina"
              class="min-h-11 rounded-md border border-[#ccd8e5] px-3 text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
              required
            >
              <option :value="0">Selecione</option>
              <option
                v-for="disciplina in disciplinas"
                :key="disciplina.idDisciplina"
                :value="disciplina.idDisciplina"
              >
                {{ disciplina.nome }}
              </option>
            </select>
          </label>

          <DatePicker
            v-model="agendaForm.data"
            label="Data"
            hint="Digite no formato dd/mm/aaaa ou selecione no calendario."
            required
          />

          <label class="grid gap-2 text-sm font-extrabold text-[#071d3b]">
            <span>Tipo</span>
            <select
              v-model="agendaForm.tipo"
              class="min-h-11 rounded-md border border-[#ccd8e5] px-3 text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
              required
            >
              <option
                v-for="tipo in tiposAgendaDisponiveis"
                :key="tipo.value"
                :value="tipo.value"
              >
                {{ tipo.label }}
              </option>
            </select>
          </label>

          <label class="grid gap-2 text-sm font-extrabold text-[#071d3b]">
            <span>Titulo</span>
            <input
              v-model.trim="agendaForm.titulo"
              class="min-h-11 rounded-md border border-[#ccd8e5] px-3 text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
              type="text"
              maxlength="120"
              required
            />
          </label>

          <label class="grid gap-2 text-sm font-extrabold text-[#071d3b]">
            <span>Observacao</span>
            <textarea
              v-model.trim="agendaForm.observacao"
              class="min-h-24 resize-y rounded-md border border-[#ccd8e5] px-3 py-2 text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
              maxlength="500"
            />
          </label>

          <p v-if="erroAgenda" class="alert alert-error">{{ erroAgenda }}</p>
          <p v-if="mensagemAgenda" class="alert alert-success">{{ mensagemAgenda }}</p>

          <div class="grid gap-2">
            <button
              class="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#147f72] px-4 text-sm font-extrabold text-white transition hover:bg-[#0f6c61] disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
            >
              <CalendarCheck class="h-5 w-5" aria-hidden="true" />
              {{ editandoAgendaId ? 'Atualizar evento' : textoBotaoAgenda }}
            </button>
            <button
              v-if="editandoAgendaId"
              class="inline-flex min-h-10 items-center justify-center rounded-md border border-[#d4dee9] bg-white px-4 text-sm font-extrabold text-[#51627a] transition hover:bg-[#edf3f8]"
              type="button"
              @click="limparAgendaForm"
            >
              Cancelar edicao
            </button>
          </div>
        </div>
      </form>

      <aside
        v-else
        class="rounded-lg border border-[#d4dee9] bg-white/95 p-4 shadow-[0_22px_55px_rgba(14,30,53,0.08)] backdrop-blur-sm sm:p-6"
      >
        <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">Consulta</p>
        <h2 class="mb-3 mt-2 text-xl font-normal text-[#071d3b]">Calendario escolar</h2>
        <p class="m-0 text-sm font-semibold text-[#62728a]">
          Seu perfil permite visualizar feriados, eventos escolares, avaliacoes e trabalhos marcados pelos professores.
        </p>
      </aside>

      <article class="min-w-0 rounded-lg border border-[#d4dee9] bg-white/95 p-4 shadow-[0_22px_55px_rgba(14,30,53,0.08)] backdrop-blur-sm sm:p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="min-w-0">
            <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">{{ eventosMesSelecionado.length }} evento(s) no mes</p>
            <h2 class="m-0 mt-2 text-xl font-normal text-[#071d3b]">{{ mesSelecionadoLabel }}</h2>
            <p class="m-0 mt-1 text-sm font-semibold text-[#62728a]">Dia selecionado: {{ diaSelecionadoLabel }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] transition hover:bg-[#dfe8f1]"
              type="button"
              title="Mes anterior"
              aria-label="Mes anterior"
              @click="mudarMes(-1)"
            >
              <ChevronLeft class="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              class="inline-flex min-h-10 items-center justify-center rounded-md border border-[#d4dee9] bg-white px-3 text-sm font-extrabold text-[#51627a] transition hover:bg-[#edf3f8]"
              type="button"
              @click="selecionarHoje"
            >
              Hoje
            </button>
            <button
              class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] transition hover:bg-[#dfe8f1]"
              type="button"
              title="Proximo mes"
              aria-label="Proximo mes"
              @click="mudarMes(1)"
            >
              <ChevronRight class="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] transition hover:bg-[#dfe8f1]"
              type="button"
              title="Atualizar calendario"
              aria-label="Atualizar calendario"
              @click="carregarDadosCalendario"
            >
              <RefreshCcw class="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <p v-if="erroDisciplinas" class="alert alert-error mt-4">{{ erroDisciplinas }}</p>

        <div class="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div class="min-w-0 overflow-hidden rounded-lg border border-[#d4dee9]">
            <div class="grid grid-cols-7 bg-[#f5f8fb] text-center">
              <span
                v-for="day in diasSemanaCurtos"
                :key="day"
              class="px-1 py-2 text-[11px] font-extrabold uppercase text-[#51627a] sm:px-2 sm:py-3 sm:text-xs"
              >
                {{ day }}
              </span>
            </div>
            <div class="grid grid-cols-7">
              <button
                v-for="day in gradeMes(selectedMonth)"
                :key="day.iso"
                class="min-h-14 border-l border-t border-[#d4dee9] p-1 text-left transition first:border-l-0 hover:bg-[#f8fbfd] sm:min-h-20 sm:p-2"
                :class="diaSelecionadoClasses(day)"
                type="button"
                @click="selecionarDia(day.iso)"
              >
                <span class="flex items-center justify-between gap-2">
                  <strong class="text-xs sm:text-sm">{{ day.date.getDate() }}</strong>
                  <span
                    v-if="eventosPorData[day.iso]?.length"
                    class="rounded-full bg-[#147f72] px-1.5 py-0.5 text-[10px] font-extrabold text-white sm:px-2 sm:text-[11px]"
                  >
                    {{ eventosPorData[day.iso].length }}
                  </span>
                </span>
                <span
                  v-if="feriadosPorData[day.iso]"
                  class="mt-2 hidden break-words text-[11px] font-extrabold text-[#b45309] sm:block"
                >
                  {{ feriadosPorData[day.iso].name }}
                </span>
                <span
                  v-for="evento in eventosPorData[day.iso]?.slice(0, 2)"
                  :key="evento.id"
                  class="mt-1 hidden truncate rounded bg-[#eaf4f1] px-1.5 py-0.5 text-[11px] font-extrabold text-[#006b61] sm:block"
                >
                  {{ tipoAgendaLabel(evento.tipo) }}: {{ evento.disciplinaNome }}
                </span>
              </button>
            </div>
          </div>

          <div class="grid content-start gap-3">
            <section class="grid gap-3 rounded-lg border border-[#d4dee9] bg-[#f8fbfd] p-3">
              <div>
                <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">Dia selecionado</p>
                <h3 class="m-0 mt-1 text-base font-extrabold text-[#071d3b]">{{ diaSelecionadoLabel }}</h3>
              </div>
              <p v-if="feriadoDiaSelecionado" class="m-0 rounded-md border border-[#fed7aa] bg-[#fff7ed] p-3 text-sm font-extrabold text-[#b45309]">
                {{ feriadoDiaSelecionado.name }}
              </p>
              <article
                v-for="evento in eventosDiaSelecionado"
                :key="evento.id"
                class="grid gap-1 rounded-md border border-[#d4dee9] bg-white p-3"
              >
                <span class="text-xs font-extrabold uppercase text-[#d64200]">{{ tipoAgendaLabel(evento.tipo) }}</span>
                <strong class="break-words text-sm text-[#071d3b]">{{ evento.titulo }}</strong>
                <span class="text-sm font-semibold text-[#51627a]">{{ evento.disciplinaNome }}</span>
              </article>
              <p v-if="!feriadoDiaSelecionado && !eventosDiaSelecionado.length" class="m-0 text-sm font-semibold text-[#62728a]">
                Nenhuma marcacao neste dia.
              </p>
            </section>

            <div class="max-h-[420px] overflow-auto rounded-lg border border-[#d4dee9] bg-white">
            <article
              v-for="evento in eventosMesSelecionado"
              :key="evento.id"
              class="grid gap-3 border-b border-[#d4dee9] p-3 last:border-b-0"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <span class="text-xs font-extrabold uppercase text-[#d64200]">{{ tipoAgendaLabel(evento.tipo) }}</span>
                  <strong class="mt-1 block break-words text-sm text-[#071d3b]">{{ evento.titulo }}</strong>
                  <span class="mt-1 block text-xs font-extrabold text-[#62728a]">{{ formatIsoDateLongBr(evento.data) }}</span>
                </div>
                <div v-if="podeEditarEvento(evento)" class="flex shrink-0 gap-2">
                  <button
                    class="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] transition hover:bg-[#dfe8f1]"
                    type="button"
                    title="Editar"
                    aria-label="Editar"
                    @click="editarEvento(evento)"
                  >
                    <Pencil class="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    class="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#ffe1e3] text-[#dc2626] transition hover:bg-[#ffd4d7]"
                    type="button"
                    title="Excluir"
                    aria-label="Excluir"
                    @click="excluirEvento(evento)"
                  >
                    <Trash2 class="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div class="grid gap-1 text-sm font-semibold text-[#243044]">
                <span>{{ evento.disciplinaNome }}</span>
                <span v-if="evento.observacao" class="break-words text-[#51627a]">{{ evento.observacao }}</span>
              </div>
            </article>

            <p v-if="!eventosMesSelecionado.length" class="m-0 rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-3 text-sm font-semibold text-[#62728a]">
              Nenhuma data marcada neste mes.
            </p>
            </div>
          </div>
        </div>
      </article>
  </section>
</template>

<script setup lang="ts">
import { CalendarCheck, ChevronLeft, ChevronRight, Pencil, RefreshCcw, Trash2 } from '@lucide/vue'
import type {
  CalendarioEscolarAno,
  CalendarioEscolarEvento,
  CalendarioEscolarEventoPayload,
  DisciplinaCaderneta,
  DisciplinaEvento,
  DisciplinaEventoPayload
} from '~/types/api'
import { formatDateToIso, formatIsoDateLongBr, parseIsoDate } from '~/utils/date-utils'
import { getFeriadosPorData } from '~/utils/feriados-brasil'
import { normalizeApiError } from '~/utils/api-client'
import { getUsuarioPerfilTipo } from '~/utils/usuario-permissions'

definePageMeta({
  roles: []
})

type TipoAgenda = 'avaliacao' | 'trabalho' | 'festa_escola' | 'reuniao_professores' | 'reuniao_pais_mestres'
type OrigemAgenda = 'disciplina' | 'escolar'

interface DiaCalendario {
  date: Date
  iso: string
  currentMonth: boolean
}

interface AgendaAcademicaEvento {
  id: string
  idEventoDisciplina?: number
  idDisciplina?: number
  disciplinaNome: string
  idProfessorUsuario?: number
  nomeProfessor?: string
  tipo: TipoAgenda
  data: string
  titulo: string
  observacao: string
  origem: OrigemAgenda
}

const auth = useAuthStore()
const { $api } = useNuxtApp()
const hoje = new Date()
const selectedYear = ref(hoje.getFullYear())
const selectedMonth = ref(hoje.getMonth())
const selectedDate = ref(formatDateToIso(hoje))
const disciplinas = ref<DisciplinaCaderneta[]>([])
const erroDisciplinas = ref('')
const erroAgenda = ref('')
const mensagemAgenda = ref('')
const editandoAgendaId = ref('')
const eventosDisciplina = ref<AgendaAcademicaEvento[]>([])
const eventosEscolares = ref<AgendaAcademicaEvento[]>([])
const diasSemanaCurtos = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
const agendaForm = reactive({
  idDisciplina: 0,
  data: selectedDate.value,
  tipo: 'avaliacao' as TipoAgenda,
  titulo: '',
  observacao: ''
})

const perfilTipo = computed(() => getUsuarioPerfilTipo(auth.usuario?.descricaoPerfil))
const podeGerenciarEventoDisciplina = computed(() => perfilTipo.value === 'professor')
const podeGerenciarEventoEscolar = computed(() => perfilTipo.value === 'administrador')
const podeGerenciarAgenda = computed(() => podeGerenciarEventoDisciplina.value || podeGerenciarEventoEscolar.value)
const eventos = computed(() => [...eventosDisciplina.value, ...eventosEscolares.value])
const agendaFormCategoria = computed(() => podeGerenciarEventoEscolar.value ? 'Eventos escolares' : 'Disciplinas')
const agendaFormTitulo = computed(() => podeGerenciarEventoEscolar.value ? 'Comunicados e reunioes' : 'Avaliacoes e trabalhos')
const textoBotaoAgenda = computed(() => podeGerenciarEventoEscolar.value ? 'Lancar evento' : 'Marcar data')
const tiposAgendaDisponiveis = computed(() => podeGerenciarEventoEscolar.value
  ? [
      { value: 'festa_escola', label: 'Festa da escola' },
      { value: 'reuniao_professores', label: 'Reuniao com professores' },
      { value: 'reuniao_pais_mestres', label: 'Reuniao de pais e mestres' }
    ]
  : [
      { value: 'avaliacao', label: 'Avaliacao' },
      { value: 'trabalho', label: 'Trabalho' }
    ]
)
const feriadosPorData = computed(() => getFeriadosPorData(selectedYear.value))
const eventosPorData = computed(() => {
  const grouped: Record<string, AgendaAcademicaEvento[]> = {}

  for (const evento of eventos.value) {
    grouped[evento.data] ??= []
    grouped[evento.data].push(evento)
  }

  for (const items of Object.values(grouped)) {
    items.sort((a, b) => a.titulo.localeCompare(b.titulo))
  }

  return grouped
})
const eventosMesSelecionado = computed(() =>
  eventos.value
    .filter((evento) => {
      const date = parseIsoDate(evento.data)
      return date?.getFullYear() === selectedYear.value && date.getMonth() === selectedMonth.value
    })
    .sort((a, b) => a.data.localeCompare(b.data) || a.disciplinaNome.localeCompare(b.disciplinaNome))
)
const eventosDiaSelecionado = computed(() => eventosPorData.value[selectedDate.value] ?? [])
const feriadoDiaSelecionado = computed(() => feriadosPorData.value[selectedDate.value])
const mesSelecionadoLabel = computed(() =>
  new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric'
  }).format(new Date(selectedYear.value, selectedMonth.value, 1))
)
const diaSelecionadoLabel = computed(() => formatIsoDateLongBr(selectedDate.value))

watch(() => agendaForm.data, (value) => {
  const date = parseIsoDate(value)
  if (date) {
    const periodChanged = selectedYear.value !== date.getFullYear() || selectedMonth.value !== date.getMonth()

    selectedYear.value = date.getFullYear()
    selectedMonth.value = date.getMonth()
    selectedDate.value = value

    if (periodChanged) {
      void carregarDadosCalendario()
    }
  }
})

onMounted(async () => {
  await carregarDadosCalendario()
})

async function carregarDadosCalendario() {
  await Promise.all([
    carregarDisciplinas(),
    carregarEventosDisciplina(),
    carregarEventosEscolares()
  ])
}

async function carregarDisciplinas() {
  erroDisciplinas.value = ''

  try {
    disciplinas.value = await $api<DisciplinaCaderneta[]>('/caderneta-digital/disciplinas')
  } catch (err) {
    erroDisciplinas.value = normalizeApiError(err)
  }
}

async function carregarEventosDisciplina() {
  erroDisciplinas.value = ''

  try {
    const eventosApi = await $api<DisciplinaEvento[]>('/caderneta-digital/disciplinas/eventos', {
      query: {
        ano: selectedYear.value
      }
    })

    eventosDisciplina.value = eventosApi.map(mapDisciplinaEvento)
  } catch (err) {
    erroDisciplinas.value = normalizeApiError(err)
    eventosDisciplina.value = []
  }
}

async function carregarEventosEscolares() {
  erroDisciplinas.value = ''

  try {
    const calendario = await $api<CalendarioEscolarAno>('/calendario-escolar', {
      query: {
        ano: selectedYear.value,
        mesSelecionado: selectedMonth.value + 1
      }
    })

    eventosEscolares.value = calendario.eventos.map(mapCalendarioEscolarEvento)
  } catch (err) {
    erroDisciplinas.value = normalizeApiError(err)
    eventosEscolares.value = []
  }
}

async function salvarAgenda() {
  erroAgenda.value = ''
  mensagemAgenda.value = ''

  if (!podeGerenciarAgenda.value) return

  if (podeGerenciarEventoEscolar.value) {
    await salvarEventoEscolar()
    return
  }

  await salvarEventoDisciplina()
}

async function salvarEventoDisciplina() {
  const disciplina = disciplinas.value.find((item) => item.idDisciplina === agendaForm.idDisciplina)
  if (!disciplina || !agendaForm.data || !agendaForm.titulo.trim()) {
    erroAgenda.value = 'Informe disciplina, data e titulo.'
    return
  }

  const payload: DisciplinaEventoPayload = {
    tipo: agendaForm.tipo === 'trabalho' ? 'Trabalho' : 'Avaliacao',
    data: agendaForm.data,
    titulo: agendaForm.titulo.trim(),
    descricao: agendaForm.observacao.trim() || null
  }

  try {
    const saved = editandoAgendaId.value
      ? await $api<DisciplinaEvento>(`/caderneta-digital/disciplinas/${disciplina.idDisciplina}/eventos/${editandoAgendaId.value}`, {
          method: 'PUT',
          body: payload
        })
      : await $api<DisciplinaEvento>(`/caderneta-digital/disciplinas/${disciplina.idDisciplina}/eventos`, {
          method: 'POST',
          body: payload
        })

    const evento = mapDisciplinaEvento(saved)
    eventosDisciplina.value = editandoAgendaId.value
      ? eventosDisciplina.value.map((item) => item.id === editandoAgendaId.value ? evento : item)
      : [...eventosDisciplina.value, evento]

    mensagemAgenda.value = editandoAgendaId.value
      ? 'Evento atualizado e alunos matriculados notificados.'
      : 'Evento marcado e alunos matriculados notificados.'
    limparAgendaForm()
  } catch (err) {
    erroAgenda.value = normalizeApiError(err)
  }
}

async function salvarEventoEscolar() {
  if (!agendaForm.data || !agendaForm.titulo.trim()) {
    erroAgenda.value = 'Informe data e titulo.'
    return
  }

  const payload: CalendarioEscolarEventoPayload = {
    data: agendaForm.data,
    tipo: mapTipoEventoEscolarApi(agendaForm.tipo),
    titulo: agendaForm.titulo.trim(),
    descricao: agendaForm.observacao.trim() || null,
    publicoAlvo: mapPublicoAlvoEventoEscolar(agendaForm.tipo)
  }

  try {
    const saved = await $api<CalendarioEscolarEvento>('/calendario-escolar/eventos', {
      method: 'POST',
      body: payload
    })

    eventosEscolares.value = [...eventosEscolares.value, mapCalendarioEscolarEvento(saved)]
    mensagemAgenda.value = `Evento escolar lancado e ${saved.totalNotificados} notificacao(oes) enviada(s).`
    limparAgendaForm()
  } catch (err) {
    erroAgenda.value = normalizeApiError(err)
  }
}

function editarEvento(evento: AgendaAcademicaEvento) {
  editandoAgendaId.value = evento.id
  agendaForm.idDisciplina = evento.idDisciplina ?? 0
  agendaForm.data = evento.data
  agendaForm.tipo = evento.tipo
  agendaForm.titulo = evento.titulo
  agendaForm.observacao = evento.observacao
}

function excluirEvento(evento: AgendaAcademicaEvento) {
  if (!confirm(`Excluir ${evento.titulo}?`)) return

  if (evento.origem === 'escolar') {
    erroAgenda.value = 'Eventos escolares lancados pela administracao ainda nao possuem exclusao pela tela.'
    return
  }

  if (!evento.idDisciplina || !evento.idEventoDisciplina) return

  $api(`/caderneta-digital/disciplinas/${evento.idDisciplina}/eventos/${evento.idEventoDisciplina}`, {
    method: 'DELETE'
  })
    .then(() => {
      eventosDisciplina.value = eventosDisciplina.value.filter((item) => item.id !== evento.id)
      if (editandoAgendaId.value === evento.id) limparAgendaForm()
    })
    .catch((err) => {
      erroAgenda.value = normalizeApiError(err)
    })
}

function limparAgendaForm() {
  editandoAgendaId.value = ''
  agendaForm.idDisciplina = 0
  agendaForm.data = selectedDate.value
  agendaForm.tipo = podeGerenciarEventoEscolar.value ? 'festa_escola' : 'avaliacao'
  agendaForm.titulo = ''
  agendaForm.observacao = ''
}

function mudarMes(amount: number) {
  const currentDate = parseIsoDate(selectedDate.value) ?? new Date(selectedYear.value, selectedMonth.value, 1)
  const targetMonth = new Date(selectedYear.value, selectedMonth.value + amount, 1)
  const lastDayOfTargetMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate()
  const targetDay = Math.min(currentDate.getDate(), lastDayOfTargetMonth)

  agendaForm.data = formatDateToIso(new Date(targetMonth.getFullYear(), targetMonth.getMonth(), targetDay))
}

function selecionarHoje() {
  agendaForm.data = formatDateToIso(hoje)
}

function selecionarDia(iso: string) {
  agendaForm.data = iso
}

function gradeMes(monthIndex: number): DiaCalendario[] {
  const firstDay = new Date(selectedYear.value, monthIndex, 1)
  const start = new Date(firstDay)
  start.setDate(firstDay.getDate() - firstDay.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)

    return {
      date,
      iso: formatDateToIso(date),
      currentMonth: date.getMonth() === monthIndex
    }
  })
}

function diaSelecionadoClasses(day: DiaCalendario) {
  const classes = []
  const isSelected = selectedDate.value === day.iso
  const isToday = formatDateToIso(hoje) === day.iso

  if (!day.currentMonth) classes.push('bg-[#f8fbfd] text-[#9aa7b7]')
  else classes.push('bg-white text-[#071d3b]')
  if (feriadosPorData.value[day.iso]) classes.push('bg-[#fff8ed]')
  if (isToday) classes.push('ring-2 ring-inset ring-[#f59e0b]')
  if (isSelected) classes.push('bg-[#f0faf8] ring-2 ring-inset ring-[#147f72]')

  return classes.join(' ')
}

function tipoAgendaLabel(tipo: TipoAgenda) {
  const labels: Record<TipoAgenda, string> = {
    avaliacao: 'Avaliacao',
    trabalho: 'Trabalho',
    festa_escola: 'Festa da escola',
    reuniao_professores: 'Reuniao com professores',
    reuniao_pais_mestres: 'Reuniao de pais e mestres'
  }

  return labels[tipo] ?? 'Evento'
}

function podeEditarEvento(evento: AgendaAcademicaEvento) {
  if (podeGerenciarEventoEscolar.value) return false

  return podeGerenciarEventoDisciplina.value
    && evento.origem === 'disciplina'
    && evento.idProfessorUsuario === auth.usuario?.idUsuario
}

function mapDisciplinaEvento(evento: DisciplinaEvento): AgendaAcademicaEvento {
  return {
    id: String(evento.idEventoDisciplina),
    idEventoDisciplina: evento.idEventoDisciplina,
    idDisciplina: evento.idDisciplina,
    disciplinaNome: evento.nomeDisciplina,
    idProfessorUsuario: evento.idProfessorUsuario,
    nomeProfessor: evento.nomeProfessor,
    tipo: evento.tipo.toLowerCase() === 'trabalho' ? 'trabalho' : 'avaliacao',
    data: evento.data,
    titulo: evento.titulo,
    observacao: evento.descricao ?? '',
    origem: 'disciplina'
  }
}

function mapCalendarioEscolarEvento(evento: CalendarioEscolarEvento): AgendaAcademicaEvento {
  return {
    id: `escolar-${evento.idEventoCalendarioEscolar}`,
    disciplinaNome: evento.nomeUsuarioCriador
      ? `Evento escolar por ${evento.nomeUsuarioCriador}`
      : 'Evento escolar',
    tipo: mapTipoEventoEscolarFront(evento.tipo),
    data: evento.data,
    titulo: evento.titulo,
    observacao: evento.descricao ?? '',
    origem: 'escolar'
  }
}

function mapTipoEventoEscolarApi(tipo: TipoAgenda) {
  const tipos: Partial<Record<TipoAgenda, string>> = {
    festa_escola: 'FestaEscola',
    reuniao_professores: 'ReuniaoProfessores',
    reuniao_pais_mestres: 'ReuniaoPaisMestres'
  }

  return tipos[tipo] ?? 'Evento'
}

function mapPublicoAlvoEventoEscolar(tipo: TipoAgenda) {
  if (tipo === 'reuniao_professores') {
    return 'Professores'
  }

  if (tipo === 'reuniao_pais_mestres') {
    return 'AlunosEProfessores'
  }

  return 'Todos'
}

function mapTipoEventoEscolarFront(tipo: string): TipoAgenda {
  const normalized = tipo.toLowerCase()

  if (normalized.includes('professor')) {
    return 'reuniao_professores'
  }

  if (normalized.includes('pais') || normalized.includes('mestres')) {
    return 'reuniao_pais_mestres'
  }

  if (normalized.includes('festa')) {
    return 'festa_escola'
  }

  return 'festa_escola'
}
</script>
