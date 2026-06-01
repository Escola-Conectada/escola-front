<template>
  <section class="grid gap-5">
    <article class="min-w-0 rounded-lg border border-[#d4dee9] bg-white p-4 shadow-[0_22px_55px_rgba(14,30,53,0.08)] sm:p-6" :aria-busy="carregandoArquivosLista">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">{{ usuariosVisiveis.length }} usuario(s)</p>
          <h2 class="m-0 mt-2 text-xl font-normal text-[#071d3b]">Usuarios</h2>
        </div>
        <div class="flex flex-wrap gap-2">
          <NuxtLink
            v-if="podeCadastrarUsuarios"
            class="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#147f72] px-4 text-sm font-extrabold text-white no-underline transition hover:bg-[#0f6c61]"
            to="/usuarios/novo"
          >
            <Plus class="h-5 w-5" aria-hidden="true" />
            Novo usuario
          </NuxtLink>
          <button
            class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] transition hover:bg-[#dfe8f1]"
            type="button"
            title="Atualizar lista"
            aria-label="Atualizar lista"
            @click="carregar"
          >
            <RefreshCcw class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div class="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
        <div class="relative">
          <Search class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#62728a]" aria-hidden="true" />
          <input v-model.trim="busca" class="min-h-11 rounded-md border border-[#ccd8e5] pl-12 pr-3 text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10" type="search" placeholder="Consultar usuario" />
        </div>

        <select
          v-model.number="perfilFiltro"
          class="min-h-11 rounded-md border border-[#ccd8e5] px-3 text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
          aria-label="Filtrar por perfil"
        >
          <option :value="0">Todos os perfis</option>
          <option v-for="perfil in perfisFiltro" :key="perfil.idPerfil" :value="perfil.idPerfil">
            {{ formatPerfilLabel(perfil.descricaoPerfil) }}
          </option>
        </select>
      </div>

      <p v-if="erroLista" class="alert alert-error mt-4">{{ erroLista }}</p>

      <div class="mt-4 hidden max-h-[520px] overflow-auto rounded-lg border border-[#d4dee9] md:block">
        <table class="w-full table-fixed border-collapse text-left">
          <thead class="sticky top-0 z-10 bg-[#f5f8fb] text-xs uppercase text-[#51627a]">
            <tr>
              <th class="w-[38%] px-4 py-4">Nome</th>
              <th class="w-[13%] px-4 py-4 text-center">Contato</th>
              <th class="w-[16%] px-4 py-4">Tipo</th>
              <th class="w-[13%] px-4 py-4 text-center">Docs</th>
              <th class="w-[20%] px-4 py-4 text-center">Acoes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usuario in usuariosPaginados" :key="usuario.idUsuario" class="border-t border-[#d4dee9]">
              <td class="px-4 py-4 font-semibold text-[#243044]">
                <div class="flex min-w-0 items-center gap-3">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#edf3f8] text-xs font-extrabold text-[#071d3b]">
                    <img
                      v-if="fotoUsuarioListaUrl(usuario)"
                      class="h-full w-full object-cover"
                      :src="fotoUsuarioListaUrl(usuario)"
                      :alt="`Foto de ${usuario.nome}`"
                    />
                    <span v-else>{{ obterIniciais(usuario.nome) }}</span>
                  </div>
                  <span class="min-w-0 break-words">{{ usuario.nome }}</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="flex justify-center">
                  <button
                    class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] transition hover:bg-[#dfe8f1]"
                    type="button"
                    title="Ver contato"
                    aria-label="Ver contato"
                    @click="abrirContatoUsuario(usuario)"
                  >
                    <Contact class="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </td>
              <td class="px-4 py-4 text-[#243044]">{{ formatPerfilLabel(usuario.descricaoPerfil) }}</td>
              <td class="px-4 py-4">
                <div class="flex justify-center">
                  <button
                    v-if="usuarioTemCertificados(usuario)"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] transition hover:bg-[#dfe8f1]"
                    type="button"
                    title="Ver documentos"
                    aria-label="Ver documentos"
                    @click="abrirArquivosProfessor(usuario)"
                  >
                    <FileText class="h-5 w-5" aria-hidden="true" />
                  </button>
                  <span v-else class="inline-flex h-10 w-10 items-center justify-center text-[#9aa8ba]">-</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="flex justify-center gap-2">
                  <NuxtLink
                    class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] no-underline transition hover:bg-[#dfe8f1]"
                    :to="`/usuarios/${usuario.idUsuario}`"
                    title="Visualizar usuario"
                    aria-label="Visualizar usuario"
                  >
                    <Eye class="h-5 w-5" aria-hidden="true" />
                  </NuxtLink>
                  <NuxtLink
                    v-if="podeEditarUsuario(usuario)"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] no-underline transition hover:bg-[#dfe8f1]"
                    :to="`/usuarios/${usuario.idUsuario}?editar=1`"
                    title="Editar usuario"
                    aria-label="Editar usuario"
                  >
                    <Pencil class="h-5 w-5" aria-hidden="true" />
                  </NuxtLink>
                  <button
                    v-if="podeExcluirUsuario(usuario)"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#ffe1e3] text-[#dc2626] transition hover:bg-[#ffd4d7]"
                    type="button"
                    title="Excluir usuario"
                    aria-label="Excluir usuario"
                    @click="excluir(usuario)"
                  >
                    <Trash2 class="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!carregando && !usuariosFiltrados.length">
              <td class="px-4 py-6 text-[#62728a]" colspan="5">Nenhum usuario encontrado.</td>
            </tr>
            <tr v-if="carregando && !usuarios.length">
              <td class="px-4 py-6 text-[#62728a]" colspan="5">Carregando usuarios...</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 grid gap-3 md:hidden">
        <article
          v-for="usuario in usuariosPaginados"
          :key="usuario.idUsuario"
          class="rounded-lg border border-[#d4dee9] bg-white p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-start gap-3">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#edf3f8] text-xs font-extrabold text-[#071d3b]">
                <img
                  v-if="fotoUsuarioListaUrl(usuario)"
                  class="h-full w-full object-cover"
                  :src="fotoUsuarioListaUrl(usuario)"
                  :alt="`Foto de ${usuario.nome}`"
                />
                <span v-else>{{ obterIniciais(usuario.nome) }}</span>
              </div>
              <div class="min-w-0">
                <h3 class="m-0 truncate text-base font-extrabold text-[#071d3b]">{{ usuario.nome }}</h3>
              </div>
            </div>
            <span class="max-w-[42%] break-words rounded-md bg-[#eaf4f1] px-2 py-1 text-right text-xs font-extrabold text-[#006b61]">
              {{ formatPerfilLabel(usuario.descricaoPerfil) }}
            </span>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <button
              class="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] transition hover:bg-[#dfe8f1]"
              type="button"
              title="Ver contato"
              aria-label="Ver contato"
              @click="abrirContatoUsuario(usuario)"
            >
              <Contact class="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              v-if="usuarioTemCertificados(usuario)"
              class="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] transition hover:bg-[#dfe8f1]"
              type="button"
              title="Ver documentos"
              aria-label="Ver documentos"
              @click="abrirArquivosProfessor(usuario)"
            >
              <FileText class="h-5 w-5" aria-hidden="true" />
            </button>
            <NuxtLink
              class="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] no-underline transition hover:bg-[#dfe8f1]"
              :to="`/usuarios/${usuario.idUsuario}`"
              title="Visualizar usuario"
              aria-label="Visualizar usuario"
            >
              <Eye class="h-5 w-5" aria-hidden="true" />
            </NuxtLink>
            <NuxtLink
              v-if="podeEditarUsuario(usuario)"
              class="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] no-underline transition hover:bg-[#dfe8f1]"
              :to="`/usuarios/${usuario.idUsuario}?editar=1`"
              title="Editar usuario"
              aria-label="Editar usuario"
            >
              <Pencil class="h-5 w-5" aria-hidden="true" />
            </NuxtLink>
            <button
              v-if="podeExcluirUsuario(usuario)"
              class="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-[#ffe1e3] text-[#dc2626] transition hover:bg-[#ffd4d7]"
              type="button"
              title="Excluir usuario"
              aria-label="Excluir usuario"
              @click="excluir(usuario)"
            >
              <Trash2 class="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </article>

        <p v-if="!carregando && !usuariosFiltrados.length" class="m-0 rounded-lg border border-[#d4dee9] bg-white p-4 text-[#62728a]">
          Nenhum usuario encontrado.
        </p>
        <p v-if="carregando && !usuarios.length" class="m-0 rounded-lg border border-[#d4dee9] bg-white p-4 text-[#62728a]">
          Carregando usuarios...
        </p>
      </div>

      <div class="mt-4 flex flex-col gap-3 text-sm font-extrabold text-[#62728a] sm:flex-row sm:items-center sm:justify-between">
        <span>{{ intervaloTexto }}</span>
        <div class="flex items-center gap-2">
          <button
            class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] disabled:opacity-45"
            type="button"
            :disabled="pagina === 1"
            aria-label="Pagina anterior"
            @click="pagina--"
          >
            <ChevronLeft class="h-5 w-5" aria-hidden="true" />
          </button>
          <span>Pagina {{ pagina }} de {{ totalPaginas }}</span>
          <button
            class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] disabled:opacity-45"
            type="button"
            :disabled="pagina === totalPaginas"
            aria-label="Proxima pagina"
            @click="pagina++"
          >
            <ChevronRight class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>

    <div
      v-if="usuarioContatoPopup"
      class="fixed inset-0 z-40 grid place-items-center bg-[#071d3b]/50 px-4 py-6"
      @click.self="fecharContatoUsuario"
    >
      <article class="grid w-full max-w-md gap-4 rounded-lg bg-white p-5 shadow-[0_22px_55px_rgba(14,30,53,0.24)]">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">Contato</p>
            <h2 class="m-0 mt-1 break-words text-xl font-normal text-[#071d3b]">{{ usuarioContatoPopup.nome }}</h2>
          </div>
          <button
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] transition hover:bg-[#dfe8f1]"
            type="button"
            title="Fechar"
            aria-label="Fechar"
            @click="fecharContatoUsuario"
          >
            <X class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div class="grid gap-2">
          <a
            class="flex min-w-0 items-center gap-3 rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-3 text-[#071d3b] no-underline transition hover:border-[#147f72]"
            :href="`mailto:${usuarioContatoPopup.email}`"
          >
            <Mail class="h-5 w-5 shrink-0" aria-hidden="true" />
            <span class="break-all text-sm font-extrabold">{{ usuarioContatoPopup.email }}</span>
          </a>
          <a
            class="flex min-w-0 items-center gap-3 rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-3 text-[#071d3b] no-underline transition hover:border-[#147f72]"
            :href="telefoneContatoHref"
          >
            <Phone class="h-5 w-5 shrink-0" aria-hidden="true" />
            <span class="text-sm font-extrabold">{{ telefoneContatoFormatado }}</span>
          </a>
          <div class="grid min-w-0 gap-2 rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-3 text-sm font-semibold text-[#51627a]">
            <span><strong class="text-[#071d3b]">Mae:</strong> {{ usuarioContatoPopup.nomeMae || '-' }}</span>
            <span><strong class="text-[#071d3b]">Pai:</strong> {{ usuarioContatoPopup.nomePai || '-' }}</span>
            <span class="break-words"><strong class="text-[#071d3b]">Endereco:</strong> {{ usuarioContatoPopup.endereco || '-' }}</span>
          </div>
        </div>
      </article>
    </div>

    <div
      v-if="usuarioArquivosPopup"
      class="fixed inset-0 z-40 grid place-items-center bg-[#071d3b]/50 px-4 py-6"
      @click.self="fecharArquivosProfessor"
    >
      <article class="grid max-h-[90vh] w-full max-w-lg min-w-0 gap-4 overflow-y-auto overflow-x-hidden rounded-lg bg-white p-5 shadow-[0_22px_55px_rgba(14,30,53,0.24)]">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">Documentos</p>
            <h2 class="m-0 mt-1 break-words text-xl font-normal text-[#071d3b] [overflow-wrap:anywhere]">{{ usuarioArquivosPopup.nome }}</h2>
          </div>
          <button
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] transition hover:bg-[#dfe8f1]"
            type="button"
            title="Fechar"
            aria-label="Fechar"
            @click="fecharArquivosProfessor"
          >
            <X class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div class="grid gap-2">
          <button
            v-for="arquivo in arquivosPopup"
            :key="obterArquivoId(arquivo)"
            class="flex min-w-0 items-center justify-between gap-3 rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-3 text-left text-[#071d3b] transition hover:border-[#147f72] disabled:cursor-wait disabled:opacity-70"
            type="button"
            :disabled="arquivoBaixandoId === obterArquivoId(arquivo)"
            @click="baixarArquivoProfessor(arquivo)"
          >
            <span class="inline-flex min-w-0 items-center gap-2">
              <FileText class="h-5 w-5 shrink-0" aria-hidden="true" />
              <span class="truncate text-sm font-extrabold [overflow-wrap:anywhere]">{{ arquivo.nomeOriginal || 'Certificado PDF' }}</span>
            </span>
            <span class="inline-flex shrink-0 items-center gap-2 text-xs font-extrabold text-[#62728a]">
              {{ arquivoBaixandoId === obterArquivoId(arquivo) ? 'Baixando...' : formatarTamanhoArquivo(arquivo.tamanhoBytes) }}
              <Download class="h-4 w-4" aria-hidden="true" />
            </span>
          </button>
        </div>

        <p v-if="!arquivosPopup.length" class="m-0 rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-3 text-sm font-semibold text-[#62728a]">
          Nenhum documento cadastrado.
        </p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight, Contact, Download, Eye, FileText, Mail, Pencil, Phone, Plus, RefreshCcw, Search, Trash2, X } from '@lucide/vue'
