import { themes, type ThemeName } from '~/data/commands'

const STORAGE_KEY = 'portfolio-theme'

export function useTheme() {
  const current = useState<ThemeName>('theme', () => 'default')

  function apply(name: ThemeName) {
    current.value = name
    if (name === 'default') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = name
    try {
      localStorage.setItem(STORAGE_KEY, name)
    } catch {
      /* private mode etc. — theme just won't persist */
    }
  }

  // Sync state with whatever the pre-paint script in app.vue already applied.
  function init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && (themes as readonly string[]).includes(saved)) {
        current.value = saved as ThemeName
      }
    } catch {
      /* ignore */
    }
  }

  return { current, apply, init }
}
