import { useEffect, useRef } from 'react'
import type { NavItem } from './Nav'

// Scroll position read as a film: the page is a 2h08m reel at 24fps, each section is a scene.
const RUNTIME_S = 2 * 3600 + 8 * 60
const FPS = 24

const pad = (n: number) => String(n).padStart(2, '0')
const timecode = (fraction: number) => {
  const frames = Math.round(fraction * RUNTIME_S * FPS)
  const s = Math.floor(frames / FPS)
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(frames % FPS)}`
}

/** Decorative: a filmstrip rail that rolls with the page and a slate naming the current scene. */
export function FilmHud({ items }: { items: NavItem[] }) {
  const tc = useRef<HTMLSpanElement>(null)
  const scene = useRef<HTMLSpanElement>(null)
  const rail = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const fraction = max > 0 ? Math.min(1, window.scrollY / max) : 0
      let index = 0
      let label = 'Opening'
      items.forEach((item, i) => {
        const el = document.getElementById(item.id)
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) {
          index = i + 1
          label = item.label
        }
      })
      if (tc.current) tc.current.textContent = timecode(fraction)
      if (scene.current) scene.current.textContent = `SC ${pad(index)} · ${label}`
      if (rail.current) rail.current.style.setProperty('--roll', `${-window.scrollY * 0.6}px`)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [items])

  return (
    <div className="film-hud" aria-hidden="true">
      <div className="film-rail" ref={rail} />
      <div className="film-slate mono">
        <span className="film-rec">● REC</span>
        <span ref={scene} />
        <span ref={tc} className="film-tc" />
      </div>
    </div>
  )
}
