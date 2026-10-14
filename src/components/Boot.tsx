import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { shouldPlayIntro } from '../lib/intro'
import { markBooted } from '../lib/store'

// Plays once per browser session (new tab or new visit), not on every reload within it.
const KEY = 'sa26:titlecard'

const shouldBoot = () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let seen = false
  try {
    seen = sessionStorage.getItem(KEY) === '1'
  } catch {
    /* storage blocked: play it */
  }
  return shouldPlayIntro({ reducedMotion, seen, hash: window.location.hash })
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

const FACE = `${import.meta.env.BASE_URL}titlecard/sugi-face.jpg`
const WALK = `${import.meta.env.BASE_URL}titlecard/sugi-walk.mp4`
const WALK_POSTER = `${import.meta.env.BASE_URL}titlecard/sugi-walk.jpg`

type Shot =
  | { kind: 'film' | 'warp' | 'title'; at: number }
  | { kind: 'glyph'; at: number; text: string; tone: Tone; tilt: number }
  | { kind: 'eye'; at: number; tone: Tone; x: number; y: number; zoom: number }

// The title card, in beats (ms from start). Opens on Sugi's walk-away clip, then eye close-ups
// from the selfie cut hard against block letters. Eye x/y is the focus point (% of FACE).
const SHOTS: Shot[] = [
  { kind: 'film', at: 0 },
  { kind: 'eye', at: 3600, tone: 'gold', x: 47.5, y: 47.5, zoom: 1.5 },
  { kind: 'glyph', at: 4150, text: 'S', tone: 'gold', tilt: -28 },
  { kind: 'warp', at: 4600 },
  { kind: 'eye', at: 4850, tone: 'blue', x: 47.5, y: 47.5, zoom: 2.3 },
  { kind: 'glyph', at: 5350, text: 'U', tone: 'blue', tilt: 24 },
  { kind: 'eye', at: 5800, tone: 'red', x: 37.5, y: 47.5, zoom: 4 },
  { kind: 'glyph', at: 6250, text: 'G', tone: 'red', tilt: -20 },
  { kind: 'glyph', at: 6700, text: 'I', tone: 'gold', tilt: 18 },
  { kind: 'title', at: 7200 },
]
const END = 8900

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
  const video = useRef<HTMLVideoElement>(null)

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

    // Wait briefly for the font, face photo and clip so nothing pops in half-loaded.
    const fonts = Promise.all([
      document.fonts?.load('400 100px "Archivo Black"', 'SUGI'),
      new Promise((resolve) => {
        const img = new Image()
        img.onload = img.onerror = resolve
        img.src = FACE
      }),
      new Promise((resolve) => {
        const v = video.current
        if (!v || v.readyState >= 4) return resolve(undefined)
        v.addEventListener('canplaythrough', resolve, { once: true })
        v.addEventListener('error', resolve, { once: true })
      }),
    ]).catch(() => undefined)
    Promise.race([fonts, new Promise((r) => setTimeout(r, 1500))]).then(() => {
      if (cancelled) return
      video.current?.play().catch(() => undefined)
      SHOTS.forEach((s, i) => timers.push(window.setTimeout(() => setShot(i), s.at)))
      timers.push(window.setTimeout(finish, END))
    })

    // The skip key is consumed so it doesn't also fire a site shortcut (/, r, ?) underneath.
    // Browser chords (reload, devtools) pass through untouched.
    const onKey = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        e.stopPropagation()
      }
      finish()
    }
    window.addEventListener('keydown', onKey, { capture: true, once: true })
    window.addEventListener('pointerdown', finish, { once: true })
    window.addEventListener('wheel', finish, { once: true, passive: true })
    document.documentElement.style.overflow = 'hidden'
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      window.removeEventListener('keydown', onKey, { capture: true })
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
      {shot <= 0 && (
        <div className={`tc-film ${shot === 0 ? 'is-on' : ''}`} aria-hidden="true">
          <img className="tc-film-bg" src={WALK_POSTER} alt="" />
          <video ref={video} src={WALK} poster={WALK_POSTER} muted playsInline preload="auto" />
        </div>
      )}

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

      {current?.kind === 'eye' && (
        <div key={shot} className={`tc-eye tc-eye-${current.tone}`} aria-hidden="true">
          <img src={FACE} alt="" style={{ '--x': `${current.x}%`, '--y': `${current.y}%`, '--zoom': current.zoom } as CSSProperties} />
        </div>
      )}

      {current?.kind === 'title' && (
        <div key={shot} className="tc-card">
          <span className="tc-kicker">Suganeshwara Anand</span>
          <Block text="SUGI" tone="gold" className="tc-name tc-shine" />
          <span className="tc-flare" />
        </div>
      )}

      {shot > 0 && <span key={`flash-${shot}`} className="tc-flash" aria-hidden="true" />}
      <span className="tc-grain" aria-hidden="true" />
      <p className="tc-skip mono">click or press any key to skip</p>
    </div>
  )
}
