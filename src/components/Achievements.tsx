import { useEffect, useRef } from 'react'
import { achievementList, DEFAULT_ACCENT, rankFor, resetAchievements, resetColors, toggleTheme, useStore } from '../lib/store'
import { QuestSprite } from './QuestSprite'

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
    <button type="button" className="quest-hud" onClick={onOpen} aria-label={`Side quests: ${count} of ${achievementList.length} cleared`} title={`Side quests · ${count}/${achievementList.length}`} data-cursor="quests">
      <span className="quest-lv" aria-hidden="true">{count}</span>
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

  const cleared = unlocked.length
  const total = achievementList.length

  return (
    <div className={`drawer ${open ? 'drawer-open' : ''}`} inert={!open}>
      <button type="button" className="drawer-scrim" onClick={onClose} aria-label="Close side quests" />
      <div className="drawer-panel" ref={panelRef} role="dialog" aria-modal={open} aria-label="Side quests" tabIndex={-1}>
        <div className="drawer-head">
          <p className="kicker mono"><QuestSprite name="sword" className="kicker-sprite" /> Side quests</p>
          <button type="button" className="mono drawer-close" onClick={onClose} aria-label="Esc, close side quests">esc ✕</button>
        </div>
        <div className="quest-player">
          <span className="quest-lv quest-lv-lg">{cleared}</span>
          <div>
            <p className="mono">Level {cleared} · {cleared * 100}/{total * 100} XP</p>
            <h3>{rankFor(cleared)}</h3>
          </div>
        </div>
        <div className="quest-xp" role="progressbar" aria-label="Quests cleared" aria-valuemin={0} aria-valuemax={total} aria-valuenow={cleared}>
          {achievementList.map((a, i) => <i key={a.id} className={i < cleared ? 'on' : ''} />)}
        </div>
        <ul className="quest-grid">
          {achievementList.map((a) => {
            const got = unlocked.includes(a.id)
            return (
              <li key={a.id} className={got ? 'got' : ''}>
                <span className="quest-tile-icon"><QuestSprite name={got ? a.id : 'lock'} /></span>
                <b>{got ? a.name : '???'}</b>
                <i className="mono">{a.hint}</i>
                <span className="quest-reward mono">{got ? '✓ cleared' : '+100 XP'}</span>
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
          <span className="toast-gem">{t.icon ? <QuestSprite name={t.icon} /> : '◆'}</span>
          <div>
            <p className="mono">{t.title}</p>
            <strong>{t.body}</strong>
          </div>
        </div>
      ))}
    </div>
  )
}
