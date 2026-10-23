import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { INTRO_KEY } from '../lib/intro'
import './TitleCard.css'
import { markBooted } from '../lib/store'

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
  { kind: 'eye', at: 4700, tone: 'gold', x: 47.5, y: 47.5, zoom: 1.5 },
  { kind: 'glyph', at: 5250, text: 'S', tone: 'gold', tilt: -28 },
  { kind: 'warp', at: 5700 },
  { kind: 'eye', at: 5950, tone: 'blue', x: 47.5, y: 47.5, zoom: 2.3 },
  { kind: 'glyph', at: 6450, text: 'U', tone: 'blue', tilt: 24 },
  { kind: 'eye', at: 6900, tone: 'red', x: 37.5, y: 47.5, zoom: 4 },
  { kind: 'glyph', at: 7350, text: 'G', tone: 'red', tilt: -20 },
  { kind: 'glyph', at: 7800, text: 'I', tone: 'gold', tilt: 18 },
  { kind: 'title', at: 8300 },
]
const END = 10000
// Where in the clip (ms) the turn begins; from here it plays at 0.4x.
const SLOWMO_AT = 2700

const STREAKS = Array.from({ length: 64 }, (_, i) => ({
  '--a': `${(i / 64) * 360 + Math.random() * 4}deg`,
  '--d': `${Math.random() * 280}ms`,
  '--l': `${18 + Math.random() * 34}vmax`,
}) as CSSProperties)

const EMBERS = Array.from({ length: 34 }, () => ({
  '--x': `${Math.random() * 100}%`,
  '--s': `${2 + Math.random() * 4}px`,
  '--d': `${-Math.random() * 1.6}s`,
  '--t': `${1.2 + Math.random() * 1.4}s`,
  '--drift': `${(Math.random() - 0.5) * 80}px`,
}) as CSSProperties)

const Embers = () => (
  <div className="tc-embers" aria-hidden="true">
    {EMBERS.map((style, i) => <i key={i} style={style} />)}
  </div>
)

function Block({ text, tone, className = '' }: { text: string; tone: Tone; className?: string }) {
  return (
    <span className={`tc-block tc-${tone} ${className}`} data-t={text} style={{ '--ext': extrude(tone) } as CSSProperties}>
      {text}
    </span>
  )
}

/** The title card itself. Boot decides whether it plays and only then loads this chunk. */
export function TitleCard() {
  const [shot, setShot] = useState(-1)
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let cancelled = false
    const timers: number[] = []
    const finish = () => {
      if (cancelled) return
      cancelled = true
      timers.forEach(clearTimeout)
      detach()
      try {
        sessionStorage.setItem(INTRO_KEY, '1')
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
      timers.push(window.setTimeout(() => { if (video.current) video.current.playbackRate = 0.4 }, SLOWMO_AT))
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
    // Detached as soon as the card ends, however it ends, so a click or scroll skip (or the
    // clip running out) doesn't leave the next key, like Esc in a dialog, to be swallowed.
    function detach() {
      window.removeEventListener('keydown', onKey, { capture: true })
      window.removeEventListener('pointerdown', finish)
      window.removeEventListener('wheel', finish)
    }
    window.addEventListener('keydown', onKey, { capture: true, once: true })
    window.addEventListener('pointerdown', finish, { once: true })
    window.addEventListener('wheel', finish, { once: true, passive: true })
    document.documentElement.style.overflow = 'hidden'
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      detach()
      document.documentElement.style.overflow = ''
    }
  }, [])

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
          <Embers />
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
          <Embers />
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
