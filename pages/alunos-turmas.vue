<template>
  <section class="grid gap-5">
    <div class="grid gap-4 xl:grid-cols-[minmax(300px,390px)_minmax(0,1fr)] xl:items-start">
      <form
        class="grid gap-4 rounded-lg border border-[#d4dee9] bg-white/95 p-4 shadow-[0_22px_55px_rgba(14,30,53,0.08)] backdrop-blur-sm sm:p-5"
        @submit.prevent="salvar"
      >
        <div>
          <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">{{ editandoMatriculaId ? 'Edicao' : 'Matricula' }}</p>
          <h2 class="m-0 mt-1 text-xl font-normal text-[#071d3b]">Aluno e turma</h2>
        </div>

        <label class="grid gap-1.5 text-sm font-extrabold text-[#071d3b]">
          <span>Tipo do ensino</span>
          <select
            v-model.number="form.idTipoEnsino"
            class="min-h-11 rounded-md border border-[#ccd8e5] bg-white px-3 text-sm text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
            required
            :disabled="!estruturaEnsino.length"
          >
            <option :value="0">Selecione</option>
            <option v-for="tipo in estruturaEnsino" :key="tipo.idTipoEnsino" :value="tipo.idTipoEnsino">
              {{ tipo.nome }}
            </option>
          </select>
        </label>

        <label class="grid gap-1.5 text-sm font-extrabold text-[#071d3b]">
          <span>Turma</span>
          <select
            v-model.number="form.idTurmaEnsino"
            class="min-h-11 rounded-md border border-[#ccd8e5] bg-white px-3 text-sm text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
            required
            :disabled="!turmasForm.length"
          >
            <option :value="0">Selecione</option>
            <option v-for="turma in turmasForm" :key="turma.idTurmaEnsino" :value="turma.idTurmaEnsino">
              {{ turma.nome }} - {{ turma.codigo }}
            </option>
          </select>
        </label>

        <label class="grid gap-1.5 text-sm font-extrabold text-[#071d3b]">
          <span>Aluno</span>
          <select
            v-model.number="form.idAlunoUsuario"
            class="min-h-11 rounded-md border border-[#ccd8e5] bg-white px-3 text-sm text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
            required
            :disabled="!alunosDisponiveisForm.length"
          >
            <option :value="0">Selecione</option>
            <option v-for="aluno in alunosDisponiveisForm" :key="aluno.idUsuario" :value="aluno.idUsuario">
              {{ aluno.nome }} - {{ aluno.email }}
            </option>
          </select>
        </label>

        <p v-if="erroForm" class="alert alert-error">{{ erroForm }}</p>
        <p v-if="mensagemForm" class="alert alert-success">{{ mensagemForm }}</p>

        <div class="grid gap-2 sm:grid-cols-[1fr_auto]">
          <button
            class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#147f72] px-4 text-sm font-extrabold text-white transition hover:bg-[#0f6c61] disabled:cursor-wait disabled:opacity-70"
            type="submit"
            :disabled="salvando"
          >
            <LinkIcon class="h-5 w-5" aria-hidden="true" />
            {{ editandoMatriculaId ? 'Atualizar matricula' : 'Salvar matricula' }}
          </button>
          <button
            v-if="editandoMatriculaId"
            class="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d4dee9] bg-white px-4 text-sm font-extrabold text-[#51627a] transition hover:bg-[#edf3f8]"
            type="button"
            @click="limparForm"
          >
            Cancelar
          </button>
        </div>
      </form>

      <article class="min-w-0 rounded-lg border border-[#d4dee9] bg-white/95 p-4 shadow-[0_22px_55px_rgba(14,30,53,0.08)] backdrop-blur-sm sm:p-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="min-w-0">
            <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">{{ matriculasFiltradas.length }} registro(s)</p>
            <h2 class="m-0 mt-1 text-xl font-normal text-[#071d3b]">Alunos matriculados</h2>
          </div>
          <button
            class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] transition hover:bg-[#dfe8f1]"
            type="button"
            title="Atualizar dados"
            aria-label="Atualizar dados"
            @click="carregar"
          >
            <RefreshCcw class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div class="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_190px_170px]">
          <div class="relative">
            <Search class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#62728a]" aria-hidden="true" />
            <input
              v-model.trim="busca"
              class="min-h-11 rounded-md border border-[#ccd8e5] bg-white pl-12 pr-3 text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
              type="search"
              placeholder="Consultar matricula"
            />
          </div>

          <select
            v-model.number="tipoEnsinoFiltro"
            class="min-h-11 rounded-md border border-[#ccd8e5] bg-white px-3 text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
            aria-label="Filtrar por tipo do ensino"
          >
            <option :value="0">Todos os tipos</option>
            <option v-for="tipo in estruturaEnsino" :key="tipo.idTipoEnsino" :value="tipo.idTipoEnsino">
              {{ tipo.nome }}
            </option>
          </select>

          <select
            v-model.number="turmaEnsinoFiltro"
            class="min-h-11 rounded-md border border-[#ccd8e5] bg-white px-3 text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
            aria-label="Filtrar por turma"
          >
            <option :value="0">Todas as turmas</option>
            <option v-for="turma in turmasFiltro" :key="turma.idTurmaEnsino" :value="turma.idTurmaEnsino">
              {{ turma.nome }} - {{ turma.codigo }}
            </option>
          </select>
        </div>

        <p v-if="erroLista" class="alert alert-error mt-4">{{ erroLista }}</p>

        <div class="mt-4 hidden max-h-[560px] overflow-auto rounded-lg border border-[#d4dee9] md:block">
          <table class="w-full min-w-[760px] table-fixed border-collapse text-left">
            <thead class="sticky top-0 bg-[#f5f8fb] text-xs uppercase text-[#51627a]">
              <tr>
                <th class="w-[35%] px-4 py-4">Aluno</th>
                <th class="w-[28%] px-4 py-4">Turma</th>
                <th class="w-[20%] px-4 py-4">Registro</th>
                <th class="w-[17%] px-4 py-4 text-center">Acoes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="matricula in matriculasFiltradas" :key="matricula.idAlunoTurmaEnsino" class="border-t border-[#d4dee9]">
                <td class="px-4 py-4">
                  <strong class="block truncate text-[#243044]">{{ matricula.nomeAluno }}</strong>
                  <span class="mt-1 block break-all text-xs font-semibold text-[#51627a]">{{ matricula.emailAluno }}</span>
                </td>
                <td class="px-4 py-4">
                  <strong class="block truncate text-[#243044]">{{ matricula.nomeTipoEnsino }}</strong>
                  <span class="mt-1 block truncate text-xs font-semibold text-[#51627a]">{{ matricula.nomeTurmaEnsino }} - {{ matricula.codigoTurma }}</span>
                </td>
                <td class="px-4 py-4 text-sm font-semibold text-[#51627a]">
                  <span class="block">{{ formatarData(matricula.matriculadoEmUtc) }}</span>
                  <span v-if="matricula.nomeUsuarioResponsavel" class="mt-1 block truncate text-xs text-[#7a8798]">{{ matricula.nomeUsuarioResponsavel }}</span>
                </td>
                <td class="px-4 py-4">
                  <div class="flex justify-center gap-2">
                    <button
                      class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] transition hover:bg-[#dfe8f1]"
                      type="button"
                      title="Editar matricula"
                      aria-label="Editar matricula"
                      @click="editar(matricula)"
                    >
                      <Pencil class="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#ffe1e3] text-[#dc2626] transition hover:bg-[#ffd4d7]"
                      type="button"
                      title="Excluir matricula"
                      aria-label="Excluir matricula"
                      @click="excluir(matricula)"
                    >
                      <Trash2 class="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!carregando && !matriculasFiltradas.length">
                <td class="px-4 py-6 text-[#62728a]" colspan="4">Nenhuma matricula encontrada.</td>
              </tr>
              <tr v-if="carregando">
                <td class="px-4 py-6 text-[#62728a]" colspan="4">Carregando matriculas...</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 grid gap-3 md:hidden">
          <article
            v-for="matricula in matriculasFiltradas"
            :key="matricula.idAlunoTurmaEnsino"
            class="rounded-lg border border-[#d4dee9] bg-white p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="m-0 truncate text-base font-extrabold text-[#071d3b]">{{ matricula.nomeAluno }}</h3>
                <p class="m-0 mt-1 break-all text-sm font-semibold text-[#51627a]">{{ matricula.emailAluno }}</p>
              </div>
              <span class="max-w-[42%] break-words rounded-md bg-[#eaf4f1] px-2 py-1 text-right text-xs font-extrabold text-[#006b61]">
                {{ matricula.codigoTurma }}
              </span>
            </div>
            <div class="mt-3 grid gap-1 text-sm font-semibold text-[#243044]">
              <span>{{ matricula.nomeTipoEnsino }}</span>
              <span>{{ matricula.nomeTurmaEnsino }} - {{ matricula.codigoTurma }}</span>
              <span class="text-[#62728a]">{{ formatarData(matricula.matriculadoEmUtc) }}</span>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <button
                class="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] transition hover:bg-[#dfe8f1]"
                type="button"
                title="Editar matricula"
                aria-label="Editar matricula"
                @click="editar(matricula)"
              >
                <Pencil class="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                class="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-[#ffe1e3] text-[#dc2626] transition hover:bg-[#ffd4d7]"
                type="button"
                title="Excluir matricula"
                aria-label="Excluir matricula"
                @click="excluir(matricula)"
              >
                <Trash2 class="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </article>

          <p v-if="!carregando && !matriculasFiltradas.length" class="m-0 rounded-lg border border-[#d4dee9] bg-white p-4 text-[#62728a]">
            Nenhuma matricula encontrada.
          </p>
          <p v-if="carregando" class="m-0 rounded-lg border border-[#d4dee9] bg-white p-4 text-[#62728a]">
            Carregando matriculas...
          </p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Link as LinkIcon, Pencil, RefreshCcw, Search, Trash2 } from '@lucide/vue'
import type { AlunoTurmaEnsino, AlunoTurmaEnsinoPayload, TipoEnsinoCurricular, UsuarioSummary } from '~/types/api'
import { normalizeApiError } from '~/utils/api-client'
import { isPerfilAluno } from '~/utils/usuario-permissions'

definePageMeta({
  roles: []
})

const auth = useAuthStore()
const { $api } = useNuxtApp()
const usuarios = ref<UsuarioSummary[]>([])
const estruturaEnsino = ref<TipoEnsinoCurricular[]>([])
const matriculas = ref<AlunoTurmaEnsino[]>([])
const carregando = ref(false)
const salvando = ref(false)
const erroLista = ref('')
const erroForm = ref('')
const mensagemForm = ref('')
const busca = ref('')
const tipoEnsinoFiltro = ref(0)
const turmaEnsinoFiltro = ref(0)
const editandoMatriculaId = ref<number | null>(null)
const form = reactive({
  idAlunoUsuario: 0,
  idTipoEnsino: 0,
  idTurmaEnsino: 0
})

const alunos = computed(() =>
  usuarios.value.filter((usuario) => isPerfilAluno(usuario.descricaoPerfil))
)
const turmaSelecionada = computed(() =>
  estruturaEnsino.value
    .flatMap((tipo) => tipo.turmas.map((turma) => ({ ...turma, idTipoEnsino: tipo.idTipoEnsino })))
    .find((turma) => turma.idTurmaEnsino === form.idTurmaEnsino) ?? null
)
const tipoForm = computed(() =>
  estruturaEnsino.value.find((tipo) => tipo.idTipoEnsino === form.idTipoEnsino) ?? null
)
const turmasForm = computed(() => tipoForm.value?.turmas ?? [])
const alunosDisponiveisForm = computed(() => {
  const alunoEditandoId = matriculaEditando.value?.idAlunoUsuario ?? 0
  const idsMatriculados = new Set(matriculas.value
    .filter((matricula) => matricula.idAlunoUsuario !== alunoEditandoId)
    .map((matricula) => matricula.idAlunoUsuario))

  return alunos.value.filter((aluno) => !idsMatriculados.has(aluno.idUsuario))
})
const matriculaEditando = computed(() =>
  editandoMatriculaId.value
    ? matriculas.value.find((matricula) => matricula.idAlunoTurmaEnsino === editandoMatriculaId.value) ?? null
    : null
)
const turmasFiltro = computed(() => {
  const tipos = tipoEnsinoFiltro.value
    ? estruturaEnsino.value.filter((tipo) => tipo.idTipoEnsino === tipoEnsinoFiltro.value)
    : estruturaEnsino.value

  return tipos.flatMap((tipo) => tipo.turmas)
})
const matriculasFiltradas = computed(() => {
  const termo = busca.value.toLowerCase()
  const porEstrutura = matriculas.value.filter((matricula) =>
    (!tipoEnsinoFiltro.value || matricula.idTipoEnsino === tipoEnsinoFiltro.value)
    && (!turmaEnsinoFiltro.value || matricula.idTurmaEnsino === turmaEnsinoFiltro.value)
  )

  if (!termo) return porEstrutura

  return porEstrutura.filter((matricula) =>
    [
      matricula.nomeAluno,
      matricula.emailAluno,
      matricula.nomeTipoEnsino,
      matricula.nomeTurmaEnsino,
      matricula.codigoTurma,
      matricula.nomeUsuarioResponsavel
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(termo))
  )
})

watch(() => form.idTipoEnsino, () => {
  if (!turmasForm.value.some((turma) => turma.idTurmaEnsino === form.idTurmaEnsino)) {
    form.idTurmaEnsino = turmasForm.value[0]?.idTurmaEnsino ?? 0
  }
})

watch(() => form.idTurmaEnsino, () => {
  if (turmaSelecionada.value && turmaSelecionada.value.idTipoEnsino !== form.idTipoEnsino) {
    form.idTipoEnsino = turmaSelecionada.value.idTipoEnsino
  }
})

watch(alunosDisponiveisForm, () => {
  if (form.idAlunoUsuario && !alunosDisponiveisForm.value.some((aluno) => aluno.idUsuario === form.idAlunoUsuario)) {
    form.idAlunoUsuario = 0
  }
})

watch(tipoEnsinoFiltro, () => {
  if (turmaEnsinoFiltro.value && !turmasFiltro.value.some((turma) => turma.idTurmaEnsino === turmaEnsinoFiltro.value)) {
    turmaEnsinoFiltro.value = 0
  }
})

onMounted(async () => {
  if (!auth.isAdmin) {
    await navigateTo('/', { replace: true })
    return
  }

  await carregar()
})

async function carregar() {
  carregando.value = true
  erroLista.value = ''

  try {
    const [estrutura, usuariosResponse, matriculasResponse] = await Promise.all([
      $api<TipoEnsinoCurricular[]>('/caderneta-digital/estrutura-ensino'),
      $api<UsuarioSummary[]>('/usuarios'),
      $api<AlunoTurmaEnsino[]>('/alunos-turmas')
    ])

    estruturaEnsino.value = estrutura
    usuarios.value = usuariosResponse
    matriculas.value = matriculasResponse
    preencherFormPadrao()
  } catch (err) {
    erroLista.value = normalizeApiError(err)
  } finally {
    carregando.value = false
  }
}

async function salvar() {
  erroForm.value = ''
  mensagemForm.value = ''

  if (!form.idAlunoUsuario || !form.idTurmaEnsino) {
    erroForm.value = 'Informe aluno e turma.'
    return
  }

  salvando.value = true
  const payload: AlunoTurmaEnsinoPayload = {
    idAlunoUsuario: form.idAlunoUsuario,
    idTurmaEnsino: form.idTurmaEnsino
  }

  try {
    if (editandoMatriculaId.value) {
      await $api<AlunoTurmaEnsino>(`/alunos-turmas/${editandoMatriculaId.value}`, {
        method: 'PUT',
        body: payload
      })
    } else {
      await $api<AlunoTurmaEnsino>('/alunos-turmas', {
        method: 'POST',
        body: payload
      })
    }

    limparForm()
    mensagemForm.value = 'Matricula salva com sucesso.'
    matriculas.value = await $api<AlunoTurmaEnsino[]>('/alunos-turmas')
  } catch (err) {
    erroForm.value = normalizeApiError(err)
  } finally {
    salvando.value = false
  }
}

function editar(matricula: AlunoTurmaEnsino) {
  editandoMatriculaId.value = matricula.idAlunoTurmaEnsino
  form.idAlunoUsuario = matricula.idAlunoUsuario
  form.idTipoEnsino = matricula.idTipoEnsino
  form.idTurmaEnsino = matricula.idTurmaEnsino
  erroForm.value = ''
  mensagemForm.value = ''
}

async function excluir(matricula: AlunoTurmaEnsino) {
  if (!confirm(`Excluir a matricula de ${matricula.nomeAluno} em ${matricula.nomeTurmaEnsino}?`)) {
    return
  }

  erroLista.value = ''

  try {
    await $api(`/alunos-turmas/${matricula.idAlunoTurmaEnsino}`, { method: 'DELETE' })
    if (editandoMatriculaId.value === matricula.idAlunoTurmaEnsino) limparForm()
    matriculas.value = await $api<AlunoTurmaEnsino[]>('/alunos-turmas')
  } catch (err) {
    erroLista.value = normalizeApiError(err)
  }
}

function limparForm() {
  editandoMatriculaId.value = null
  form.idAlunoUsuario = 0
  form.idTipoEnsino = 0
  form.idTurmaEnsino = 0
  erroForm.value = ''
  mensagemForm.value = ''
  preencherFormPadrao()
}

function preencherFormPadrao() {
  if (!estruturaEnsino.value.length) {
    form.idTipoEnsino = 0
    form.idTurmaEnsino = 0
    return
  }

  if (!estruturaEnsino.value.some((tipo) => tipo.idTipoEnsino === form.idTipoEnsino)) {
    form.idTipoEnsino = estruturaEnsino.value[0].idTipoEnsino
  }

  if (!turmasForm.value.some((turma) => turma.idTurmaEnsino === form.idTurmaEnsino)) {
    form.idTurmaEnsino = turmasForm.value[0]?.idTurmaEnsino ?? 0
  }
}

function formatarData(value: string) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}
</script>
