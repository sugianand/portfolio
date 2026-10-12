import { useEffect, useRef } from 'react'
import { achievementList, DEFAULT_ACCENT, resetAchievements, resetColors, toggleTheme, useStore } from '../lib/store'

export function ThemeReset() {
  const accent = useStore((s) => s.accent)
  if (accent === DEFAULT_ACCENT) return null
  return (
    <button type="button" className="hud theme-reset" onClick={resetColors} title="Restore the original orange theme">
      ↺ Original colors
    </button>
  )
}

export function ThemeToggle() {
  const theme = useStore((s) => s.theme)
  const next = theme === 'light' ? 'dark' : 'light'
  return (
    <button type="button" className="hud theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`}>
      <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
    </button>
  )
}

export function AchievementButton({ onOpen }: { onOpen: () => void }) {
  const count = useStore((s) => s.unlocked.length)
  return (
    <button type="button" className="hud mono" onClick={onOpen} aria-label={`${count}/${achievementList.length} achievements found`} data-cursor="secrets">
      <span className="hud-gem" aria-hidden="true">◆</span>
      {count}/{achievementList.length}
    </button>
  )
}

export function AchievementDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const unlocked = useStore((s) => s.unlocked)
  const panelRef = useRef<HTMLDivElement>(null)

  // Move focus into the drawer and hand it back to wherever it came from on close.
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    panelRef.current?.focus({ preventScroll: true })
    return () => previous?.focus({ preventScroll: true })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const pct = Math.round((unlocked.length / achievementList.length) * 100)

  return (
    <div className={`drawer ${open ? 'drawer-open' : ''}`} inert={!open}>
      <button type="button" className="drawer-scrim" onClick={onClose} aria-label="Close achievements" />
      <div className="drawer-panel" ref={panelRef} role="dialog" aria-modal={open} aria-label="Achievements" tabIndex={-1}>
        <div className="drawer-head">
          <p className="kicker mono"><span>◆</span> Secrets</p>
          <button type="button" className="mono drawer-close" onClick={onClose} aria-label="Esc, close achievements">esc ✕</button>
        </div>
        <h3>{pct}% <em>found.</em></h3>
        <div className="drawer-bar"><span style={{ transform: `scaleX(${pct / 100})` }} /></div>
        <ul className="ach-list">
          {achievementList.map((a) => {
            const got = unlocked.includes(a.id)
            return (
              <li key={a.id} className={got ? 'got' : ''}>
                <span className="ach-icon">{got ? '◆' : '◇'}</span>
                <span>
                  <b>{got ? a.name : '???'}</b>
                  <i className="mono">{a.hint}</i>
                </span>
              </li>
            )
          })}
        </ul>
        <button type="button" className="mono drawer-reset" onClick={resetAchievements}>reset progress</button>
      </div>
    </div>
  )
}

export function Toasts() {
  const toasts = useStore((s) => s.toasts)
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span className="toast-gem">◆</span>
          <div>
            <p className="mono">{t.title}</p>
            <strong>{t.body}</strong>
          </div>
        </div>
      ))}
    </div>
  )
}
