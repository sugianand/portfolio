import { useEffect, useMemo, useRef, useState } from 'react'
import { profile, projects } from '../data'
import { trapTab } from '../lib/focusTrap'
import { MOD } from '../lib/platform'
import { copyEmail, cycleAccent, emit, resetColors, scrollToId, toggleTheme, unlock } from '../lib/store'

// The dialogs behind ⌘K and `?`. Overlays.tsx owns the shortcuts that open them and loads
// this chunk on demand, so the first paint doesn't parse markup nobody has asked for.

type Action = { id: string; label: string; hint: string; run: () => void }

const open = (href: string) => window.open(href, '_blank', 'noopener,noreferrer')

export function PaletteDialog({ onClose, onAchievements }: { onClose: () => void; onAchievements: () => void }) {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  const actions = useMemo<Action[]>(() => [
    { id: 'recruiter', label: 'Quick summary (for recruiters)', hint: 'R', run: () => emit('recruiter') },
    { id: 'assistant', label: 'Ask the portfolio assistant', hint: 'retrieval', run: () => emit('assistant') },
    { id: 'about', label: 'Go to About', hint: 'section', run: () => scrollToId('about') },
    { id: 'projects', label: 'Go to Projects', hint: 'section', run: () => scrollToId('projects') },
    { id: 'log', label: 'Go to Experience', hint: 'section', run: () => scrollToId('log') },
    { id: 'github', label: 'Go to GitHub activity', hint: 'section', run: () => scrollToId('github') },
    { id: 'contact', label: 'Go to Contact', hint: 'section', run: () => scrollToId('contact') },
    { id: 'email', label: 'Copy email address', hint: profile.email, run: () => copyEmail(profile.email) },
    { id: 'resume', label: 'Open resume (PDF)', hint: 'new tab', run: () => open(profile.resume) },
    { id: 'open-github', label: 'Open GitHub', hint: 'github.com/sugianand', run: () => open(profile.github) },
    { id: 'linkedin', label: 'Open LinkedIn', hint: 'linkedin', run: () => open(profile.linkedin) },
    ...projects.map((p) => ({ id: `p-${p.id}`, label: `Project: ${p.title}`, hint: p.kind, run: () => { window.location.hash = `project/${p.id}` } })),
    { id: 'accent', label: 'Cycle accent color', hint: 'theme', run: cycleAccent },
    { id: 'light-dark', label: 'Switch light / dark theme', hint: 'theme', run: toggleTheme },
    { id: 'accent-reset', label: 'Reset to original colors', hint: 'theme', run: resetColors },
    { id: 'confetti', label: 'Celebrate', hint: 'why not', run: () => emit('confetti') },
    { id: 'quests', label: 'Show side quests', hint: 'quests', run: onAchievements },
    { id: 'shortcuts', label: 'Show keyboard shortcuts', hint: '?', run: () => emit('shortcuts') },
    { id: 'source', label: 'View site source', hint: 'github', run: () => open(profile.source) },
  ], [onAchievements])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return actions
    return actions.filter((a) => `${a.label} ${a.hint}`.toLowerCase().includes(q))
  }, [actions, query])

  // Hand focus back to wherever it came from on close; a chosen action that opens its own
  // dialog takes focus from there and returns it to the same place.
  useEffect(() => {
    unlock('palette')
    const previous = document.activeElement as HTMLElement | null
    const id = window.setTimeout(() => inputRef.current?.focus(), 30)
    const onKey = (e: KeyboardEvent) => trapTab(e, boxRef.current)
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('keydown', onKey)
      previous?.focus({ preventScroll: true })
    }
  }, [])

  const choose = (action?: Action) => {
    if (!action) return
    onClose()
    action.run()
  }

  return (
    <div className="palette" onClick={onClose}>
      <div ref={boxRef} className="palette-box" role="dialog" aria-modal="true" aria-label="Command palette" onClick={(e) => e.stopPropagation()}>
        <div className="palette-input">
          <span className="mono">{MOD === '⌘' ? '⌘K' : 'Ctrl K'}</span>
          <input
            ref={inputRef}
            value={query}
            placeholder="Type a command or search…"
            onChange={(e) => { setQuery(e.target.value); setIndex(0) }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setIndex((i) => Math.min(filtered.length - 1, i + 1)) }
              if (e.key === 'ArrowUp') { e.preventDefault(); setIndex((i) => Math.max(0, i - 1)) }
              // Without preventDefault, the keypress lands on whatever button focus returns to and clicks it.
              if (e.key === 'Enter') { e.preventDefault(); choose(filtered[index]) }
            }}
            aria-label="Search commands"
          />
        </div>
        <ul className="palette-list">
          {filtered.map((a, i) => (
            <li key={a.id}>
              <button type="button" className={i === index ? 'active' : ''} onMouseEnter={() => setIndex(i)} onClick={() => choose(a)}>
                <span>{a.label}</span>
                <i className="mono">{a.hint}</i>
              </button>
            </li>
          ))}
          {!filtered.length && <li className="palette-empty mono">No matches. Try “resume”.</li>}
        </ul>
        <div className="palette-foot mono"><span>↑↓ navigate</span><span>↵ select</span><span>esc close</span><span>? shortcuts</span></div>
      </div>
    </div>
  )
}

const SHORTCUTS: [keys: string[], action: string][] = [
  [[MOD, 'K'], 'Open the command palette'],
  [['/'], 'Open the command palette'],
  [['R'], 'Open the quick summary for recruiters'],
  [['?'], 'Show these shortcuts'],
  [['Esc'], 'Close a dialog or panel'],
  [['←', '→'], 'Previous or next case study'],
]

export function ShortcutsDialog({ onClose }: { onClose: () => void }) {
  const boxRef = useRef<HTMLDivElement>(null)

  // Move focus into the dialog and hand it back to wherever it came from on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    boxRef.current?.focus()
    const onKey = (e: KeyboardEvent) => trapTab(e, boxRef.current)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [])

  return (
    <div className="palette" onClick={onClose}>
      <div ref={boxRef} className="palette-box shortcuts" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title" tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <div className="palette-input">
          <span className="mono">?</span>
          <h2 id="shortcuts-title">Keyboard shortcuts</h2>
        </div>
        <dl className="shortcut-list">
          {SHORTCUTS.map(([keys, action]) => (
            <div key={action}>
              <dt>{keys.map((k) => <kbd key={k}>{k}</kbd>)}</dt>
              <dd>{action}</dd>
            </div>
          ))}
        </dl>
        <div className="palette-foot mono"><span>esc close</span><button type="button" className="mono" onClick={onClose}>close ✕</button></div>
      </div>
    </div>
  )
}
