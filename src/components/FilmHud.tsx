import { useEffect, useRef } from 'react'

/** Decorative: a filmstrip rail that rolls with the page. */
export function FilmHud() {
  const rail = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
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
  }, [])

  return (
    <div className="film-hud" aria-hidden="true">
      <div className="film-rail" ref={rail} />
    </div>
  )
}
