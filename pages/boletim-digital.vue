<template>
  <section class="grid gap-4">
    <article class="rounded-lg border border-[#d4dee9] bg-white/95 p-4 shadow-[0_22px_55px_rgba(14,30,53,0.08)] backdrop-blur-sm sm:p-5" :aria-busy="carregando">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="min-w-0">
          <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">Boletim Digital</p>
          <h2 class="m-0 mt-2 text-xl font-normal text-[#071d3b]">Boletim escolar</h2>
          <strong class="mt-1 block break-words text-sm text-[#147f72]">{{ appConfig.nomeEscola }}</strong>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] transition hover:bg-[#dfe8f1]"
            type="button"
            title="Atualizar boletim"
            aria-label="Atualizar boletim"
            :disabled="carregando"
            @click="carregarTela"
          >
            <RefreshCcw class="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            v-if="podeBaixarPdf"
            class="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#147f72] px-4 text-sm font-extrabold text-white transition hover:bg-[#0f6c61] disabled:cursor-wait disabled:opacity-70"
            type="button"
            :disabled="processando === 'pdf'"
            @click="baixarPdf"
          >
            <Download class="h-5 w-5" aria-hidden="true" />
            PDF
          </button>
        </div>
      </div>

      <div v-if="podeSelecionarAluno" class="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,360px)]">
        <div class="relative">
          <Search class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#62728a]" aria-hidden="true" />
          <input
            v-model.trim="buscaAluno"
            class="min-h-11 rounded-md border border-[#ccd8e5] bg-white pl-12 pr-3 text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
            type="search"
            placeholder="Consultar aluno"
          />
        </div>

        <select
          v-model.number="alunoSelecionadoId"
          class="min-h-11 rounded-md border border-[#ccd8e5] bg-white px-3 text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
          aria-label="Selecionar aluno"
          :disabled="carregando || carregandoBoletim || !alunosFiltrados.length"
          @change="selecionarAluno"
        >
          <option :value="0">Selecione o aluno</option>
          <option v-for="aluno in alunosFiltrados" :key="aluno.idUsuario" :value="aluno.idUsuario">
            {{ aluno.nome }} - {{ aluno.email }}
          </option>
        </select>
      </div>

      <p v-if="erro" class="alert alert-error mt-4">{{ erro }}</p>
      <p v-if="mensagem" class="alert alert-success mt-4">{{ mensagem }}</p>

      <div v-if="pendencias.length && podeGerenciarLiberacao" class="mt-4 grid gap-2 rounded-md border border-[#fed7aa] bg-[#fff7ed] p-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <strong class="text-sm text-[#92400e]">{{ pendencias.length }} boletim(ns) aguardando Diretoria</strong>
          <span class="text-xs font-extrabold uppercase text-[#b45309]">Liberacao</span>
        </div>
        <div class="flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="pendente in pendencias"
            :key="pendente.idAlunoUsuario"
            class="min-w-[220px] rounded-md border border-[#fed7aa] bg-white px-3 py-2 text-left transition hover:border-[#f59e0b]"
            type="button"
            @click="selecionarPendente(pendente.idAlunoUsuario)"
          >
            <strong class="block truncate text-sm text-[#071d3b]">{{ pendente.nomeAluno }}</strong>
            <span class="mt-1 block truncate text-xs font-semibold text-[#62728a]">{{ pendente.nomeTurmaEnsino }}</span>
          </button>
        </div>
      </div>
    </article>

    <article v-if="boletim" class="rounded-lg border border-[#d4dee9] bg-white/95 p-4 shadow-[0_22px_55px_rgba(14,30,53,0.08)] backdrop-blur-sm sm:p-5" :aria-busy="carregandoBoletim">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div class="flex min-w-0 items-center gap-4">
          <UserAvatar :usuario="alunoBoletimUsuario" size="lg" />
          <div class="min-w-0">
            <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">Aluno</p>
            <h2 class="m-0 mt-1 break-words text-xl font-normal text-[#071d3b]">{{ boletim.nomeAluno }}</h2>
            <p class="m-0 mt-1 break-all text-sm font-semibold text-[#62728a]">{{ boletim.emailAluno }}</p>
            <p class="m-0 mt-1 break-words text-sm font-semibold text-[#51627a]">{{ boletim.nomeTipoEnsino }} / {{ boletim.nomeTurmaEnsino }}</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-if="boletim.podeSolicitarLiberacao"
            class="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#147f72] px-4 text-sm font-extrabold text-white transition hover:bg-[#0f6c61] disabled:cursor-wait disabled:opacity-70"
            type="button"
            :disabled="processando === 'solicitar'"
            @click="solicitarLiberacao"
          >
            <Send class="h-5 w-5" aria-hidden="true" />
            Enviar a Diretoria
          </button>
          <button
            v-if="boletim.podeLiberar"
            class="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#147f72] px-4 text-sm font-extrabold text-white transition hover:bg-[#0f6c61] disabled:cursor-wait disabled:opacity-70"
            type="button"
            :disabled="processando === 'liberar'"
            @click="liberarBoletim"
          >
            <ClipboardCheck class="h-5 w-5" aria-hidden="true" />
            Liberar boletim
          </button>
          <button
            v-if="podeCompartilharBoletim"
            class="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#d4dee9] bg-white px-4 text-sm font-extrabold text-[#071d3b] transition hover:bg-[#edf3f8] disabled:cursor-wait disabled:opacity-70"
            type="button"
            :disabled="processando === 'compartilhar'"
            @click="copiarLinkCompartilhamento"
          >
            <component :is="linkCopiado ? Check : Copy" class="h-5 w-5" aria-hidden="true" />
            Copiar link
          </button>
          <button
            v-if="podeCompartilharBoletim"
            class="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#d4dee9] bg-white px-4 text-sm font-extrabold text-[#071d3b] transition hover:bg-[#edf3f8] disabled:cursor-wait disabled:opacity-70"
            type="button"
            :disabled="processando === 'compartilhar'"
            @click="abrirWhatsApp"
          >
            <MessageCircle class="h-5 w-5" aria-hidden="true" />
            WhatsApp
          </button>
          <button
            v-if="podeCompartilharBoletim"
            class="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#d4dee9] bg-white px-4 text-sm font-extrabold text-[#071d3b] transition hover:bg-[#edf3f8] disabled:cursor-wait disabled:opacity-70"
            type="button"
            :disabled="processando === 'compartilhar'"
            @click="abrirEmail"
          >
            <Mail class="h-5 w-5" aria-hidden="true" />
            Email
          </button>
        </div>
      </div>

      <div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <div class="rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-3">
          <span class="text-xs font-extrabold uppercase text-[#62728a]">Status</span>
          <strong class="mt-2 inline-flex w-fit rounded-md px-2 py-1 text-sm" :class="statusBoletimClass(boletim.status)">
            {{ formatarStatusBoletim(boletim.status) }}
          </strong>
        </div>
        <div class="rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-3">
          <span class="text-xs font-extrabold uppercase text-[#62728a]">Situacao geral</span>
          <strong class="mt-2 inline-flex w-fit rounded-md px-2 py-1 text-sm" :class="situacaoBoletimClass(boletim.situacaoGeral)">
            {{ boletim.situacaoGeral || '-' }}
          </strong>
        </div>
        <div class="rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-3">
          <span class="text-xs font-extrabold uppercase text-[#62728a]">Media geral</span>
          <strong class="mt-2 block text-[#071d3b]">{{ formatarDecimal(boletim.mediaGeral, 2) }}</strong>
        </div>
        <div class="rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-3">
          <span class="text-xs font-extrabold uppercase text-[#62728a]">Disciplinas</span>
          <strong class="mt-2 block text-[#071d3b]">{{ boletim.disciplinasLancadas }} / {{ boletim.totalDisciplinas }}</strong>
        </div>
        <div class="rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-3">
          <span class="text-xs font-extrabold uppercase text-[#62728a]">Presencas</span>
          <strong class="mt-2 block text-[#071d3b]">{{ boletim.totalPresencas }}</strong>
        </div>
        <div class="rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-3">
          <span class="text-xs font-extrabold uppercase text-[#62728a]">Faltas</span>
          <strong class="mt-2 block text-[#071d3b]">{{ boletim.totalFaltas }}</strong>
        </div>
      </div>

      <div class="mt-4 grid gap-2 text-sm font-semibold text-[#51627a]">
        <span v-if="boletim.disciplinasPendentes > 0" class="inline-flex items-center gap-2 rounded-md border border-[#fed7aa] bg-[#fff7ed] px-3 py-2 text-[#92400e]">
          <TriangleAlert class="h-5 w-5 shrink-0" aria-hidden="true" />
          {{ boletim.disciplinasPendentes }} disciplina(s) pendente(s) de lancamento.
        </span>
        <span v-if="boletim.nomeProfessorSolicitante" class="rounded-md border border-[#d4dee9] bg-[#f8fbfd] px-3 py-2">
          Enviado por {{ boletim.nomeProfessorSolicitante }} em {{ formatarDataHora(boletim.solicitadoEmUtc) }}.
        </span>
        <span v-if="boletim.nomeAdministradorLiberacao" class="rounded-md border border-[#d4dee9] bg-[#f8fbfd] px-3 py-2">
          Liberado por {{ boletim.nomeAdministradorLiberacao }} em {{ formatarDataHora(boletim.liberadoEmUtc) }}.
        </span>
      </div>
    </article>

    <article v-if="boletim" class="min-w-0 rounded-lg border border-[#d4dee9] bg-white/95 p-4 shadow-[0_22px_55px_rgba(14,30,53,0.08)] backdrop-blur-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">{{ boletim.disciplinas.length }} disciplina(s)</p>
          <h2 class="m-0 mt-2 text-xl font-normal text-[#071d3b]">Notas e frequencia</h2>
        </div>
      </div>

      <div class="mt-4 hidden max-h-[calc(100vh-360px)] min-h-[320px] overflow-auto rounded-lg border border-[#d4dee9] md:block">
        <div class="sticky top-0 z-10 grid min-w-[920px] grid-cols-[minmax(220px,1.3fr)_minmax(280px,1.2fr)_110px_150px_140px] items-center gap-3 bg-[#f5f8fb] px-4 py-3 text-xs font-extrabold uppercase text-[#51627a]">
          <span>Disciplina</span>
          <span>Notas</span>
          <span class="text-center">Media</span>
          <span class="text-center">Situacao</span>
          <span class="text-center">Frequencia</span>
        </div>

        <article
          v-for="disciplina in boletim.disciplinas"
          :key="disciplina.idDisciplina"
          class="grid min-w-[920px] grid-cols-[minmax(220px,1.3fr)_minmax(280px,1.2fr)_110px_150px_140px] items-center gap-3 border-t border-[#d4dee9] px-4 py-4 text-sm"
        >
          <div class="min-w-0">
            <strong class="block break-words text-[#243044]">{{ disciplina.nomeDisciplina }}</strong>
            <span v-if="disciplina.nomeAreaConhecimento" class="mt-1 block text-xs font-semibold text-[#51627a]">{{ disciplina.nomeAreaConhecimento }}</span>
            <span v-if="disciplina.nomeProfessor" class="mt-1 block text-xs font-semibold text-[#7a8798]">Prof. {{ disciplina.nomeProfessor }}</span>
          </div>
          <div class="grid grid-cols-4 gap-2">
            <div v-for="nota in notasDisciplina(disciplina)" :key="`${disciplina.idDisciplina}-${nota.label}`" class="rounded-md border border-[#d4dee9] bg-[#f8fbfd] px-2 py-2 text-center">
              <span class="block text-[10px] font-extrabold uppercase text-[#62728a]">{{ nota.label }}</span>
              <strong class="mt-1 block text-[#071d3b]">{{ nota.value }}</strong>
            </div>
          </div>
          <strong class="text-center text-[#071d3b]">{{ formatarDecimal(disciplina.mediaAritmetica, 2) }}</strong>
          <div class="flex justify-center">
            <span class="inline-flex rounded-md px-2 py-1 text-xs font-extrabold" :class="situacaoBoletimClass(disciplina.situacao)">
              {{ disciplina.situacao || '-' }}
            </span>
          </div>
          <div class="text-center text-sm font-extrabold text-[#071d3b]">
            <span>{{ disciplina.presencas ?? '-' }} presencas</span>
            <span class="mt-1 block text-[#62728a]">{{ disciplina.faltas ?? '-' }} faltas</span>
          </div>
        </article>

        <p v-if="!boletim.disciplinas.length" class="m-0 border-t border-[#d4dee9] px-4 py-6 text-[#62728a]">
          Nenhuma disciplina encontrada para a turma do aluno.
        </p>
      </div>

      <div class="mt-4 grid gap-3 md:hidden">
        <article v-for="disciplina in boletim.disciplinas" :key="disciplina.idDisciplina" class="rounded-lg border border-[#d4dee9] bg-white p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="m-0 break-words text-base font-extrabold text-[#071d3b]">{{ disciplina.nomeDisciplina }}</h3>
              <p v-if="disciplina.nomeAreaConhecimento" class="m-0 mt-1 text-sm font-semibold text-[#51627a]">{{ disciplina.nomeAreaConhecimento }}</p>
              <p v-if="disciplina.nomeProfessor" class="m-0 mt-1 text-xs font-semibold text-[#7a8798]">Prof. {{ disciplina.nomeProfessor }}</p>
            </div>
            <span class="inline-flex shrink-0 rounded-md px-2 py-1 text-xs font-extrabold" :class="situacaoBoletimClass(disciplina.situacao)">
              {{ disciplina.situacao || '-' }}
            </span>
          </div>

          <div class="mt-4 grid grid-cols-4 gap-2">
            <div v-for="nota in notasDisciplina(disciplina)" :key="`${disciplina.idDisciplina}-mobile-${nota.label}`" class="rounded-md border border-[#d4dee9] bg-[#f8fbfd] px-2 py-2 text-center">
              <span class="block text-[10px] font-extrabold uppercase text-[#62728a]">{{ nota.label }}</span>
              <strong class="mt-1 block text-[#071d3b]">{{ nota.value }}</strong>
            </div>
          </div>

          <div class="mt-3 grid gap-2 text-sm font-semibold text-[#243044]">
            <span><strong>Media:</strong> {{ formatarDecimal(disciplina.mediaAritmetica, 2) }}</span>
            <span><strong>Presencas:</strong> {{ disciplina.presencas ?? '-' }}</span>
            <span><strong>Faltas:</strong> {{ disciplina.faltas ?? '-' }}</span>
          </div>
        </article>
      </div>
    </article>

    <article v-if="!boletim && !carregando" class="rounded-lg border border-[#d4dee9] bg-white/95 p-5 text-sm font-semibold text-[#62728a] shadow-[0_22px_55px_rgba(14,30,53,0.08)]">
      Nenhum boletim encontrado.
    </article>
  </section>
</template>

<script setup lang="ts">
import { Check, ClipboardCheck, Copy, Download, Mail, MessageCircle, RefreshCcw, Search, Send, TriangleAlert } from '@lucide/vue'
import type { BoletimDigital, BoletimDigitalCompartilhamento, BoletimDigitalDisciplina, BoletimDigitalResumoAluno, UsuarioSummary } from '~/types/api'
import { normalizeApiError } from '~/utils/api-client'
import { downloadBlob, fetchApiBlob } from '~/utils/api-file'
import { copyShareText } from '~/utils/share-actions'
import { getUsuarioPerfilTipo, isPerfilAluno } from '~/utils/usuario-permissions'

definePageMeta({
  roles: []
})

const auth = useAuthStore()
const appConfig = useAppConfigStore()
const route = useRoute()
const config = useRuntimeConfig()
const { $api } = useNuxtApp()

const boletim = ref<BoletimDigital | null>(null)
const pendencias = ref<BoletimDigitalResumoAluno[]>([])
const alunos = ref<UsuarioSummary[]>([])
const alunoSelecionadoId = ref(0)
const buscaAluno = ref('')
const carregando = ref(false)
const carregandoBoletim = ref(false)
const processando = ref('')
const erro = ref('')
const mensagem = ref('')
const compartilhamento = ref<BoletimDigitalCompartilhamento | null>(null)
const linkCopiado = ref(false)

const perfilTipo = computed(() => getUsuarioPerfilTipo(auth.usuario?.descricaoPerfil))
const podeSelecionarAluno = computed(() => perfilTipo.value !== 'aluno')
const podeGerenciarLiberacao = computed(() => auth.isAdmin)
const alunosFiltrados = computed(() => {
  const termo = buscaAluno.value.toLowerCase()
  const somenteAlunos = alunos.value.filter((usuario) => isPerfilAluno(usuario.descricaoPerfil))

  if (!termo) return somenteAlunos

  return somenteAlunos.filter((usuario) =>
    [usuario.nome, usuario.email, usuario.descricaoPerfil]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(termo))
  )
})
const alunoBoletimUsuario = computed(() =>
  alunos.value.find((usuario) => usuario.idUsuario === boletim.value?.idAlunoUsuario)
  ?? (auth.isAluno ? auth.usuario : null)
)
const podeBaixarPdf = computed(() =>
  Boolean(boletim.value?.podeCompartilhar && (auth.isAluno || auth.isAdmin))
)
const podeCompartilharBoletim = computed(() =>
  Boolean(boletim.value?.podeCompartilhar && (auth.isAluno || auth.isAdmin))
)

onMounted(async () => {
  await carregarTela()
})

watch(() => route.query.alunoUsuarioId, async (value) => {
  if (!podeSelecionarAluno.value) return

  const alunoUsuarioId = Number(value ?? 0)
  if (alunoUsuarioId > 0 && alunoUsuarioId !== alunoSelecionadoId.value) {
    alunoSelecionadoId.value = alunoUsuarioId
    await carregarBoletimComIndicador()
  }
})

async function carregarTela() {
  carregando.value = true
  erro.value = ''
  mensagem.value = ''
  compartilhamento.value = null

  try {
    await appConfig.carregar()

    if (auth.isAluno) {
      await carregarBoletim()
      return
    }

    await Promise.all([
      carregarAlunos(),
      podeGerenciarLiberacao.value ? carregarPendencias() : Promise.resolve()
    ])

    const alunoQuery = Number(route.query.alunoUsuarioId ?? 0)
    const alunoPreferido = alunoQuery
      || pendencias.value[0]?.idAlunoUsuario
      || alunosFiltrados.value[0]?.idUsuario
      || 0

    alunoSelecionadoId.value = alunoPreferido

    if (alunoPreferido) {
      await carregarBoletim()
    } else {
      boletim.value = null
    }
  } catch (err) {
    boletim.value = null
    erro.value = normalizeApiError(err)
  } finally {
    carregando.value = false
  }
}

async function carregarAlunos() {
  alunos.value = await $api<UsuarioSummary[]>('/usuarios')
}

async function carregarPendencias() {
  pendencias.value = await $api<BoletimDigitalResumoAluno[]>('/boletins-digitais/pendentes-liberacao')
}

async function carregarBoletimComIndicador() {
  carregandoBoletim.value = true
  erro.value = ''
  mensagem.value = ''
  compartilhamento.value = null

  try {
    await carregarBoletim()
  } catch (err) {
    boletim.value = null
    erro.value = normalizeApiError(err)
  } finally {
    carregandoBoletim.value = false
  }
}

async function carregarBoletim() {
  if (!auth.isAluno && !alunoSelecionadoId.value) {
    boletim.value = null
    return
  }

  const endpoint = auth.isAluno
    ? '/boletins-digitais/me'
    : `/boletins-digitais/alunos/${alunoSelecionadoId.value}`

  boletim.value = await $api<BoletimDigital>(endpoint)
}

async function selecionarAluno() {
  const query = { ...route.query }

  if (alunoSelecionadoId.value) {
    query.alunoUsuarioId = String(alunoSelecionadoId.value)
  } else {
    delete query.alunoUsuarioId
  }

  await navigateTo({ path: '/boletim-digital', query }, { replace: true })
  await carregarBoletimComIndicador()
}

async function selecionarPendente(alunoUsuarioId: number) {
  alunoSelecionadoId.value = alunoUsuarioId
  await selecionarAluno()
}

async function solicitarLiberacao() {
  if (!boletim.value) return

  await executarAcao('solicitar', async () => {
    boletim.value = await $api<BoletimDigital>(`/boletins-digitais/alunos/${boletim.value!.idAlunoUsuario}/solicitar-liberacao`, {
      method: 'POST'
    })
    mensagem.value = 'Boletim enviado para liberacao da Diretoria.'
    await carregarPendenciasSeNecessario()
  })
}

async function liberarBoletim() {
  if (!boletim.value) return

  await executarAcao('liberar', async () => {
    boletim.value = await $api<BoletimDigital>(`/boletins-digitais/alunos/${boletim.value!.idAlunoUsuario}/liberar`, {
      method: 'POST'
    })
    mensagem.value = 'Boletim liberado para o aluno.'
    await carregarPendenciasSeNecessario()
  })
}

async function baixarPdf() {
  if (!boletim.value) return

  await executarAcao('pdf', async () => {
    const endpoint = auth.isAluno
      ? '/boletins-digitais/me/pdf'
      : `/boletins-digitais/alunos/${boletim.value!.idAlunoUsuario}/pdf`
    const blob = await fetchApiBlob(endpoint, config.public.apiBase, auth.token)
    downloadBlob(blob, `boletim-${boletim.value!.idAlunoUsuario}.pdf`)
  })
}

async function copiarLinkCompartilhamento() {
  const dados = await obterCompartilhamento()
  if (!dados?.url) return

  const copiado = await copyShareText(dados.url)
  if (!copiado) {
    erro.value = 'Nao foi possivel acessar a area de transferencia.'
    return
  }

  linkCopiado.value = true
  window.setTimeout(() => {
    linkCopiado.value = false
  }, 1800)
}

async function abrirWhatsApp() {
  const dados = await obterCompartilhamento()
  if (dados?.whatsAppCompartilhamentoUrl) {
    window.open(dados.whatsAppCompartilhamentoUrl, '_blank', 'noopener,noreferrer')
  }
}

async function abrirEmail() {
  const dados = await obterCompartilhamento()
  if (dados?.emailCompartilhamentoUrl) {
    window.location.href = dados.emailCompartilhamentoUrl
  }
}

async function obterCompartilhamento() {
  if (compartilhamento.value) return compartilhamento.value
  if (!boletim.value) return null

  await executarAcao('compartilhar', async () => {
    const endpoint = auth.isAluno
      ? '/boletins-digitais/me/compartilhamento'
      : `/boletins-digitais/alunos/${boletim.value!.idAlunoUsuario}/compartilhamento`
    compartilhamento.value = await $api<BoletimDigitalCompartilhamento>(endpoint, {
      method: 'POST'
    })
  })

  return compartilhamento.value
}

async function executarAcao(tipo: string, action: () => Promise<void>) {
  processando.value = tipo
  erro.value = ''
  mensagem.value = tipo === 'compartilhar' ? mensagem.value : ''

  try {
    await action()
  } catch (err) {
    erro.value = normalizeApiError(err)
  } finally {
    processando.value = ''
  }
}

async function carregarPendenciasSeNecessario() {
  if (podeGerenciarLiberacao.value) {
    await carregarPendencias()
  }
}

function notasDisciplina(disciplina: BoletimDigitalDisciplina) {
  return Array.from({ length: 4 }, (_, index) => ({
    label: `Nota ${index + 1}`,
    value: disciplina.notas[index] === undefined
      ? '-'
      : disciplina.notas[index].toLocaleString('pt-BR', { maximumFractionDigits: 1 })
  }))
}

function formatarDecimal(value?: number | null, maximumFractionDigits = 2) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString('pt-BR', { maximumFractionDigits })
    : '-'
}

function formatarStatusBoletim(status: string) {
  const normalized = normalizarTexto(status)
  const labels: Record<string, string> = {
    emaberto: 'Em aberto',
    pendentediretoria: 'Aguardando Diretoria',
    liberado: 'Liberado'
  }

  return labels[normalized] ?? status
}

function statusBoletimClass(status: string) {
  const normalized = normalizarTexto(status)

  if (normalized.includes('liberado')) {
    return 'border border-[#b7e4da] bg-[#eaf4f1] text-[#0f766e]'
  }

  if (normalized.includes('pendente')) {
    return 'border border-[#f59e0b] bg-[#fff7ed] text-[#92400e]'
  }

  return 'border border-[#d4dee9] bg-[#edf3f8] text-[#071d3b]'
}

function situacaoBoletimClass(situacao: string) {
  const normalized = normalizarTexto(situacao)

  if (normalized.includes('recuper')) {
    return 'border border-[#f59e0b] bg-[#fff7ed] text-[#92400e]'
  }

  if (normalized.includes('reprov') || normalized.includes('vermelho')) {
    return 'border border-[#f2b8b5] bg-[#fff1f1] text-[#b42318]'
  }

  if (normalized.includes('aprov') || normalized.includes('liberado')) {
    return 'border border-[#b7e4da] bg-[#eaf4f1] text-[#0f766e]'
  }

  return 'border border-[#d4dee9] bg-[#edf3f8] text-[#071d3b]'
}

function formatarDataHora(value?: string | null) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function normalizarTexto(value?: string | null) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}
</script>