import type { Perfil, UsuarioArquivo, UsuarioSummary } from '~/types/api'
import { normalizeApiError } from '~/utils/api-client'
import { downloadBlob, fetchApiBlob } from '~/utils/api-file'
import {
  formatBrazilPhone,
  normalizeBrazilPhoneForApi
} from '~/utils/br-phone'
import {
  canCreateAlunoUsuarios,
  canDeleteUsuario,
  canEditUsuario,
  canViewUsuarioInList,
  formatPerfilLabel,
  getUsuarioPerfilTipo
} from '~/utils/usuario-permissions'

definePageMeta({
  roles: []
})

const { $api } = useNuxtApp()
const config = useRuntimeConfig()
const auth = useAuthStore()
const usuarios = ref<UsuarioSummary[]>([])
const arquivosPorUsuario = ref<Record<number, UsuarioArquivo[]>>({})
const fotosPorUsuario = ref<Record<number, string>>({})
const usuarioContatoPopup = ref<UsuarioSummary | null>(null)
const usuarioArquivosPopup = ref<UsuarioSummary | null>(null)
const carregando = ref(false)
const carregandoArquivosLista = ref(false)
const arquivoBaixandoId = ref(0)
const erroLista = ref('')
const busca = ref('')
const perfilFiltro = ref(0)
const pagina = ref(1)
const porPagina = 10

