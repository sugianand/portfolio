import { useEffect, useState, type ReactNode } from 'react'
import { profile } from '../data'
import { scrollToId } from '../lib/store'

export type NavItem = { id: string; label: string }

export function Nav({ items, extra }: { items: NavItem[]; extra?: ReactNode }) {
  const [active, setActive] = useState('')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? window.scrollY / max : 0)
      let current = ''
      for (const item of items) {
        const el = document.getElementById(item.id)
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) current = item.id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [items])

  return (
    <header className="nav">
      <div className="nav-progress" style={{ transform: `scaleX(${progress})` }} />
      <a className="wordmark" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }} data-cursor="top">
        {profile.short}<span>/</span>26
      </a>
      <nav className="nav-links" aria-label="Sections">
        {items.map((item, i) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={active === item.id ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); scrollToId(item.id) }}
          >
            <span>0{i + 1}</span>{item.label}
          </a>
        ))}
      </nav>
      <div className="nav-extra">{extra}</div>
    </header>
  )
}
