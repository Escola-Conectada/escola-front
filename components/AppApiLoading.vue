<template>
  <Transition name="api-loading-fade">
    <div
      v-if="visible"
      class="pointer-events-none fixed left-1/2 top-4 z-[80] w-[min(92vw,360px)] -translate-x-1/2 sm:top-5"
    >
      <div
        class="flex min-h-16 items-center gap-3 rounded-lg border border-[#d4dee9] bg-white/95 px-4 py-3 text-[#071d3b] shadow-[0_18px_40px_rgba(14,30,53,0.18)] backdrop-blur"
        role="status"
        aria-live="polite"
      >
        <span class="api-loading-spinner" aria-hidden="true" />
        <span class="grid min-w-0 gap-0.5">
          <strong class="text-sm leading-tight">Processando solicitacao</strong>
          <span class="text-xs font-semibold text-[#51627a]">Sua operacao esta em andamento.</span>
        </span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { isLoading } = useApiLoading()
const visible = ref(false)
const showDelayMs = 120
const minimumVisibleMs = 520
let showTimer: ReturnType<typeof setTimeout> | undefined
let hideTimer: ReturnType<typeof setTimeout> | undefined
let shownAt = 0

watch(isLoading, (loading) => {
  if (loading) {
    clearHideTimer()

    if (!visible.value && !showTimer) {
      showTimer = setTimeout(() => {
        visible.value = true
        shownAt = Date.now()
        showTimer = undefined
      }, showDelayMs)
    }

    return
  }

  clearShowTimer()

  if (!visible.value) {
    return
  }

  const visibleForMs = Date.now() - shownAt
  hideTimer = setTimeout(() => {
    visible.value = false
    hideTimer = undefined
  }, Math.max(0, minimumVisibleMs - visibleForMs))
}, { immediate: true })

onBeforeUnmount(() => {
  clearShowTimer()
  clearHideTimer()
})

function clearShowTimer() {
  if (!showTimer) return

  clearTimeout(showTimer)
  showTimer = undefined
}

function clearHideTimer() {
  if (!hideTimer) return

  clearTimeout(hideTimer)
  hideTimer = undefined
}
</script>

<style scoped>
.api-loading-spinner {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  border: 3px solid #d4dee9;
  border-top-color: #147f72;
  border-radius: 999px;
  animation: api-loading-spin 0.8s linear infinite;
}

.api-loading-fade-enter-active,
.api-loading-fade-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.api-loading-fade-enter-from,
.api-loading-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}

@keyframes api-loading-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
