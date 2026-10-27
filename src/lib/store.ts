import { useSyncExternalStore } from 'react'
import { holdWhileBusy } from './holdToasts.ts'
import { accentHex, accents, type AccentName, type Theme } from './palette.ts'

export const achievementList = [
  { id: 'recruiter', name: 'Speed Reader', hint: 'Open the quick summary' },
  { id: 'casestudy', name: 'Deep Diver', hint: 'Open a project case study' },
  { id: 'demo', name: 'Taste Test', hint: 'Run your own search in the CineDNA demo' },
  { id: 'arch', name: 'Systems Thinker', hint: 'Explore an architecture diagram' },
  { id: 'assistant', name: 'Curious Mind', hint: 'Ask the assistant a question' },
  { id: 'palette', name: 'Power User', hint: 'Open the command palette' },
  { id: 'scatter', name: 'Big Bang', hint: 'Click the name in the hero' },
  { id: 'theme', name: 'Chameleon', hint: 'Change the accent color' },
  { id: 'copy', name: 'Copycat', hint: 'Copy the email address' },
  { id: 'konami', name: 'Old School', hint: '↑ ↑ ↓ ↓ ← → ← → B A' },
  { id: 'explorer', name: 'Explorer', hint: 'Reach the very bottom' },
] as const

export type AchievementId = (typeof achievementList)[number]['id']

export { accentHex, accents, lightAccents, type AccentName, type Theme } from './palette.ts'

type Toast = { id: number; title: string; body: string; icon?: AchievementId }

type State = {
  unlocked: AchievementId[]
  accent: AccentName
  theme: Theme
  toasts: Toast[]
}

const STORAGE_KEY = 'sa26:achievements'

const read = (): AchievementId[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as string[]) : []
    return achievementList.filter((a) => parsed.includes(a.id)).map((a) => a.id)
  } catch {
    return []
  }
}

export const DEFAULT_ACCENT: AccentName = 'orange'
const ACCENT_KEY = 'sa26:accent'

const readAccent = (): AccentName => {
  try {
    const saved = localStorage.getItem(ACCENT_KEY)
    return saved && saved in accents ? (saved as AccentName) : DEFAULT_ACCENT
  } catch {
    return DEFAULT_ACCENT
  }
}

const THEME_KEY = 'sa26:theme'
const THEME_COLORS: Record<Theme, string> = { dark: '#0a0a09', light: '#f6f3ec' }

// index.html sets data-theme before first paint from the saved choice or the OS setting.
const readTheme = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
const systemTheme = (): Theme => (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')

const applyAccent = (accent: AccentName, theme: Theme) => {
  const hex = accentHex(accent, theme)
  const root = document.documentElement
  root.style.setProperty('--accent', hex)
  root.style.setProperty('--accent-rgb', hexToRgb(hex).map((v) => Math.round(v * 255)).join(', '))
  root.style.setProperty('--accent-night', accents[accent])
}

let state: State = { unlocked: read(), accent: readAccent(), theme: readTheme(), toasts: [] }
if (state.accent !== DEFAULT_ACCENT) applyAccent(state.accent, state.theme)
const listeners = new Set<() => void>()

const set = (patch: Partial<State>) => {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useStore = <T,>(select: (s: State) => T) => useSyncExternalStore(subscribe, () => select(state))

export const getState = () => state

let toastId = 0
export const toast = (title: string, body: string, icon?: AchievementId) => {
  const id = ++toastId
  set({ toasts: [...state.toasts, { id, title, body, icon }] })
  window.setTimeout(() => set({ toasts: state.toasts.filter((t) => t.id !== id) }), 4200)
}

// Quest toasts wait until dialogs and the assistant close, so they never cover what's being read.
const dialogOpen = () => document.querySelector('[aria-modal="true"], #ask-panel') !== null
const celebrate = holdWhileBusy<() => void>(dialogOpen, (fire) => fire(), (retry) => window.setTimeout(retry, 600))

export const unlock = (id: AchievementId) => {
  if (state.unlocked.includes(id)) return
  const unlocked = [...state.unlocked, id]
  set({ unlocked })
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked))
  } catch {
    /* storage unavailable: progress lasts for this visit only */
  }
  const meta = achievementList.find((a) => a.id === id)!
  celebrate(() => toast(`Quest cleared · ${unlocked.length}/${achievementList.length}`, meta.name, id))
  if (unlocked.length === achievementList.length) {
    celebrate(() => window.setTimeout(() => {
      toast('Legend rank reached', 'Every quest cleared. Email me, seriously.')
      emit('confetti')
    }, 900))
  }
}

const RANKS = ['Visitor', 'Rookie', 'Rookie', 'Rookie', 'Adventurer', 'Adventurer', 'Adventurer', 'Veteran', 'Veteran', 'Veteran', 'Elite', 'Legend'] as const
export const rankFor = (cleared: number) => RANKS[Math.min(cleared, RANKS.length - 1)]

export const resetAchievements = () => {
  set({ unlocked: [] })
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export const setAccent = (accent: AccentName) => {
  applyAccent(accent, state.theme)
  const changed = accent !== state.accent
  set({ accent })
  try {
    if (accent === DEFAULT_ACCENT) localStorage.removeItem(ACCENT_KEY)
    else localStorage.setItem(ACCENT_KEY, accent)
  } catch {
    /* storage unavailable: the color lasts for this visit only */
  }
  if (accent !== DEFAULT_ACCENT) {
    unlock('theme')
    if (changed) toast(`Theme: ${accent}`, 'Click "↺ Original colors" up top to go back')
  }
}

export const resetAccent = () => setAccent(DEFAULT_ACCENT)

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
  applyAccent(state.accent, theme)
  set({ theme })
}

/** Light or dark. Picking what the OS already prefers clears the override so the site follows the OS again. */
export const setTheme = (theme: Theme) => {
  applyTheme(theme)
  try {
    if (theme === systemTheme()) localStorage.removeItem(THEME_KEY)
    else localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* storage unavailable: the theme lasts for this visit only */
  }
}

export const toggleTheme = () => setTheme(state.theme === 'light' ? 'dark' : 'light')

/** Back to the original look: the OS light/dark preference and the orange accent. */
export const resetColors = () => {
  try {
    localStorage.removeItem(THEME_KEY)
  } catch {
    /* ignore */
  }
  applyTheme(systemTheme())
  resetAccent()
}

window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
  let saved: string | null = null
  try {
    saved = localStorage.getItem(THEME_KEY)
  } catch {
    /* ignore */
  }
  if (!saved) applyTheme(systemTheme())
})

export const cycleAccent = () => {
  const names = Object.keys(accents) as AccentName[]
  setAccent(names[(names.indexOf(state.accent) + 1) % names.length])
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

type BusEvent = 'confetti' | 'palette' | 'shortcuts' | 'recruiter' | 'assistant' | 'scatter'
const bus = new EventTarget()
export const emit = (event: BusEvent) => bus.dispatchEvent(new Event(event))
export const on = (event: BusEvent, handler: () => void) => {
  bus.addEventListener(event, handler)
  return () => bus.removeEventListener(event, handler)
}

export const copyEmail = async (email: string) => {
  try {
    await navigator.clipboard.writeText(email)
    toast('Copied to clipboard', email)
  } catch {
    toast('Copy failed', email)
  }
  unlock('copy')
}

/** Smooth scrolling, unless the visitor asked for reduced motion. */
export const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

export const scrollToId = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
}
