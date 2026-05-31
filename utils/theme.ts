export type AppTheme = 'light' | 'dark'

export const APP_THEME_STORAGE_KEY = 'escola-conectada-theme'
export const DEFAULT_APP_THEME: AppTheme = 'light'

export function isAppTheme(value: unknown): value is AppTheme {
  return value === 'light' || value === 'dark'
}

export function applyAppTheme(theme: AppTheme) {
  if (typeof document === 'undefined') return

  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

export function readStoredAppTheme(): AppTheme {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_APP_THEME
  }

  const storedTheme = localStorage.getItem(APP_THEME_STORAGE_KEY)
  return isAppTheme(storedTheme) ? storedTheme : DEFAULT_APP_THEME
}

export function persistAppTheme(theme: AppTheme) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(APP_THEME_STORAGE_KEY, theme)
  }

  applyAppTheme(theme)
}