const usuariosVisiveis = computed(() =>
  usuarios.value.filter((usuario) => canViewUsuarioInList(auth.usuario, usuario))
)
const perfisFiltro = computed<Perfil[]>(() => {
  const perfisMap = new Map<number, string>()

  for (const usuario of usuariosVisiveis.value) {
    if (usuario.idPerfil && usuario.descricaoPerfil) {
      perfisMap.set(usuario.idPerfil, usuario.descricaoPerfil)
    }
  }

  return Array.from(perfisMap, ([idPerfil, descricaoPerfil]) => ({ idPerfil, descricaoPerfil }))
    .sort((a, b) => formatPerfilLabel(a.descricaoPerfil).localeCompare(formatPerfilLabel(b.descricaoPerfil)))
})
const podeCadastrarUsuarios = computed(() => canCreateAlunoUsuarios(auth.perfil))
const arquivosPopup = computed(() =>
  usuarioArquivosPopup.value ? obterCertificadosDoUsuario(usuarioArquivosPopup.value.idUsuario) : []
)
const telefoneContatoFormatado = computed(() =>
  usuarioContatoPopup.value ? formatBrazilPhone(usuarioContatoPopup.value.telefone) || '-' : '-'
)
const telefoneContatoHref = computed(() =>
  usuarioContatoPopup.value ? `tel:${normalizeBrazilPhoneForApi(usuarioContatoPopup.value.telefone)}` : ''
)
const usuariosFiltrados = computed(() => {
  const termo = busca.value.toLowerCase()
  const usuariosDoPerfil = perfilFiltro.value
    ? usuariosVisiveis.value.filter((usuario) => usuario.idPerfil === perfilFiltro.value)
    : usuariosVisiveis.value

  if (!termo) return usuariosDoPerfil

  return usuariosDoPerfil.filter((usuario) =>
    [usuario.nome, usuario.email, usuario.telefone, formatBrazilPhone(usuario.telefone), usuario.nomeMae, usuario.nomePai, usuario.endereco, usuario.descricaoPerfil, formatPerfilLabel(usuario.descricaoPerfil)]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(termo))
  )
})
const totalPaginas = computed(() => Math.max(1, Math.ceil(usuariosFiltrados.value.length / porPagina)))
const usuariosPaginados = computed(() => {
  const inicio = (pagina.value - 1) * porPagina

  return usuariosFiltrados.value.slice(inicio, inicio + porPagina)
})
const intervaloTexto = computed(() => {
  if (!usuariosFiltrados.value.length) return '0 usuario(s)'

  const inicio = (pagina.value - 1) * porPagina + 1
  const fim = Math.min(pagina.value * porPagina, usuariosFiltrados.value.length)

  return `${inicio}-${fim} de ${usuariosFiltrados.value.length} usuario(s)`
})

