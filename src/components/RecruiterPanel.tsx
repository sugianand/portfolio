import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { profile, projects, roles, stats } from '../data'
import { trapTab } from '../lib/focusTrap'
import { copyEmail, scrollToId, unlock } from '../lib/store'
import { ProjectIcon } from './ProjectIcon'

const CORE_STACK = [
  ['Languages', 'Python, TypeScript, Java, C#, JavaScript, SQL'],
  ['AI / Retrieval', 'Ranking and recommendation, LLM API integration, retrieval'],
  ['Backend', 'FastAPI, Django/DRF, Express, Cloudflare Workers'],
  ['Frontend', 'React, Next.js, WebGL, Canvas'],
  ['Data & Infra', 'PostgreSQL (Supabase), MySQL, D1/SQLite, Docker, GitHub Actions'],
]

/** The summary itself. Mounted only while open, so it loads as its own chunk on first use. */
export function RecruiterPanel({ onClose: close }: { onClose: () => void }) {
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    unlock('recruiter')
    const previous = document.activeElement as HTMLElement | null
    boxRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      trapTab(e, boxRef.current)
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
      previous?.focus({ preventScroll: true })
    }
  }, [close])

  const openCase = (id: string) => {
    close()
    window.setTimeout(() => { window.location.hash = `project/${id}` }, 0)
  }

  const top = projects.filter((p) => p.featured)
  const recent = roles.filter((r) => r.date !== 'now').slice(0, 4)

  return createPortal(
    <div className="rv" role="dialog" aria-modal="true" aria-labelledby="rv-title" onClick={close}>
      <div className="rv-box" ref={boxRef} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <div className="rv-head">
          <div>
            <p className="mono rv-kicker">Quick summary</p>
            <h2 id="rv-title">{profile.name} <span>(Sugi)</span></h2>
            <p className="rv-headline">{profile.headline} · {profile.location}</p>
          </div>
          <button type="button" className="mono rv-close" onClick={close} aria-label="Esc, close summary">esc ✕</button>
        </div>

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
                    <span className="ptitle"><ProjectIcon id={p.id} /><b>{p.title}</b></span>
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

        <div className="rv-foot mono">
          <span>Want the full story? The site has case studies, architecture diagrams, and a live CineDNA demo.</span>
          <button type="button" onClick={() => { close(); scrollToId('projects') }}>Explore projects →</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
