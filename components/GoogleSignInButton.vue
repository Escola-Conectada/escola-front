<template>
  <div
    ref="buttonContainer"
    class="google-sign-in-button min-h-11 w-full"
    :class="{ 'pointer-events-none opacity-70': disabled }"
  />
</template>

<script setup lang="ts">
interface GoogleCredentialResponse {
  credential?: string
  select_by?: string
}

interface GoogleAccountsId {
  initialize: (options: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
    ux_mode?: 'popup' | 'redirect'
    auto_select?: boolean
    cancel_on_tap_outside?: boolean
  }) => void
  renderButton: (parent: HTMLElement, options: {
    theme?: 'outline' | 'filled_blue' | 'filled_black'
    size?: 'large' | 'medium' | 'small'
    type?: 'standard' | 'icon'
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
    shape?: 'rectangular' | 'pill' | 'circle' | 'square'
    logo_alignment?: 'left' | 'center'
    width?: number
    locale?: string
  }) => void
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId
      }
    }
  }
}

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client?hl=pt-BR'
let googleScriptPromise: Promise<void> | null = null

const props = withDefaults(defineProps<{
  clientId: string
  disabled?: boolean
}>(), {
  disabled: false
})

const emit = defineEmits<{
  credential: [credential: string]
  error: [message: string]
}>()

const buttonContainer = ref<HTMLElement | null>(null)

onMounted(() => {
  void renderGoogleButton()
})

watch(() => props.clientId, () => {
  void renderGoogleButton()
})

async function renderGoogleButton() {
  if (!props.clientId || !buttonContainer.value) {
    return
  }

  try {
    await loadGoogleIdentity()

    const googleId = window.google?.accounts?.id
    if (!googleId || !buttonContainer.value) {
      emit('error', 'Nao foi possivel carregar o login do Google.')
      return
    }

    await nextTick()
    buttonContainer.value.innerHTML = ''
    googleId.initialize({
      client_id: props.clientId,
      callback: handleCredentialResponse,
      ux_mode: 'popup',
      auto_select: false,
      cancel_on_tap_outside: true
    })
    googleId.renderButton(buttonContainer.value, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      locale: 'pt-BR',
      width: resolveButtonWidth()
    })
  } catch {
    emit('error', 'Nao foi possivel carregar o login do Google.')
  }
}

function handleCredentialResponse(response: GoogleCredentialResponse) {
  if (props.disabled) {
    return
  }

  if (!response.credential) {
    emit('error', 'O Google nao retornou uma credencial valida.')
    return
  }

  emit('credential', response.credential)
}

function resolveButtonWidth() {
  const width = Math.floor(buttonContainer.value?.getBoundingClientRect().width ?? 320)
  return Math.max(240, Math.min(width || 320, 400))
}

function loadGoogleIdentity() {
  if (window.google?.accounts?.id) {
    return Promise.resolve()
  }

  if (googleScriptPromise) {
    return googleScriptPromise
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GOOGLE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      googleScriptPromise = null
      reject(new Error('Google Identity Services indisponivel.'))
    }

    document.head.appendChild(script)
  })

  return googleScriptPromise
}
</script>

<style scoped>
.google-sign-in-button {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