watch([busca, perfilFiltro], () => {
  pagina.value = 1
})
watch(perfisFiltro, (perfisDisponiveis) => {
  if (perfilFiltro.value && !perfisDisponiveis.some((perfil) => perfil.idPerfil === perfilFiltro.value)) {
    perfilFiltro.value = 0
  }
})
watch(totalPaginas, (total) => {
  if (pagina.value > total) pagina.value = total
})

onMounted(async () => {
  await carregar()
})

onBeforeUnmount(() => {
  limparFotosUsuarios()
})

async function carregar() {
  carregando.value = true
  erroLista.value = ''

  try {
    usuarios.value = await $api<UsuarioSummary[]>('/usuarios')
  } catch (err) {
    if (auth.usuario) {
      try {
        const usuario = await $api<UsuarioSummary>(`/usuarios/${auth.usuario.idUsuario}`)
        usuarios.value = [usuario]
      } catch {
        usuarios.value = [auth.usuario]
      }
    } else {
      erroLista.value = normalizeApiError(err)
    }
  } finally {
    carregando.value = false
  }

  await Promise.all([
    carregarArquivosProfessores(),
    carregarFotosUsuarios()
  ])
}

async function carregarArquivosProfessores() {
  const professores = usuariosVisiveis.value.filter(usuarioEhProfessorDaLista)
  arquivosPorUsuario.value = {}

  if (!professores.length) {
    return
  }

  carregandoArquivosLista.value = true

  try {
    const resultados = await Promise.all(professores.map(async (usuario) => {
      try {
        const arquivos = await $api<UsuarioArquivo[]>(`/usuarios/${usuario.idUsuario}/arquivos`)
        return [usuario.idUsuario, obterApenasCertificados(arquivos)] as const
      } catch {
        return [usuario.idUsuario, []] as const
      }
    }))

    arquivosPorUsuario.value = Object.fromEntries(resultados)
  } finally {
    carregandoArquivosLista.value = false
  }
}

