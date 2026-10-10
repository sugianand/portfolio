import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { profile, projects, roles, stats } from '../data'
import { copyEmail, on, scrollToId } from '../lib/store'

const HASH = '#recruiter'

const clearHash = () => {
  if (window.location.hash === HASH) window.history.replaceState(null, '', window.location.pathname + window.location.search)
}

const CORE_STACK = [
  ['Languages', 'Python, TypeScript, Java, C#, JavaScript, SQL'],
  ['AI / Retrieval', 'Ranking and recommendation, LLM API integration, retrieval'],
  ['Backend', 'FastAPI, Django/DRF, Express, Cloudflare Workers'],
  ['Frontend', 'React, Next.js, WebGL, Canvas'],
  ['Data & Infra', 'PostgreSQL (Supabase), MySQL, D1/SQLite, Docker, GitHub Actions'],
]

/** A one-screen summary for someone with 60 seconds. Opens via the hero, nav, ⌘K, `r`, or #recruiter. */
export function RecruiterView() {
  const [open, setOpen] = useState(() => window.location.hash === HASH)
  const boxRef = useRef<HTMLDivElement>(null)
  const close = () => {
    setOpen(false)
    clearHash()
  }

  useEffect(() => {
    const show = () => setOpen(true)
    const onHash = () => setOpen(window.location.hash === HASH)
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'r' || e.metaKey || e.ctrlKey || e.altKey) return
      if ((e.target as HTMLElement).closest('input, textarea, [contenteditable]')) return
      if (document.querySelector('[aria-modal="true"]')) return
      setOpen(true)
    }
    const off = on('recruiter', show)
    window.addEventListener('hashchange', onHash)
    window.addEventListener('keydown', onKey)
    return () => {
      off()
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    boxRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      clearHash()
    }
    window.addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
      previous?.focus({ preventScroll: true })
    }
  }, [open])

  const openCase = (id: string) => {
    close()
    window.setTimeout(() => { window.location.hash = `project/${id}` }, 0)
  }

  if (!open) return null
  const top = projects.filter((p) => p.featured)
  const recent = roles.filter((r) => r.date !== 'now').slice(0, 4)

  return createPortal(
    <div className="rv" role="dialog" aria-modal="true" aria-labelledby="rv-title" onClick={close}>
      <div className="rv-box" ref={boxRef} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <header className="rv-head">
          <div>
            <p className="mono rv-kicker">60-second overview</p>
            <h2 id="rv-title">{profile.name} <span>(Sugi)</span></h2>
            <p className="rv-headline">{profile.headline} · {profile.location}</p>
          </div>
          <button type="button" className="mono rv-close" onClick={close} aria-label="Close overview">esc ✕</button>
        </header>

        <div className="rv-actions">
          <a className="chip chip-solid" href={profile.resume} target="_blank" rel="noreferrer">Resume ↗</a>
          <button type="button" className="chip" onClick={() => copyEmail(profile.email)}>{profile.email}</button>
          <a className="chip" href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a>
          <a className="chip" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
        </div>

        <div className="rv-grid">
          <section>
            <h3 className="mono">Looking for</h3>
            <p className="rv-strong">{profile.targets.join(' · ')}</p>
            <p>{profile.availability}</p>
          </section>
          <section>
            <h3 className="mono">Education</h3>
            {profile.education.map((e) => <p key={e.degree}><b>{e.degree}</b><br />{e.school} · {e.when}</p>)}
          </section>

          <section className="rv-wide">
            <h3 className="mono">Top projects</h3>
            <ul className="rv-projects">
              {top.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => openCase(p.id)}>
                    <b>{p.title}</b>
                    <span>{p.body}</span>
                    {p.metrics && <em className="mono">{p.metrics.slice(0, 2).map((m) => `${m.value} ${m.label}`).join(' · ')}</em>}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mono">Recent experience</h3>
            <ul className="rv-roles">
              {recent.map((r) => <li key={r.hash}><b>{r.title}</b><span>{r.org} · {r.date}</span></li>)}
            </ul>
          </section>
          <section>
            <h3 className="mono">Core stack</h3>
            <dl className="rv-stack">
              {CORE_STACK.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </section>

          <section className="rv-wide">
            <h3 className="mono">By the numbers</h3>
            <dl className="rv-stats">
              {stats.map((s) => <div key={s.label}><dt>{s.decimals ? s.value.toFixed(s.decimals) : s.value}{s.suffix}</dt><dd>{s.label}</dd></div>)}
            </dl>
          </section>
        </div>

        <footer className="rv-foot mono">
          <span>Want the full story? The site has case studies, architecture diagrams, and a live CineDNA demo.</span>
          <button type="button" onClick={() => { close(); scrollToId('projects') }}>Explore projects →</button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
