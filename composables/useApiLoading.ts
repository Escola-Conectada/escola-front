export function useApiLoading() {
  const pendingRequests = useState('api-loading:pending-requests', () => 0)
  const isLoading = computed(() => pendingRequests.value > 0)

  function start() {
    pendingRequests.value += 1
  }

  function finish() {
    pendingRequests.value = Math.max(0, pendingRequests.value - 1)
  }

  function reset() {
    pendingRequests.value = 0
  }

  return {
    pendingRequests: readonly(pendingRequests),
    isLoading,
    start,
    finish,
    reset
  }
}
