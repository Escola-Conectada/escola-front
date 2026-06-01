<template>
  <span
    class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#edf3f8] font-extrabold text-[#071d3b] ring-1 ring-[#d4dee9]"
    :class="sizeClass"
  >
    <img
      v-if="fotoUrl"
      class="h-full w-full object-cover"
      :src="fotoUrl"
      :alt="`Foto de ${nomeUsuario}`"
    />
    <span v-else>{{ iniciais }}</span>
  </span>
</template>

<script setup lang="ts">
import type { UsuarioSummary } from '~/types/api'
import { fetchApiBlob } from '~/utils/api-file'

const props = withDefaults(defineProps<{
  usuario?: UsuarioSummary | null
  size?: 'sm' | 'md' | 'lg'
}>(), {
  usuario: null,
  size: 'md'
})

const auth = useAuthStore()
const config = useRuntimeConfig()
const fotoUrl = ref('')
let fotoRequestKey = ''

const nomeUsuario = computed(() => props.usuario?.nome || 'Usuario')
const iniciais = computed(() => obterIniciais(nomeUsuario.value))
const sizeClass = computed(() => {
  const classes = {
    sm: 'h-9 w-9 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg'
  }

  return classes[props.size]
})
const fotoKey = computed(() =>
  `${props.usuario?.idUsuario ?? 0}:${props.usuario?.fotoPerfilUrl ?? ''}`
)

watch(fotoKey, () => {
  if (import.meta.client) {
    void carregarFotoUsuario()
  }
})

onMounted(() => {
  void carregarFotoUsuario()
})

onBeforeUnmount(() => {
  limparFoto()
})

async function carregarFotoUsuario() {
  limparFoto()

  const usuario = props.usuario
  if (!usuario?.idUsuario || !usuario.fotoPerfilUrl) {
    return
  }

  const requestKey = fotoKey.value
  fotoRequestKey = requestKey

  try {
    const blob = await fetchApiBlob(`/usuarios/${usuario.idUsuario}/foto`, config.public.apiBase, auth.token)

    if (fotoRequestKey !== requestKey) {
      return
    }

    fotoUrl.value = URL.createObjectURL(blob)
  } catch {
    fotoUrl.value = ''
  }
}

function limparFoto() {
  fotoRequestKey = ''

  if (fotoUrl.value) {
    URL.revokeObjectURL(fotoUrl.value)
    fotoUrl.value = ''
  }
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
