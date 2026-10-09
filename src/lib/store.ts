import { useSyncExternalStore } from 'react'

export const achievementList = [
  { id: 'hello', name: 'Hello, World', hint: 'Run any command in the terminal' },
  { id: 'palette', name: 'Power User', hint: 'Open the command palette' },
  { id: 'scatter', name: 'Big Bang', hint: 'Click the name in the hero' },
  { id: 'neofetch', name: 'Ricer', hint: 'Check the system specs' },
  { id: 'sudo', name: 'Root Access', hint: 'Use sudo to make a hiring decision' },
  { id: 'rmrf', name: 'Chaos Agent', hint: 'Try to delete everything' },
  { id: 'theme', name: 'Chameleon', hint: 'Change the accent color' },
  { id: 'runner', name: 'Warmed Up', hint: 'Score 10 in Frantic Run' },
  { id: 'marathon', name: 'Marathoner', hint: 'Score 40 in Frantic Run' },
  { id: 'copy', name: 'Copycat', hint: 'Copy the email address' },
  { id: 'konami', name: 'Old School', hint: '↑ ↑ ↓ ↓ ← → ← → B A' },
  { id: 'explorer', name: 'Explorer', hint: 'Reach the very bottom' },
] as const

export type AchievementId = (typeof achievementList)[number]['id']

export const accents = {
  orange: '#fa6945',
  green: '#8ee19c',
  blue: '#7aa7ff',
  pink: '#ff6bcb',
  yellow: '#f5d547',
} as const

export type AccentName = keyof typeof accents

type Toast = { id: number; title: string; body: string }

type State = {
  unlocked: AchievementId[]
  accent: AccentName
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

const applyAccent = (accent: AccentName) => {
  const hex = accents[accent]
  const root = document.documentElement
  root.style.setProperty('--accent', hex)
  root.style.setProperty('--accent-rgb', hexToRgb(hex).map((v) => Math.round(v * 255)).join(', '))
}

let state: State = { unlocked: read(), accent: readAccent(), toasts: [] }
if (state.accent !== DEFAULT_ACCENT) applyAccent(state.accent)
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
export const toast = (title: string, body: string) => {
  const id = ++toastId
  set({ toasts: [...state.toasts, { id, title, body }] })
  window.setTimeout(() => set({ toasts: state.toasts.filter((t) => t.id !== id) }), 4200)
}

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
  toast(`Achievement unlocked · ${unlocked.length}/${achievementList.length}`, meta.name)
  if (unlocked.length === achievementList.length) {
    window.setTimeout(() => {
      toast('100% complete', 'You found every secret. Email me, seriously.')
      emit('confetti')
    }, 900)
  }
}

export const resetAchievements = () => {
  set({ unlocked: [] })
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export const setAccent = (accent: AccentName) => {
  applyAccent(accent)
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

export const cycleAccent = () => {
  const names = Object.keys(accents) as AccentName[]
  setAccent(names[(names.indexOf(state.accent) + 1) % names.length])
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

let booted = false
export const isBooted = () => booted
export const markBooted = () => {
  if (booted) return
  booted = true
  emit('boot-done')
}

type BusEvent = 'confetti' | 'palette' | 'scatter' | 'boot-done'
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

export const scrollToId = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}