async function carregarFotosUsuarios() {
  limparFotosUsuarios()

  const usuariosComFoto = usuariosVisiveis.value.filter((usuario) => usuario.fotoPerfilUrl)
  if (!usuariosComFoto.length) {
    return
  }

  const resultados = await Promise.all(usuariosComFoto.map(async (usuario) => {
    try {
      const blob = await fetchApiBlob(`/usuarios/${usuario.idUsuario}/foto`, config.public.apiBase, auth.token)
      return [usuario.idUsuario, URL.createObjectURL(blob)] as const
    } catch {
      return [usuario.idUsuario, ''] as const
    }
  }))

  fotosPorUsuario.value = Object.fromEntries(resultados.filter(([, url]) => Boolean(url)))
}

function limparFotosUsuarios() {
  Object.values(fotosPorUsuario.value).forEach((url) => {
    if (url) URL.revokeObjectURL(url)
  })
  fotosPorUsuario.value = {}
}

function fotoUsuarioListaUrl(usuario: UsuarioSummary) {
  return fotosPorUsuario.value[usuario.idUsuario] || ''
}

function obterApenasCertificados(arquivos: UsuarioArquivo[]) {
  return arquivos.filter((arquivo) => arquivo.tipoArquivo?.toLowerCase() === 'certificado')
}

