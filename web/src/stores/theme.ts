import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'
export type FontSize = 'small' | 'middle' | 'large'

interface ThemeState {
  mode: ThemeMode
  fontSize: FontSize
  compact: boolean
  setMode: (m: ThemeMode) => void
  setFontSize: (s: FontSize) => void
  setCompact: (c: boolean) => void
}

const KEY = 'theme-pref'

function load(): { mode: ThemeMode; fontSize: FontSize; compact: boolean } {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { mode: 'light', fontSize: 'middle', compact: false, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return { mode: 'light', fontSize: 'middle', compact: false }
}

function persist(s: { mode: ThemeMode; fontSize: FontSize; compact: boolean }) {
  localStorage.setItem(KEY, JSON.stringify(s))
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  ...load(),
  setMode: (mode) => {
    set({ mode })
    persist({ ...get(), mode })
    document.documentElement.setAttribute('data-theme', mode)
  },
  setFontSize: (fontSize) => {
    set({ fontSize })
    persist({ ...get(), fontSize })
  },
  setCompact: (compact) => {
    set({ compact })
    persist({ ...get(), compact })
  },
}))
