import { useCallback, useEffect, useRef, useState } from 'react'
import { cycleAccent, emit, on, unlock } from '../lib/store'

// The palette and shortcuts dialogs load on first open (and once the page is idle, so that
// first open is instant); only the shortcuts that open them ship with the first paint.
// No lazy()/Suspense here: React throttles a Suspense reveal by ~300ms, which ⌘K would feel.
type Dialogs = typeof import('./OverlayDialogs')
let dialogs: Dialogs | null = null
const loadDialogs = () => import('./OverlayDialogs').then((m) => (dialogs = m))

/** The dialogs module once it has loaded, or null; loading starts the first time `open` is true. */
const useDialogs = (open: boolean) => {
  const [, setReady] = useState(Boolean(dialogs))
  useEffect(() => {
    if (open && !dialogs) loadDialogs().then(() => setReady(true))
  }, [open])
  return open ? dialogs : null
}

export function CommandPalette({ onAchievements }: { onAchievements: () => void }) {
  const [isOpen, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest('input, textarea')
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    const off = on('palette', () => setOpen(true))
    const idle = window.setTimeout(loadDialogs, 2500)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(idle)
      off()
    }
  }, [])

  const ui = useDialogs(isOpen)
  return ui && <ui.PaletteDialog onClose={close} onAchievements={onAchievements} />
}

export function Shortcuts() {
  const [isOpen, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest('input, textarea, [contenteditable]')
      if (e.key === '?' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    const off = on('shortcuts', () => setOpen(true))
    return () => {
      window.removeEventListener('keydown', onKey)
      off()
    }
  }, [])

  const ui = useDialogs(isOpen)
  return ui && <ui.ShortcutsDialog onClose={close} />
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
      const css = getComputedStyle(document.documentElement)
      const colors = ['--accent', '--cream', '--green', '--blue', '--yellow'].map((v) => css.getPropertyValue(v).trim())
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