function usuarioEhProfessorDaLista(usuario: UsuarioSummary) {
  return getUsuarioPerfilTipo(usuario.descricaoPerfil) === 'professor'
}

function obterCertificadosDoUsuario(idUsuario: number) {
  return arquivosPorUsuario.value[idUsuario] ?? []
}

function usuarioTemCertificados(usuario: UsuarioSummary) {
  return usuarioEhProfessorDaLista(usuario) && obterCertificadosDoUsuario(usuario.idUsuario).length > 0
}

function abrirContatoUsuario(usuario: UsuarioSummary) {
  usuarioContatoPopup.value = usuario
}

function fecharContatoUsuario() {
  usuarioContatoPopup.value = null
}

function abrirArquivosProfessor(usuario: UsuarioSummary) {
  if (!usuarioTemCertificados(usuario)) {
    return
  }

  usuarioArquivosPopup.value = usuario
}

function fecharArquivosProfessor() {
  usuarioArquivosPopup.value = null
}

function podeEditarUsuario(usuario: UsuarioSummary) {
  return canEditUsuario(auth.usuario, usuario)
}

function podeExcluirUsuario(_usuario: UsuarioSummary) {
  return canDeleteUsuario(auth.usuario)
}

async function baixarArquivoProfessor(arquivo: UsuarioArquivo) {
  await baixarArquivoUsuario(usuarioArquivosPopup.value?.idUsuario, arquivo)
}

async function baixarArquivoUsuario(idUsuario: number | null | undefined, arquivo: UsuarioArquivo) {
  const arquivoId = obterArquivoId(arquivo)
  if (!idUsuario || !arquivoId) {
    erroLista.value = 'Arquivo sem identificador para download.'
    return
  }

  arquivoBaixandoId.value = arquivoId
  erroLista.value = ''

  try {
    const blob = await fetchApiBlob(`/usuarios/${idUsuario}/arquivos/${arquivoId}/download`, config.public.apiBase, auth.token)
    downloadBlob(blob, arquivo.nomeOriginal || 'certificado.pdf')
  } catch (err) {
    erroLista.value = normalizeApiError(err)
  } finally {
    arquivoBaixandoId.value = 0
  }
}

async function excluir(usuario: UsuarioSummary) {
  if (!podeExcluirUsuario(usuario)) {
    return
  }

  if (!confirm(`Excluir o usuario ${usuario.nome}?`)) {
    return
  }

  erroLista.value = ''

  try {
    await $api(`/usuarios/${usuario.idUsuario}`, { method: 'DELETE' })
    await carregar()
  } catch (err) {
    erroLista.value = normalizeApiError(err)
  }
}

function formatarTamanhoArquivo(tamanhoBytes?: number | null) {
  if (!tamanhoBytes || tamanhoBytes <= 0) return 'PDF'

  if (tamanhoBytes < 1024 * 1024) {
    return `${Math.ceil(tamanhoBytes / 1024)} KB`
  }

  return `${(tamanhoBytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

function obterArquivoId(arquivo: UsuarioArquivo) {
  return arquivo.idArquivo ?? arquivo.idUsuarioArquivo ?? 0
}

function obterIniciais(nome?: string | null) {
  const partes = (nome ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!partes.length) return 'U'

  return partes
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('')
}
</script>
