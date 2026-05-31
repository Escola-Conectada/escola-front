import { applyAppTheme, readStoredAppTheme } from '~/utils/theme'

export default defineNuxtPlugin(() => {
  applyAppTheme(readStoredAppTheme())
})
