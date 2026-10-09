import { useEffect, useMemo, useRef, useState } from 'react'
import { profile, projects } from '../data'
import { copyEmail, cycleAccent, emit, on, resetAccent, scrollToId, unlock } from '../lib/store'

type Action = { id: string; label: string; hint: string; run: () => void }

const open = (href: string) => window.open(href, '_blank', 'noopener,noreferrer')

export function CommandPalette({ onAchievements }: { onAchievements: () => void }) {
  const [isOpen, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const actions = useMemo<Action[]>(() => [
    { id: 'about', label: 'Go to About', hint: 'section', run: () => scrollToId('about') },
    { id: 'projects', label: 'Go to Projects', hint: 'section', run: () => scrollToId('projects') },
    { id: 'log', label: 'Go to Experience', hint: 'section', run: () => scrollToId('log') },
    { id: 'github', label: 'Go to GitHub activity', hint: 'section', run: () => scrollToId('github') },
    { id: 'shell', label: 'Open the terminal', hint: 'section', run: () => scrollToId('shell') },
    { id: 'arcade', label: 'Play Frantic Run', hint: 'section', run: () => scrollToId('arcade') },
    { id: 'contact', label: 'Go to Contact', hint: 'section', run: () => scrollToId('contact') },
    { id: 'email', label: 'Copy email address', hint: profile.email, run: () => copyEmail(profile.email) },
    { id: 'resume', label: 'Open resume (PDF)', hint: 'new tab', run: () => open(profile.resume) },
    { id: 'github', label: 'Open GitHub', hint: 'github.com/sugianand', run: () => open(profile.github) },
    { id: 'linkedin', label: 'Open LinkedIn', hint: 'linkedin', run: () => open(profile.linkedin) },
    ...projects.map((p) => ({ id: `p-${p.id}`, label: `Project: ${p.title}`, hint: p.kind, run: () => { window.location.hash = `project/${p.id}` } })),
    { id: 'accent', label: 'Cycle accent color', hint: 'theme', run: cycleAccent },
    { id: 'accent-reset', label: 'Reset to original colors', hint: 'theme', run: resetAccent },
    { id: 'accent-reset', label: 'Reset to original colors', hint: 'theme', run: resetAccent },
    { id: 'confetti', label: 'Celebrate', hint: 'why not', run: () => emit('confetti') },
    { id: 'secrets', label: 'Show achievements', hint: 'secrets', run: onAchievements },
    { id: 'source', label: 'View site source', hint: 'github', run: () => open(profile.source) },
  ], [onAchievements])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return actions
    return actions.filter((a) => `${a.label} ${a.hint}`.toLowerCase().includes(q))
  }, [actions, query])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest('input, textarea')
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setQuery('')
        setIndex(0)
        setOpen((o) => !o)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    const off = on('palette', () => {
      setQuery('')
      setIndex(0)
      setOpen(true)
    })
    return () => {
      window.removeEventListener('keydown', onKey)
      off()
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    unlock('palette')
    window.setTimeout(() => inputRef.current?.focus(), 30)
  }, [isOpen])

  const choose = (action?: Action) => {
    if (!action) return
    setOpen(false)
    action.run()
  }

  if (!isOpen) return null

  return (
    <div className="palette" role="dialog" aria-label="Command palette" onClick={() => setOpen(false)}>
      <div className="palette-box" onClick={(e) => e.stopPropagation()}>
        <div className="palette-input">
          <span className="mono">⌘K</span>
          <input
            ref={inputRef}
            value={query}
            placeholder="Type a command or search…"
            onChange={(e) => { setQuery(e.target.value); setIndex(0) }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setIndex((i) => Math.min(filtered.length - 1, i + 1)) }
              if (e.key === 'ArrowUp') { e.preventDefault(); setIndex((i) => Math.max(0, i - 1)) }
              if (e.key === 'Enter') choose(filtered[index])
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
        <div className="palette-foot mono"><span>↑↓ navigate</span><span>↵ select</span><span>esc close</span></div>
      </div>
    </div>
  )
}

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

export function Konami() {
  useEffect(() => {
    let pos = 0
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      pos = key === KONAMI[pos] ? pos + 1 : key === KONAMI[0] ? 1 : 0
      if (pos === KONAMI.length) {
        pos = 0
        unlock('konami')
        emit('confetti')
        cycleAccent()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return null
}

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    type Bit = { x: number; y: number; vx: number; vy: number; r: number; vr: number; c: string; s: number; life: number }
    let bits: Bit[] = []
    let raf = 0

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      bits = bits.filter((b) => b.life > 0 && b.y < canvas.height + 40)
      for (const b of bits) {
        b.vy += 0.25
        b.vx *= 0.99
        b.x += b.vx
        b.y += b.vy
        b.r += b.vr
        b.life--
        ctx.save()
        ctx.translate(b.x, b.y)
        ctx.rotate(b.r)
        ctx.fillStyle = b.c
        ctx.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2)
        ctx.restore()
      }
      if (bits.length) raf = requestAnimationFrame(loop)
    }

    const burst = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
      const colors = [accent, '#f4f0e9', '#8ee19c', '#7aa7ff', '#f5d547']
      for (const side of [0, 1]) {
        for (let i = 0; i < 90; i++) {
          const angle = side ? Math.PI + 0.35 + Math.random() * 0.7 : -0.35 - Math.random() * 0.7
          const speed = 10 + Math.random() * 14
          bits.push({ x: side ? canvas.width : 0, y: canvas.height * 0.75, vx: Math.cos(angle) * speed * (side ? 1 : 1), vy: -Math.abs(Math.sin(angle) * speed) - 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: colors[i % colors.length], s: 8 + Math.random() * 8, life: 240 })
        }
      }
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(loop)
    }

    const off = on('confetti', burst)
    return () => {
      off()
      cancelAnimationFrame(raf)
    }
  }, [])

  return <canvas ref={canvasRef} className="confetti" aria-hidden="true" />
}
