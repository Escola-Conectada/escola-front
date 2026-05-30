<template>
  <section class="grid gap-4">
    <article class="rounded-lg border border-[#d4dee9] bg-white/95 p-3 shadow-[0_22px_55px_rgba(14,30,53,0.08)] backdrop-blur-sm sm:p-4">
      <div class="grid gap-3 xl:grid-cols-[minmax(180px,240px)_minmax(420px,1fr)_auto] xl:items-end">
        <div class="min-w-0">
          <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">Estrutura de ensino</p>
          <h2 class="m-0 mt-1 truncate text-lg font-normal text-[#071d3b]">Tipos, turmas e disciplinas</h2>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <label class="grid gap-1.5 text-xs font-extrabold text-[#071d3b]">
            <span>Tipo do ensino</span>
            <select
              v-model.number="estruturaTipoEnsinoId"
              class="min-h-10 rounded-md border border-[#ccd8e5] bg-white px-3 text-sm text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
              :disabled="!estruturaEnsino.length"
            >
              <option :value="0">Selecione</option>
              <option v-for="tipo in estruturaEnsino" :key="tipo.idTipoEnsino" :value="tipo.idTipoEnsino">
                {{ tipo.nome }}
              </option>
            </select>
          </label>

          <label class="grid gap-1.5 text-xs font-extrabold text-[#071d3b]">
            <span>Turma</span>
            <select
              v-model.number="estruturaTurmaEnsinoId"
              class="min-h-10 rounded-md border border-[#ccd8e5] bg-white px-3 text-sm text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
              :disabled="!estruturaTurmasSelecionadas.length"
            >
              <option :value="0">Selecione</option>
              <option v-for="turma in estruturaTurmasSelecionadas" :key="turma.idTurmaEnsino" :value="turma.idTurmaEnsino">
                {{ turma.nome }} - {{ turma.codigo }}
              </option>
            </select>
          </label>
        </div>

        <div class="grid grid-cols-3 gap-2 rounded-md border border-[#d4dee9] bg-[#f8fbfd]/95 p-2">
          <div class="min-w-0">
            <span class="text-[11px] font-extrabold uppercase text-[#62728a]">Tipos</span>
            <strong class="block truncate text-sm text-[#071d3b]">{{ carregandoEstrutura ? '...' : estruturaEnsino.length }}</strong>
          </div>
          <div class="min-w-0">
            <span class="text-[11px] font-extrabold uppercase text-[#62728a]">Turmas</span>
            <strong class="block truncate text-sm text-[#071d3b]">{{ totalTurmasEstruturaSelecionada }}</strong>
          </div>
          <div class="min-w-0">
            <span class="text-[11px] font-extrabold uppercase text-[#62728a]">Disciplinas</span>
            <strong class="block truncate text-sm text-[#071d3b]">{{ totalDisciplinasEstruturaSelecionada }}</strong>
          </div>
        </div>
      </div>

      <p v-if="erroEstrutura" class="alert alert-error mt-3">{{ erroEstrutura }}</p>

      <div v-if="estruturaAreasSelecionadas.length" class="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        <article
          v-for="area in estruturaAreasSelecionadas"
          :key="area.idAreaConhecimento"
          class="min-w-0 rounded-md border border-[#d4dee9] bg-white p-3"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="min-w-0">
              <p class="m-0 text-[11px] font-extrabold uppercase text-[#d64200]">Area</p>
              <h3 class="m-0 truncate text-sm font-extrabold text-[#071d3b]" :title="area.nome">{{ area.nome }}</h3>
            </div>
            <span class="shrink-0 rounded-md bg-[#edf3f8] px-2 py-1 text-xs font-extrabold text-[#51627a]">
              {{ area.disciplinas.length }}
            </span>
          </div>
          <div class="mt-2 flex max-h-16 flex-wrap gap-1.5 overflow-hidden">
            <span
              v-for="disciplina in area.disciplinas"
              :key="disciplina.idDisciplina"
              class="max-w-full truncate rounded-md border border-[#cbdce8] bg-[#f8fbfd] px-2 py-1 text-[11px] font-extrabold text-[#243044]"
              :title="disciplina.observacao || disciplina.nome"
            >
              {{ disciplina.nome }}
            </span>
          </div>
        </article>
      </div>

      <p v-else-if="!carregandoEstrutura" class="mt-3 rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-3 text-sm font-semibold text-[#51627a]">
        Nenhuma estrutura curricular encontrada.
      </p>
    </article>

    <div class="grid gap-4 xl:grid-cols-[minmax(300px,400px)_minmax(0,1fr)] xl:items-start">
      <div v-if="podeAdministrar" class="grid gap-4">
        <div
          class="rounded-lg border border-[#d4dee9] bg-white/95 p-4 shadow-[0_22px_55px_rgba(14,30,53,0.08)] backdrop-blur-sm"
          @keydown.enter.prevent="salvarLancamento"
        >
          <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">{{ editandoLancamentoId ? 'Edicao' : 'Lancamento' }}</p>
          <h2 class="mb-4 mt-1 text-lg font-normal text-[#071d3b]">Notas e frequencia</h2>

          <div class="grid gap-3">
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="grid gap-1.5 text-sm font-extrabold text-[#071d3b]">
                <span>Tipo do ensino</span>
                <select
                  v-model.number="lancamentoForm.idTipoEnsino"
                  class="min-h-10 rounded-md border border-[#ccd8e5] bg-white px-3 text-sm text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
                  required
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
                  v-model.number="lancamentoForm.idTurmaEnsino"
                  class="min-h-10 rounded-md border border-[#ccd8e5] bg-white px-3 text-sm text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
                  required
                  :disabled="!turmasLancamento.length"
                >
                  <option :value="0">Selecione</option>
                  <option v-for="turma in turmasLancamento" :key="turma.idTurmaEnsino" :value="turma.idTurmaEnsino">
                    {{ turma.nome }} - {{ turma.codigo }}
                  </option>
                </select>
              </label>
            </div>

            <label class="grid gap-1.5 text-sm font-extrabold text-[#071d3b]">
              <span>Aluno</span>
              <select
                v-model.number="lancamentoForm.idAlunoUsuario"
                class="min-h-10 rounded-md border border-[#ccd8e5] bg-white px-3 text-sm text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
                required
                :disabled="!lancamentoForm.idTurmaEnsino || !alunosDisponiveis.length"
              >
                <option :value="0">Selecione</option>
                <option v-for="aluno in alunosDisponiveis" :key="aluno.idUsuario" :value="aluno.idUsuario">
                  {{ aluno.nome }} - {{ aluno.email }}
                </option>
              </select>
            </label>

            <label class="grid gap-1.5 text-sm font-extrabold text-[#071d3b]">
              <span>Disciplina</span>
              <select
                v-model.number="lancamentoForm.idDisciplina"
                class="min-h-10 rounded-md border border-[#ccd8e5] bg-white px-3 text-sm text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
                required
                :disabled="!areasLancamento.length && !disciplinasProfessorLancamento.length"
              >
                <option :value="0">Selecione</option>
                <optgroup v-for="area in areasLancamento" :key="area.idAreaConhecimento" :label="area.nome">
                  <option v-for="disciplina in area.disciplinas" :key="disciplina.idDisciplina" :value="disciplina.idDisciplina">
                    {{ disciplina.nome }}
                  </option>
                </optgroup>
                <optgroup v-if="disciplinasProfessorLancamento.length" label="Minhas disciplinas">
                  <option v-for="disciplina in disciplinasProfessorLancamento" :key="disciplina.idDisciplina" :value="disciplina.idDisciplina">
                    {{ disciplina.nome }}
                  </option>
                </optgroup>
              </select>
            </label>

            <div v-if="disciplinaLancamentoSelecionada" class="flex flex-wrap gap-2 rounded-md border border-[#d4dee9] bg-[#f8fbfd]/95 p-2 text-xs font-semibold text-[#243044]">
              <span><strong>Area:</strong> {{ disciplinaLancamentoSelecionada.nomeAreaConhecimento || '-' }}</span>
              <span><strong>Turma:</strong> {{ disciplinaLancamentoSelecionada.nomeTurmaEnsino || turmaLancamentoSelecionada?.nome || '-' }}</span>
              <span><strong>Oferta:</strong> {{ disciplinaLancamentoSelecionada.matriculaFacultativa ? 'Facultativa' : 'Obrigatoria' }}</span>
            </div>

            <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <label v-for="(_, index) in lancamentoForm.notas" :key="index" class="grid gap-1.5 text-sm font-extrabold text-[#071d3b]">
                <span>Nota {{ index + 1 }}</span>
                <input
                  v-model="lancamentoForm.notas[index]"
                  class="min-h-10 rounded-md border border-[#ccd8e5] bg-white px-2 text-sm text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                />
              </label>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <label class="grid gap-1.5 text-sm font-extrabold text-[#071d3b]">
                <span>Presencas</span>
                <input
                  v-model.number="lancamentoForm.presencas"
                  class="min-h-10 rounded-md border border-[#ccd8e5] bg-white px-3 text-sm text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
                  type="number"
                  min="0"
                  required
                />
              </label>
              <label class="grid gap-1.5 text-sm font-extrabold text-[#071d3b]">
                <span>Faltas</span>
                <input
                  v-model.number="lancamentoForm.faltas"
                  class="min-h-10 rounded-md border border-[#ccd8e5] bg-white px-3 text-sm text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
                  type="number"
                  min="0"
                  required
                />
              </label>
            </div>

            <p v-if="erroLancamento" class="alert alert-error">{{ erroLancamento }}</p>
            <p v-if="mensagemLancamento" class="alert alert-success">{{ mensagemLancamento }}</p>

            <div class="grid gap-2 sm:grid-cols-[1fr_auto]">
              <button
                ref="salvarLancamentoButton"
                class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#147f72] px-4 text-sm font-extrabold text-white transition hover:bg-[#0f6c61] disabled:cursor-wait disabled:opacity-70"
                type="button"
                :disabled="salvandoLancamento"
                @click.prevent.stop="salvarLancamento"
              >
                <ClipboardCheck class="h-5 w-5" aria-hidden="true" />
                {{ editandoLancamentoId ? 'Atualizar lancamento' : 'Salvar lancamento' }}
              </button>
              <button
                v-if="editandoLancamentoId"
                class="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d4dee9] bg-white px-4 text-sm font-extrabold text-[#51627a] transition hover:bg-[#edf3f8]"
                type="button"
                @click="limparLancamentoForm"
              >
                Cancelar edicao
              </button>
            </div>
          </div>
        </div>
      </div>

      <aside
        v-else
        class="rounded-lg border border-[#d4dee9] bg-white/95 p-4 shadow-[0_22px_55px_rgba(14,30,53,0.08)] backdrop-blur-sm sm:p-6"
      >
        <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">Consulta</p>
        <h2 class="mb-3 mt-2 text-xl font-normal text-[#071d3b]">Caderneta Digital</h2>
        <p class="m-0 text-sm font-semibold text-[#62728a]">{{ textoPermissao }}</p>
      </aside>

      <article class="min-w-0 rounded-lg border border-[#d4dee9] bg-white/95 p-4 shadow-[0_22px_55px_rgba(14,30,53,0.08)] backdrop-blur-sm">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">{{ lancamentosVisiveis.length }} registro(s)</p>
            <h2 class="m-0 mt-2 text-xl font-normal text-[#071d3b]">Caderneta Digital</h2>
          </div>
          <button
            class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] transition hover:bg-[#dfe8f1]"
            type="button"
            title="Atualizar dados"
            aria-label="Atualizar dados"
            @click="carregarDados"
          >
            <RefreshCcw class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div class="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_180px_160px_210px]">
          <div class="relative">
            <Search class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#62728a]" aria-hidden="true" />
            <input
              v-model.trim="busca"
              class="min-h-11 rounded-md border border-[#ccd8e5] bg-white pl-12 pr-3 text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
              type="search"
              placeholder="Consultar caderneta"
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
            <option v-for="turma in turmasFiltroDisponiveis" :key="turma.idTurmaEnsino" :value="turma.idTurmaEnsino">
              {{ turma.nome }}
            </option>
          </select>

          <select
            v-model.number="disciplinaFiltro"
            class="min-h-11 rounded-md border border-[#ccd8e5] bg-white px-3 text-[#071d3b] outline-none focus:border-[#147f72] focus:ring-4 focus:ring-[#147f72]/10"
            aria-label="Filtrar por disciplina"
          >
            <option :value="0">Todas as disciplinas</option>
            <option v-for="disciplina in disciplinasFiltroDisponiveis" :key="disciplina.idDisciplina" :value="disciplina.idDisciplina">
              {{ disciplina.nome }}{{ disciplina.nomeTurmaEnsino ? ` - ${disciplina.nomeTurmaEnsino}` : '' }}
            </option>
          </select>
        </div>

        <p v-if="erroLista" class="alert alert-error mt-4">{{ erroLista }}</p>
        <p v-if="!carregando && auth.isAluno && !lancamentosVisiveis.length" class="alert alert-warning mt-4">
          Nenhuma disciplina associada ao seu cadastro.
        </p>

        <div class="mt-4 hidden max-h-[calc(100vh-390px)] min-h-[320px] overflow-auto rounded-lg border border-[#d4dee9] md:block">
          <div
            class="grid min-w-[980px] items-center gap-3 bg-[#f5f8fb] px-4 py-3 text-xs font-extrabold uppercase text-[#51627a]"
            :style="{ gridTemplateColumns: gradeCadernetaTemplate }"
          >
            <span>Aluno</span>
            <span>Ensino / Turma</span>
            <span>Disciplina</span>
            <span class="text-center">Aprendizado</span>
            <span>Frequencia</span>
            <span v-if="podeAdministrar" class="text-center">Acoes</span>
          </div>

          <article
            v-for="lancamento in lancamentosFiltrados"
            :key="lancamento.idCadernetaDigital"
            class="grid min-w-[980px] items-center gap-3 border-t border-[#d4dee9] px-4 py-4 text-sm"
            :style="{ gridTemplateColumns: gradeCadernetaTemplate }"
          >
            <div class="min-w-0">
              <strong class="block truncate text-[#243044]">{{ lancamento.nomeAluno }}</strong>
              <span class="mt-1 block break-all text-xs font-semibold text-[#51627a]">{{ lancamento.emailAluno }}</span>
            </div>
            <div class="min-w-0">
              <strong class="block truncate text-[#243044]">{{ lancamento.nomeTipoEnsino || 'Tipo nao informado' }}</strong>
              <span class="mt-1 block truncate text-xs font-semibold text-[#51627a]">{{ lancamento.nomeTurmaEnsino || 'Turma nao informada' }}</span>
            </div>
            <div class="min-w-0">
              <strong class="block break-words text-[#243044]">{{ lancamento.nomeDisciplina }}</strong>
              <span v-if="lancamento.nomeAreaConhecimento" class="mt-1 block text-xs font-semibold text-[#51627a]">{{ lancamento.nomeAreaConhecimento }}</span>
              <span v-if="lancamento.nomeProfessor" class="mt-1 block truncate text-xs font-semibold text-[#7a8798]">Prof. {{ lancamento.nomeProfessor }}</span>
            </div>
            <div class="flex justify-center">
              <button
                class="group relative inline-flex h-10 w-10 items-center justify-center rounded-md border transition focus:outline-none focus:ring-4"
                :class="aprendizadoSituacaoVisual(lancamento).buttonClass"
                type="button"
                :title="aprendizadoSituacaoTooltip(lancamento)"
                :aria-label="aprendizadoSituacaoTooltip(lancamento)"
                @click="abrirAprendizado(lancamento)"
              >
                <component :is="aprendizadoSituacaoVisual(lancamento).icon" class="h-5 w-5" aria-hidden="true" />
                <span
                  class="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-extrabold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100"
                  :class="aprendizadoSituacaoVisual(lancamento).tooltipClass"
                >
                  {{ aprendizadoSituacaoTooltip(lancamento) }}
                </span>
              </button>
            </div>
            <span class="text-[#243044]">
              <strong>{{ lancamento.presencas }}</strong> presencas<br />
              <strong>{{ lancamento.faltas }}</strong> faltas
            </span>
            <div v-if="podeAdministrar" class="flex justify-center gap-2">
              <button
                class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] transition hover:bg-[#dfe8f1]"
                type="button"
                title="Editar lancamento"
                aria-label="Editar lancamento"
                @click="editarLancamento(lancamento)"
              >
                <Pencil class="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#ffe1e3] text-[#dc2626] transition hover:bg-[#ffd4d7]"
                type="button"
                title="Excluir lancamento"
                aria-label="Excluir lancamento"
                @click="excluirLancamento(lancamento)"
              >
                <Trash2 class="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </article>

          <p v-if="!carregando && !lancamentosFiltrados.length" class="m-0 min-w-[980px] border-t border-[#d4dee9] px-4 py-6 text-[#62728a]">
            Nenhum registro encontrado.
          </p>
          <p v-if="carregando" class="m-0 min-w-[980px] border-t border-[#d4dee9] px-4 py-6 text-[#62728a]">
            Carregando caderneta...
          </p>
        </div>

        <div class="mt-4 grid gap-3 md:hidden">
          <article
            v-for="lancamento in lancamentosFiltrados"
            :key="lancamento.idCadernetaDigital"
            class="rounded-lg border border-[#d4dee9] bg-white p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="m-0 truncate text-base font-extrabold text-[#071d3b]">{{ lancamento.nomeAluno }}</h3>
                <p class="m-0 mt-1 break-all text-sm text-[#51627a]">{{ lancamento.emailAluno }}</p>
              </div>
              <span class="rounded-md bg-[#eaf4f1] px-2 py-1 text-xs font-extrabold text-[#006b61]">
                {{ lancamento.nomeDisciplina }}
              </span>
            </div>
            <div class="mt-3 grid gap-2 text-sm text-[#243044]">
              <span><strong>Tipo:</strong> {{ lancamento.nomeTipoEnsino || 'Tipo nao informado' }}</span>
              <span><strong>Turma:</strong> {{ lancamento.nomeTurmaEnsino || 'Turma nao informada' }}</span>
              <span v-if="lancamento.nomeAreaConhecimento"><strong>Area:</strong> {{ lancamento.nomeAreaConhecimento }}</span>
              <button
                class="group relative inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-extrabold transition focus:outline-none focus:ring-4"
                :class="aprendizadoSituacaoVisual(lancamento).buttonClass"
                type="button"
                :title="aprendizadoSituacaoTooltip(lancamento)"
                :aria-label="aprendizadoSituacaoTooltip(lancamento)"
                @click="abrirAprendizado(lancamento)"
              >
                <component :is="aprendizadoSituacaoVisual(lancamento).icon" class="h-5 w-5" aria-hidden="true" />
                Aprendizado
                <span
                  class="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-extrabold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100"
                  :class="aprendizadoSituacaoVisual(lancamento).tooltipClass"
                >
                  {{ aprendizadoSituacaoTooltip(lancamento) }}
                </span>
              </button>
              <span><strong>Presencas:</strong> {{ lancamento.presencas }}</span>
              <span><strong>Faltas:</strong> {{ lancamento.faltas }}</span>
            </div>
            <div v-if="podeAdministrar" class="mt-4 flex flex-wrap gap-2">
              <button
                class="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] transition hover:bg-[#dfe8f1]"
                type="button"
                title="Editar lancamento"
                aria-label="Editar lancamento"
                @click="editarLancamento(lancamento)"
              >
                <Pencil class="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                class="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-[#ffe1e3] text-[#dc2626] transition hover:bg-[#ffd4d7]"
                type="button"
                title="Excluir lancamento"
                aria-label="Excluir lancamento"
                @click="excluirLancamento(lancamento)"
              >
                <Trash2 class="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </article>

          <p v-if="!carregando && !lancamentosFiltrados.length" class="m-0 rounded-lg border border-[#d4dee9] bg-white p-4 text-[#62728a]">
            Nenhum registro encontrado.
          </p>
          <p v-if="carregando" class="m-0 rounded-lg border border-[#d4dee9] bg-white p-4 text-[#62728a]">
            Carregando caderneta...
          </p>
        </div>
      </article>
    </div>

    <div
      v-if="lancamentoAprendizadoPopup"
      class="fixed inset-0 z-40 grid place-items-center bg-[#071d3b]/50 px-4 py-6"
      @click.self="fecharAprendizado"
    >
      <article class="grid w-full max-w-lg gap-4 rounded-lg bg-white p-5 shadow-[0_22px_55px_rgba(14,30,53,0.24)]">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="m-0 text-xs font-extrabold uppercase text-[#d64200]">Aprendizado</p>
            <h2 class="m-0 mt-1 break-words text-xl font-normal text-[#071d3b]">{{ lancamentoAprendizadoPopup.nomeAluno }}</h2>
            <p class="m-0 mt-1 break-words text-sm font-semibold text-[#62728a]">{{ lancamentoAprendizadoPopup.nomeDisciplina }}</p>
            <p class="m-0 mt-1 break-words text-xs font-semibold text-[#7a8798]">
              {{ formatarContextoEnsino(lancamentoAprendizadoPopup) }}
            </p>
          </div>
          <button
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#edf3f8] text-[#071d3b] transition hover:bg-[#dfe8f1]"
            type="button"
            title="Fechar"
            aria-label="Fechar"
            @click="fecharAprendizado"
          >
            <X class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div class="grid gap-3">
          <div class="rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-4">
            <span class="text-xs font-extrabold uppercase text-[#62728a]">Notas</span>
            <strong class="mt-2 block break-words text-[#071d3b]">{{ formatNotas(lancamentoAprendizadoPopup.notas) }}</strong>
          </div>
          <div class="rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-4">
            <span class="text-xs font-extrabold uppercase text-[#62728a]">Estrutura</span>
            <strong class="mt-2 block break-words text-[#071d3b]">{{ formatarContextoEnsino(lancamentoAprendizadoPopup) }}</strong>
            <span v-if="lancamentoAprendizadoPopup.nomeAreaConhecimento" class="mt-1 block text-sm font-semibold text-[#51627a]">
              {{ lancamentoAprendizadoPopup.nomeAreaConhecimento }}
            </span>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-4">
              <span class="text-xs font-extrabold uppercase text-[#62728a]">Media</span>
              <strong class="mt-2 block text-[#071d3b]">{{ formatarMediaLancamento(lancamentoAprendizadoPopup.mediaAritmetica) }}</strong>
            </div>
            <div class="rounded-md border border-[#d4dee9] bg-[#f8fbfd] p-4">
              <span class="text-xs font-extrabold uppercase text-[#62728a]">Situacao</span>
              <strong class="mt-2 block" :class="situacaoCadernetaClass(lancamentoAprendizadoPopup)">
                {{ lancamentoAprendizadoPopup.situacao }}
              </strong>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { CircleCheck, CircleX, ClipboardCheck, GraduationCap, Pencil, RefreshCcw, Search, Trash2, TriangleAlert, X } from '@lucide/vue'
import type {
  AlunoTurmaEnsino,
  AreaConhecimentoCurricular,
  CadernetaDigitalPayload,
  CadernetaDigitalSummary,
  DisciplinaCaderneta,
  DisciplinaCadernetaPayload,
  DisciplinaCurricular,
  TipoEnsinoCurricular,
  TurmaEnsinoCurricular,
  UsuarioSummary
} from '~/types/api'
import { normalizeApiError } from '~/utils/api-client'
import {
  parseCadernetaNotas,
  type CadernetaNotaInput
} from '~/utils/caderneta-digital'
import { isPerfilAluno } from '~/utils/usuario-permissions'

definePageMeta({
  roles: []
})

const EMPTY_NOTAS: CadernetaNotaInput[] = ['', '', '', '']

interface DisciplinaOpcao {
  idDisciplina: number
  nome: string
  idTipoEnsino?: number | null
  nomeTipoEnsino?: string | null
  idTurmaEnsino?: number | null
  nomeTurmaEnsino?: string | null
  idAreaConhecimento?: number | null
  nomeAreaConhecimento?: string | null
  observacao?: string | null
  ofertaObrigatoria: boolean
  matriculaFacultativa: boolean
  ordem?: number
}

const auth = useAuthStore()
const { $api } = useNuxtApp()
const usuarios = ref<UsuarioSummary[]>([])
const matriculasTurmas = ref<AlunoTurmaEnsino[]>([])
const disciplinas = ref<DisciplinaCaderneta[]>([])
const estruturaEnsino = ref<TipoEnsinoCurricular[]>([])
const lancamentos = ref<CadernetaDigitalSummary[]>([])
const carregando = ref(false)
const carregandoEstrutura = ref(false)
const salvandoDisciplina = ref(false)
const salvandoLancamento = ref(false)
const erroLista = ref('')
const erroEstrutura = ref('')
const erroDisciplina = ref('')
const erroLancamento = ref('')
const mensagemLancamento = ref('')
const busca = ref('')
const tipoEnsinoFiltro = ref(0)
const turmaEnsinoFiltro = ref(0)
const disciplinaFiltro = ref(0)
const estruturaTipoEnsinoId = ref(0)
const estruturaTurmaEnsinoId = ref(0)
const editandoDisciplinaId = ref<number | null>(null)
const editandoLancamentoId = ref<number | null>(null)
const salvarLancamentoButton = ref<HTMLButtonElement | null>(null)
const lancamentoAprendizadoPopup = ref<CadernetaDigitalSummary | null>(null)
const disciplinaForm = reactive({
  nome: ''
})
const lancamentoForm = reactive({
  idAlunoUsuario: 0,
  idTipoEnsino: 0,
  idTurmaEnsino: 0,
  idDisciplina: 0,
  notas: [...EMPTY_NOTAS],
  presencas: 0,
  faltas: 0
})

const podeAdministrar = computed(() => auth.isProfessor)
const gradeCadernetaTemplate = computed(() =>
  podeAdministrar.value
    ? 'minmax(150px,1.15fr) minmax(130px,0.9fr) minmax(170px,1.15fr) 110px minmax(95px,0.65fr) 88px'
    : 'minmax(150px,1.2fr) minmax(130px,0.95fr) minmax(170px,1.15fr) 110px minmax(95px,0.7fr)'
)
const alunosDisponiveis = computed(() => {
  const alunosTurmaIds = new Set(matriculasTurmas.value
    .filter((matricula) => matricula.idTurmaEnsino === lancamentoForm.idTurmaEnsino)
    .map((matricula) => matricula.idAlunoUsuario))

  return usuarios.value.filter((usuario) =>
    isPerfilAluno(usuario.descricaoPerfil)
    && alunosTurmaIds.has(usuario.idUsuario)
  )
})
const estruturaTipoSelecionado = computed(() =>
  estruturaEnsino.value.find((tipo) => tipo.idTipoEnsino === estruturaTipoEnsinoId.value) ?? null
)
const estruturaTurmasSelecionadas = computed(() => estruturaTipoSelecionado.value?.turmas ?? [])
const estruturaTurmaSelecionada = computed(() =>
  estruturaTurmasSelecionadas.value.find((turma) => turma.idTurmaEnsino === estruturaTurmaEnsinoId.value) ?? null
)
const estruturaAreasSelecionadas = computed(() => estruturaTurmaSelecionada.value?.areasConhecimento ?? [])
const totalTurmasEstruturaSelecionada = computed(() => estruturaTipoSelecionado.value?.turmas.length ?? 0)
const totalDisciplinasEstruturaSelecionada = computed(() =>
  estruturaAreasSelecionadas.value.reduce((total, area) => total + area.disciplinas.length, 0)
)
const tipoLancamentoSelecionado = computed(() =>
  estruturaEnsino.value.find((tipo) => tipo.idTipoEnsino === lancamentoForm.idTipoEnsino) ?? null
)
const turmasLancamento = computed(() => tipoLancamentoSelecionado.value?.turmas ?? [])
const turmaLancamentoSelecionada = computed(() =>
  turmasLancamento.value.find((turma) => turma.idTurmaEnsino === lancamentoForm.idTurmaEnsino) ?? null
)
const areasLancamento = computed(() => turmaLancamentoSelecionada.value?.areasConhecimento ?? [])
const disciplinasEstrutura = computed<DisciplinaOpcao[]>(() => flattenDisciplinasEstrutura(estruturaEnsino.value))
const disciplinasProfessorOpcoes = computed<DisciplinaOpcao[]>(() =>
  disciplinas.value.map((disciplina) => ({
    idDisciplina: disciplina.idDisciplina,
    nome: disciplina.nome,
    idTipoEnsino: disciplina.idTipoEnsino,
    nomeTipoEnsino: disciplina.nomeTipoEnsino,
    idTurmaEnsino: disciplina.idTurmaEnsino,
    nomeTurmaEnsino: disciplina.nomeTurmaEnsino,
    idAreaConhecimento: disciplina.idAreaConhecimento,
    nomeAreaConhecimento: disciplina.nomeAreaConhecimento,
    observacao: disciplina.observacao,
    ofertaObrigatoria: disciplina.ofertaObrigatoria ?? true,
    matriculaFacultativa: disciplina.matriculaFacultativa ?? false,
    ordem: disciplina.ordem
  }))
)
const disciplinasDisponiveis = computed(() =>
  dedupeDisciplinas([...disciplinasEstrutura.value, ...disciplinasProfessorOpcoes.value])
)
const disciplinasProfessorLancamento = computed(() =>
  disciplinasProfessorOpcoes.value.filter((disciplina) =>
    disciplina.idTurmaEnsino === lancamentoForm.idTurmaEnsino
    && !areasLancamento.value.some((area) => area.disciplinas.some((item) => item.idDisciplina === disciplina.idDisciplina))
  )
)
const disciplinaLancamentoSelecionada = computed(() =>
  disciplinasDisponiveis.value.find((disciplina) => disciplina.idDisciplina === lancamentoForm.idDisciplina) ?? null
)
const lancamentosVisiveis = computed(() => {
  if (auth.isAluno) {
    return lancamentos.value.filter((lancamento) => lancamento.idAlunoUsuario === auth.usuario?.idUsuario)
  }

  return lancamentos.value
})
const turmasFiltroDisponiveis = computed(() => {
  const tipos = tipoEnsinoFiltro.value
    ? estruturaEnsino.value.filter((tipo) => tipo.idTipoEnsino === tipoEnsinoFiltro.value)
    : estruturaEnsino.value

  return tipos.flatMap((tipo) => tipo.turmas)
})
const disciplinasFiltroDisponiveis = computed(() =>
  disciplinasDisponiveis.value.filter((disciplina) =>
    (!tipoEnsinoFiltro.value || disciplina.idTipoEnsino === tipoEnsinoFiltro.value)
    && (!turmaEnsinoFiltro.value || disciplina.idTurmaEnsino === turmaEnsinoFiltro.value)
  )
)
const lancamentosFiltrados = computed(() => {
  const termo = busca.value.toLowerCase()
  const lancamentosFiltradosPorEstrutura = lancamentosVisiveis.value.filter((lancamento) =>
    (!tipoEnsinoFiltro.value || lancamento.idTipoEnsino === tipoEnsinoFiltro.value)
    && (!turmaEnsinoFiltro.value || lancamento.idTurmaEnsino === turmaEnsinoFiltro.value)
    && (!disciplinaFiltro.value || lancamento.idDisciplina === disciplinaFiltro.value)
  )

  if (!termo) return lancamentosFiltradosPorEstrutura

  return lancamentosFiltradosPorEstrutura.filter((lancamento) =>
    [
      lancamento.nomeAluno,
      lancamento.emailAluno,
      lancamento.nomeTipoEnsino,
      lancamento.nomeTurmaEnsino,
      lancamento.nomeDisciplina,
      lancamento.nomeAreaConhecimento,
      lancamento.nomeProfessor,
      formatNotas(lancamento.notas),
      formatarMediaLancamento(lancamento.mediaAritmetica),
      lancamento.situacao
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(termo))
  )
})
const textoPermissao = computed(() => {
  if (auth.isAluno) return 'Seu perfil permite visualizar apenas disciplinas associadas ao seu cadastro.'
  if (auth.isAdmin) return 'Seu perfil permite visualizar todos os registros da caderneta.'

  return 'Seu perfil permite visualizar a caderneta.'
})

watch(estruturaEnsino, () => {
  preencherSelecaoEstruturaPadrao()
  preencherLancamentoPadrao()
})

watch(estruturaTipoEnsinoId, () => {
  if (!estruturaTurmasSelecionadas.value.some((turma) => turma.idTurmaEnsino === estruturaTurmaEnsinoId.value)) {
    estruturaTurmaEnsinoId.value = estruturaTurmasSelecionadas.value[0]?.idTurmaEnsino ?? 0
  }
})

watch(() => lancamentoForm.idTipoEnsino, () => {
  if (!turmasLancamento.value.some((turma) => turma.idTurmaEnsino === lancamentoForm.idTurmaEnsino)) {
    lancamentoForm.idTurmaEnsino = turmasLancamento.value[0]?.idTurmaEnsino ?? 0
  }

  if (!lancamentoForm.idDisciplina || !disciplinaPertenceAoLancamento(lancamentoForm.idDisciplina)) {
    lancamentoForm.idDisciplina = primeiraDisciplinaLancamento()?.idDisciplina ?? 0
  }
})

watch(() => lancamentoForm.idTurmaEnsino, () => {
  if (!lancamentoForm.idDisciplina || !disciplinaPertenceAoLancamento(lancamentoForm.idDisciplina)) {
    lancamentoForm.idDisciplina = primeiraDisciplinaLancamento()?.idDisciplina ?? 0
  }

  if (lancamentoForm.idAlunoUsuario && !alunoPertenceATurmaLancamento(lancamentoForm.idAlunoUsuario)) {
    lancamentoForm.idAlunoUsuario = 0
  }
})

watch(matriculasTurmas, () => {
  if (lancamentoForm.idAlunoUsuario && !alunoPertenceATurmaLancamento(lancamentoForm.idAlunoUsuario)) {
    lancamentoForm.idAlunoUsuario = 0
  }
})

watch(tipoEnsinoFiltro, () => {
  if (turmaEnsinoFiltro.value && !turmasFiltroDisponiveis.value.some((turma) => turma.idTurmaEnsino === turmaEnsinoFiltro.value)) {
    turmaEnsinoFiltro.value = 0
  }

  if (disciplinaFiltro.value && !disciplinasFiltroDisponiveis.value.some((disciplina) => disciplina.idDisciplina === disciplinaFiltro.value)) {
    disciplinaFiltro.value = 0
  }
})

watch(turmaEnsinoFiltro, () => {
  if (disciplinaFiltro.value && !disciplinasFiltroDisponiveis.value.some((disciplina) => disciplina.idDisciplina === disciplinaFiltro.value)) {
    disciplinaFiltro.value = 0
  }
})

onMounted(async () => {
  instalarEventoNativoLancamento()
  await carregarDados()
})

onBeforeUnmount(() => {
  removerEventoNativoLancamento()
})

async function carregarDados() {
  carregando.value = true
  erroLista.value = ''

  try {
    await Promise.all([
      carregarEstruturaEnsino(),
      carregarDisciplinas(),
      carregarLancamentos(),
      podeAdministrar.value ? carregarUsuarios() : Promise.resolve(),
      podeAdministrar.value ? carregarMatriculasTurmas() : Promise.resolve()
    ])
  } catch (err) {
    erroLista.value = normalizeApiError(err)
  } finally {
    carregando.value = false
  }
}

async function carregarEstruturaEnsino() {
  carregandoEstrutura.value = true
  erroEstrutura.value = ''

  try {
    estruturaEnsino.value = await $api<TipoEnsinoCurricular[]>('/caderneta-digital/estrutura-ensino')
    preencherSelecaoEstruturaPadrao()
    preencherLancamentoPadrao()
  } catch (err) {
    estruturaEnsino.value = []
    erroEstrutura.value = normalizeApiError(err)
  } finally {
    carregandoEstrutura.value = false
  }
}

async function carregarDisciplinas() {
  disciplinas.value = await $api<DisciplinaCaderneta[]>('/caderneta-digital/disciplinas')
}

async function carregarLancamentos() {
  lancamentos.value = await $api<CadernetaDigitalSummary[]>('/caderneta-digital')
}

async function carregarUsuarios() {
  usuarios.value = await $api<UsuarioSummary[]>('/usuarios')
}

async function carregarMatriculasTurmas() {
  matriculasTurmas.value = await $api<AlunoTurmaEnsino[]>('/alunos-turmas')
}

async function salvarDisciplina() {
  erroDisciplina.value = ''
  const nome = disciplinaForm.nome.trim()

  if (!nome) {
    erroDisciplina.value = 'Informe o nome da disciplina.'
    return
  }

  salvandoDisciplina.value = true
  const payload: DisciplinaCadernetaPayload = { nome }

  try {
    if (editandoDisciplinaId.value) {
      await $api<DisciplinaCaderneta>(`/caderneta-digital/disciplinas/${editandoDisciplinaId.value}`, {
        method: 'PUT',
        body: payload
      })
    } else {
      await $api<DisciplinaCaderneta>('/caderneta-digital/disciplinas', {
        method: 'POST',
        body: payload
      })
    }

    limparDisciplinaForm()
    await Promise.all([carregarDisciplinas(), carregarLancamentos()])
  } catch (err) {
    erroDisciplina.value = normalizeApiError(err)
  } finally {
    salvandoDisciplina.value = false
  }
}

function editarDisciplina(disciplina: DisciplinaCaderneta) {
  editandoDisciplinaId.value = disciplina.idDisciplina
  disciplinaForm.nome = disciplina.nome
  erroDisciplina.value = ''
}

async function excluirDisciplina(disciplina: DisciplinaCaderneta) {
  if (!confirm(`Excluir a disciplina ${disciplina.nome}?`)) {
    return
  }

  erroDisciplina.value = ''

  try {
    await $api(`/caderneta-digital/disciplinas/${disciplina.idDisciplina}`, { method: 'DELETE' })
    if (editandoDisciplinaId.value === disciplina.idDisciplina) limparDisciplinaForm()
    if (lancamentoForm.idDisciplina === disciplina.idDisciplina) lancamentoForm.idDisciplina = 0
    await Promise.all([carregarDisciplinas(), carregarLancamentos()])
  } catch (err) {
    erroDisciplina.value = normalizeApiError(err)
  }
}

function limparDisciplinaForm() {
  editandoDisciplinaId.value = null
  disciplinaForm.nome = ''
}

async function salvarLancamento() {
  if (salvandoLancamento.value) return

  erroLancamento.value = ''
  mensagemLancamento.value = ''
  const notas = parseCadernetaNotas(lancamentoForm.notas)

  if (!lancamentoForm.idAlunoUsuario || !lancamentoForm.idTipoEnsino || !lancamentoForm.idTurmaEnsino || !lancamentoForm.idDisciplina) {
    erroLancamento.value = 'Informe aluno, tipo do ensino, turma e disciplina.'
    return
  }

  if (!alunoPertenceATurmaLancamento(lancamentoForm.idAlunoUsuario)) {
    erroLancamento.value = 'Aluno nao matriculado na turma selecionada.'
    return
  }

  if (!notas) {
    erroLancamento.value = 'Informe ao menos uma nota entre 0 e 10.'
    return
  }

  if (!Number.isInteger(lancamentoForm.presencas) || !Number.isInteger(lancamentoForm.faltas) || lancamentoForm.presencas < 0 || lancamentoForm.faltas < 0) {
    erroLancamento.value = 'Presencas e faltas devem ser numeros inteiros positivos.'
    return
  }

  salvandoLancamento.value = true
  const payload: CadernetaDigitalPayload = {
    idAlunoUsuario: lancamentoForm.idAlunoUsuario,
    idTipoEnsino: lancamentoForm.idTipoEnsino,
    idTurmaEnsino: lancamentoForm.idTurmaEnsino,
    idDisciplina: lancamentoForm.idDisciplina,
    notas,
    presencas: lancamentoForm.presencas,
    faltas: lancamentoForm.faltas
  }

  try {
    if (editandoLancamentoId.value) {
      await $api<CadernetaDigitalSummary>(`/caderneta-digital/${editandoLancamentoId.value}`, {
        method: 'PUT',
        body: payload
      })
    } else {
      await $api<CadernetaDigitalSummary>('/caderneta-digital', {
        method: 'POST',
        body: payload
      })
    }

    limparLancamentoForm()
    mensagemLancamento.value = 'Lancamento salvo com sucesso.'
    await carregarLancamentos()
  } catch (err) {
    erroLancamento.value = normalizeApiError(err)
  } finally {
    salvandoLancamento.value = false
  }
}

function editarLancamento(lancamento: CadernetaDigitalSummary) {
  if (!podeAdministrar.value) return

  editandoLancamentoId.value = lancamento.idCadernetaDigital
  const disciplina = obterDisciplinaOpcao(lancamento.idDisciplina)
  lancamentoForm.idAlunoUsuario = lancamento.idAlunoUsuario
  lancamentoForm.idTipoEnsino = lancamento.idTipoEnsino ?? disciplina?.idTipoEnsino ?? 0
  lancamentoForm.idTurmaEnsino = lancamento.idTurmaEnsino ?? disciplina?.idTurmaEnsino ?? 0
  lancamentoForm.idDisciplina = lancamento.idDisciplina
  lancamentoForm.notas = [...lancamento.notas.map((nota) => String(nota)), ...EMPTY_NOTAS].slice(0, EMPTY_NOTAS.length)
  lancamentoForm.presencas = lancamento.presencas
  lancamentoForm.faltas = lancamento.faltas
  if (lancamentoForm.idTipoEnsino) estruturaTipoEnsinoId.value = lancamentoForm.idTipoEnsino
  if (lancamentoForm.idTurmaEnsino) estruturaTurmaEnsinoId.value = lancamentoForm.idTurmaEnsino
  erroLancamento.value = ''
}

async function excluirLancamento(lancamento: CadernetaDigitalSummary) {
  if (!podeAdministrar.value || !confirm(`Excluir o lancamento de ${lancamento.nomeAluno} em ${lancamento.nomeDisciplina}?`)) {
    return
  }

  erroLista.value = ''

  try {
    await $api(`/caderneta-digital/${lancamento.idCadernetaDigital}`, { method: 'DELETE' })
    if (editandoLancamentoId.value === lancamento.idCadernetaDigital) limparLancamentoForm()
    await carregarLancamentos()
  } catch (err) {
    erroLista.value = normalizeApiError(err)
  }
}

function limparLancamentoForm() {
  editandoLancamentoId.value = null
  lancamentoForm.idAlunoUsuario = 0
  lancamentoForm.idTipoEnsino = 0
  lancamentoForm.idTurmaEnsino = 0
  lancamentoForm.idDisciplina = 0
  lancamentoForm.notas = [...EMPTY_NOTAS]
  lancamentoForm.presencas = 0
  lancamentoForm.faltas = 0
  erroLancamento.value = ''
  preencherLancamentoPadrao()
}

function preencherSelecaoEstruturaPadrao() {
  if (!estruturaEnsino.value.length) {
    estruturaTipoEnsinoId.value = 0
    estruturaTurmaEnsinoId.value = 0
    return
  }

  if (!estruturaEnsino.value.some((tipo) => tipo.idTipoEnsino === estruturaTipoEnsinoId.value)) {
    estruturaTipoEnsinoId.value = estruturaEnsino.value[0].idTipoEnsino
  }

  if (!estruturaTurmasSelecionadas.value.some((turma) => turma.idTurmaEnsino === estruturaTurmaEnsinoId.value)) {
    estruturaTurmaEnsinoId.value = estruturaTurmasSelecionadas.value[0]?.idTurmaEnsino ?? 0
  }
}

function preencherLancamentoPadrao() {
  if (!estruturaEnsino.value.length) {
    lancamentoForm.idTipoEnsino = 0
    lancamentoForm.idTurmaEnsino = 0
    lancamentoForm.idDisciplina = 0
    return
  }

  if (!estruturaEnsino.value.some((tipo) => tipo.idTipoEnsino === lancamentoForm.idTipoEnsino)) {
    lancamentoForm.idTipoEnsino = estruturaEnsino.value[0].idTipoEnsino
  }

  if (!turmasLancamento.value.some((turma) => turma.idTurmaEnsino === lancamentoForm.idTurmaEnsino)) {
    lancamentoForm.idTurmaEnsino = turmasLancamento.value[0]?.idTurmaEnsino ?? 0
  }

  if (!lancamentoForm.idDisciplina || !disciplinaPertenceAoLancamento(lancamentoForm.idDisciplina)) {
    lancamentoForm.idDisciplina = primeiraDisciplinaLancamento()?.idDisciplina ?? 0
  }
}

function flattenDisciplinasEstrutura(tipos: TipoEnsinoCurricular[]) {
  return tipos.flatMap((tipo) =>
    tipo.turmas.flatMap((turma) =>
      turma.areasConhecimento.flatMap((area) =>
        area.disciplinas.map((disciplina) => mapDisciplinaCurricular(tipo, turma, area, disciplina))
      )
    )
  )
}

function mapDisciplinaCurricular(
  tipo: TipoEnsinoCurricular,
  turma: TurmaEnsinoCurricular,
  area: AreaConhecimentoCurricular,
  disciplina: DisciplinaCurricular
): DisciplinaOpcao {
  return {
    idDisciplina: disciplina.idDisciplina,
    nome: disciplina.nome,
    idTipoEnsino: tipo.idTipoEnsino,
    nomeTipoEnsino: tipo.nome,
    idTurmaEnsino: turma.idTurmaEnsino,
    nomeTurmaEnsino: turma.nome,
    idAreaConhecimento: area.idAreaConhecimento,
    nomeAreaConhecimento: area.nome,
    observacao: disciplina.observacao,
    ofertaObrigatoria: disciplina.ofertaObrigatoria,
    matriculaFacultativa: disciplina.matriculaFacultativa,
    ordem: disciplina.ordem
  }
}

function dedupeDisciplinas(items: DisciplinaOpcao[]) {
  const map = new Map<number, DisciplinaOpcao>()

  for (const item of items) {
    if (!map.has(item.idDisciplina)) {
      map.set(item.idDisciplina, item)
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    (a.idTipoEnsino ?? 0) - (b.idTipoEnsino ?? 0)
    || (a.idTurmaEnsino ?? 0) - (b.idTurmaEnsino ?? 0)
    || (a.idAreaConhecimento ?? 0) - (b.idAreaConhecimento ?? 0)
    || (a.ordem ?? 0) - (b.ordem ?? 0)
    || a.nome.localeCompare(b.nome)
  )
}

function disciplinaPertenceAoLancamento(idDisciplina: number) {
  if (!idDisciplina) return true

  return areasLancamento.value.some((area) =>
    area.disciplinas.some((disciplina) => disciplina.idDisciplina === idDisciplina)
  ) || disciplinasProfessorLancamento.value.some((disciplina) => disciplina.idDisciplina === idDisciplina)
}

function alunoPertenceATurmaLancamento(idAlunoUsuario: number) {
  if (!idAlunoUsuario || !lancamentoForm.idTurmaEnsino) return false

  return matriculasTurmas.value.some((matricula) =>
    matricula.idAlunoUsuario === idAlunoUsuario
    && matricula.idTurmaEnsino === lancamentoForm.idTurmaEnsino
  )
}

function primeiraDisciplinaLancamento() {
  return areasLancamento.value.flatMap((area) => area.disciplinas)[0]
    ?? disciplinasProfessorLancamento.value[0]
    ?? null
}

function obterDisciplinaOpcao(idDisciplina: number) {
  return disciplinasDisponiveis.value.find((disciplina) => disciplina.idDisciplina === idDisciplina)
}

function formatarContextoEnsino(lancamento: CadernetaDigitalSummary) {
  const partes = [lancamento.nomeTipoEnsino, lancamento.nomeTurmaEnsino]
    .filter((parte): parte is string => Boolean(parte))

  return partes.length ? partes.join(' - ') : 'Estrutura nao informada'
}

function salvarLancamentoPorEventoNativo(event: Event) {
  event.preventDefault()
  event.stopPropagation()
  void salvarLancamento()
}

function instalarEventoNativoLancamento() {
  salvarLancamentoButton.value?.addEventListener('click', salvarLancamentoPorEventoNativo)
}

function removerEventoNativoLancamento() {
  salvarLancamentoButton.value?.removeEventListener('click', salvarLancamentoPorEventoNativo)
}

function abrirAprendizado(lancamento: CadernetaDigitalSummary) {
  lancamentoAprendizadoPopup.value = lancamento
}

function fecharAprendizado() {
  lancamentoAprendizadoPopup.value = null
}

function formatNotas(notas: number[]) {
  return notas.length
    ? notas.map((nota) => nota.toLocaleString('pt-BR', { maximumFractionDigits: 1 })).join(' / ')
    : '-'
}

function formatarMediaLancamento(media: number) {
  return Number.isFinite(media)
    ? media.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
    : '-'
}

function situacaoCadernetaClass(lancamento: CadernetaDigitalSummary) {
  const classes: Record<string, string> = {
    azul: 'text-[#1d4ed8]',
    preto: 'text-[#111827]',
    vermelho: 'text-[#dc2626]'
  }

  return classes[lancamento.corSituacao] ?? 'text-[#62728a]'
}

function aprendizadoSituacaoVisual(lancamento: CadernetaDigitalSummary) {
  const situacao = normalizarSituacao(lancamento.situacao)
  const corSituacao = normalizarSituacao(lancamento.corSituacao)

  if (situacao.includes('reprov') || corSituacao === 'vermelho') {
    return {
      icon: CircleX,
      buttonClass: 'border-[#f2b8b5] bg-[#fff1f1] text-[#b42318] hover:bg-[#ffe1e3] focus:ring-[#dc2626]/15',
      tooltipClass: 'bg-[#7f1d1d]'
    }
  }

  if (situacao.includes('recuper')) {
    return {
      icon: TriangleAlert,
      buttonClass: 'border-[#fed7aa] bg-[#fff7ed] text-[#b45309] hover:bg-[#ffedd5] focus:ring-[#f59e0b]/20',
      tooltipClass: 'bg-[#92400e]'
    }
  }

  if (situacao.includes('aprov') || corSituacao === 'azul') {
    return {
      icon: CircleCheck,
      buttonClass: 'border-[#b7e4da] bg-[#eaf4f1] text-[#0f766e] hover:bg-[#d8eee8] focus:ring-[#147f72]/15',
      tooltipClass: 'bg-[#0f766e]'
    }
  }

  return {
    icon: GraduationCap,
    buttonClass: 'border-[#d4dee9] bg-[#edf3f8] text-[#071d3b] hover:bg-[#dfe8f1] focus:ring-[#147f72]/10',
    tooltipClass: 'bg-[#071d3b]'
  }
}

function aprendizadoSituacaoTooltip(lancamento: CadernetaDigitalSummary) {
  return `Situacao: ${formatarSituacaoAprendizado(lancamento)}`
}

function formatarSituacaoAprendizado(lancamento: CadernetaDigitalSummary) {
  const situacao = normalizarSituacao(lancamento.situacao)
  const corSituacao = normalizarSituacao(lancamento.corSituacao)

  if (situacao.includes('reprov') || corSituacao === 'vermelho') return 'Reprovado'
  if (situacao.includes('recuper')) return 'Em recuperacao'
  if (situacao.includes('aprov') || corSituacao === 'azul') return 'Aprovado'

  return lancamento.situacao || 'Nao informada'
}

function normalizarSituacao(value?: string | null) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}
</script>
