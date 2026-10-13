import { useEffect, useState, type CSSProperties } from 'react'
import { markBooted } from '../lib/store'

// Plays once per browser session (new tab or new visit), not on every reload within it.
const KEY = 'sa26:titlecard'

const shouldBoot = () => {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    return sessionStorage.getItem(KEY) !== '1'
  } catch {
    return true
  }
}

type Tone = 'gold' | 'blue' | 'red'

/** Stacked shadows that fake a solid extruded block behind each glyph. */
const SIDES: Record<Tone, [string, string]> = {
  gold: ['#7a4d12', '#1c0f02'],
  blue: ['#0d3f8f', '#020a1c'],
  red: ['#7a0b06', '#160101'],
}
const extrude = (tone: Tone, depth = 18) => {
  const [near, far] = SIDES[tone]
  return Array.from({ length: depth }, (_, i) => `${(i + 1) * 0.004}em ${(i + 1) * 0.004}em 0 ${i < depth / 2 ? near : far}`).join(', ')
}

// The title card, in beats (ms from start). Each beat is one shot.
const SHOTS = [
  { kind: 'warp', at: 0 },
  { kind: 'glyph', at: 650, text: 'S', tone: 'gold', tilt: -28 },
  { kind: 'glyph', at: 1300, text: 'U', tone: 'blue', tilt: 24 },
  { kind: 'glyph', at: 1950, text: 'G', tone: 'red', tilt: -20 },
  { kind: 'glyph', at: 2600, text: 'I', tone: 'gold', tilt: 18 },
  { kind: 'tamil', at: 3250 },
  { kind: 'title', at: 4150 },
] as const
const END = 5700

const STREAKS = Array.from({ length: 64 }, (_, i) => ({
  '--a': `${(i / 64) * 360 + Math.random() * 4}deg`,
  '--d': `${Math.random() * 280}ms`,
  '--l': `${18 + Math.random() * 34}vmax`,
}) as CSSProperties)

function Block({ text, tone, className = '' }: { text: string; tone: Tone; className?: string }) {
  return (
    <span className={`tc-block tc-${tone} ${className}`} data-t={text} style={{ '--ext': extrude(tone) } as CSSProperties}>
      {text}
    </span>
  )
}

export function Boot() {
  const [active] = useState(shouldBoot)
  const [shot, setShot] = useState(-1)
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(!active)

  useEffect(() => {
    if (!active) {
      markBooted()
      return
    }
    let cancelled = false
    const timers: number[] = []
    const finish = () => {
      if (cancelled) return
      cancelled = true
      timers.forEach(clearTimeout)
      try {
        sessionStorage.setItem(KEY, '1')
      } catch {
        /* ignore */
      }
      setLeaving(true)
      markBooted()
      window.setTimeout(() => setGone(true), 900)
    }

    // Wait briefly for the display fonts so the first letter doesn't pop in as a fallback face.
    const fonts = Promise.all([
      document.fonts?.load('400 100px "Archivo Black"', 'SUGI'),
      document.fonts?.load('900 100px "Catamaran"', 'சுகி'),
    ]).catch(() => undefined)
    Promise.race([fonts, new Promise((r) => setTimeout(r, 700))]).then(() => {
      if (cancelled) return
      SHOTS.forEach((s, i) => timers.push(window.setTimeout(() => setShot(i), s.at)))
      timers.push(window.setTimeout(finish, END))
    })

    window.addEventListener('keydown', finish, { once: true })
    window.addEventListener('pointerdown', finish, { once: true })
    window.addEventListener('wheel', finish, { once: true, passive: true })
    document.documentElement.style.overflow = 'hidden'
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      window.removeEventListener('keydown', finish)
      window.removeEventListener('pointerdown', finish)
      window.removeEventListener('wheel', finish)
      document.documentElement.style.overflow = ''
    }
  }, [active])

  useEffect(() => {
    if (leaving) document.documentElement.style.overflow = ''
  }, [leaving])

  if (gone) return null

  const current = SHOTS[shot]

  return (
    <div className={`boot tc ${leaving ? 'boot-leave' : ''}`} role="status" aria-label="Loading Sugi's portfolio">
      {current?.kind === 'warp' && (
        <div className="tc-warp" aria-hidden="true">
          {STREAKS.map((style, i) => <span key={i} style={style} />)}
        </div>
      )}

      {current?.kind === 'glyph' && (
        <div key={shot} className={`tc-shot tc-glow-${current.tone}`} style={{ '--tilt': `${current.tilt}deg` } as CSSProperties} aria-hidden="true">
          <Block text={current.text} tone={current.tone} className="tc-giant" />
        </div>
      )}

      {current?.kind === 'tamil' && (
        <div key={shot} className="tc-card tc-card-tamil" aria-hidden="true">
          <Block text="சுகி" tone="gold" className="tc-name tc-tamil" />
          <span className="tc-flare" />
        </div>
      )}

      {current?.kind === 'title' && (
        <div key={shot} className="tc-card">
          <span className="tc-kicker">Suganeshwara Anand</span>
          <Block text="SUGI" tone="gold" className="tc-name tc-shine" />
          <span className="tc-flare" />
        </div>
      )}

      <span className="tc-grain" aria-hidden="true" />
      <p className="tc-skip mono">click or press any key to skip</p>
    </div>
  )
}
