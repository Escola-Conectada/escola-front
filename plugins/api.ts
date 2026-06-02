import { createApiClient } from '~/utils/api-client'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const auth = useAuthStore()
  const apiLoading = useApiLoading()

  const api = createApiClient({
    baseURL: config.public.apiBase,
    getToken: () => auth.token,
    onRequestStart: apiLoading.start,
    onRequestEnd: apiLoading.finish,
    onUnauthorized: () => {
      auth.logout()

      if (useRoute().path !== '/login') {
        navigateTo('/login')
      }
    }
  })

  return {
    provide: {
      api
    }
  }
})
