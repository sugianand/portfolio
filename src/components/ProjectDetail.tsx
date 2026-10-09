import { useEffect, useRef } from 'react'
import { projects, type Project } from '../data'
import { ProjectLink } from './Projects'

export function ProjectDetail({ project, onClose, onNav }: { project: Project; onClose: () => void; onNav: (dir: 1 | -1) => void }) {
  const index = projects.indexOf(project)
  const sheetRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    sheetRef.current?.focus({ preventScroll: true })
    return () => previous?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNav(1)
      if (e.key === 'ArrowLeft') onNav(-1)
    }
    window.addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
    }
  }, [onClose, onNav])

  return (
    <div className="detail" role="dialog" aria-modal="true" aria-label={`${project.title} case study`} onClick={onClose}>
      <article className="detail-sheet" ref={sheetRef} tabIndex={-1} onClick={(e) => e.stopPropagation()} key={project.id}>
        <header className={`detail-hero tone-${project.tone}`}>
          <div className="detail-bar mono">
            <span>Case study {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
            <span className="detail-nav">
              <button type="button" onClick={() => onNav(-1)} aria-label="Previous project">←</button>
              <button type="button" onClick={() => onNav(1)} aria-label="Next project">→</button>
              <button type="button" onClick={onClose} aria-label="Close">esc ✕</button>
            </span>
          </div>
          <p className="detail-kind mono">{project.kind} · {project.year}</p>
          <h2>{project.title}</h2>
          <p className="detail-tagline">{project.tagline}</p>
          <div className="detail-links mono">{project.links.map((l) => <ProjectLink key={l.label} link={l} onInternal={onClose} />)}</div>
        </header>

        <div className="detail-body">
          <aside className="detail-facts">
            <dl>
              <div><dt className="mono">Role</dt><dd>{project.role}</dd></div>
              <div><dt className="mono">Status</dt><dd>{project.status}</dd></div>
              <div><dt className="mono">Year</dt><dd>{project.year}</dd></div>
              <div><dt className="mono">Stack</dt><dd className="detail-stack">{project.stack.map((s) => <span key={s} className="mono">{s}</span>)}</dd></div>
            </dl>
          </aside>
          <div className="detail-main">
            <section>
              <h4 className="mono"><span>01</span> Overview</h4>
              <p>{project.overview}</p>
            </section>
            <section>
              <h4 className="mono"><span>02</span> Why I built it</h4>
              <p>{project.why}</p>
            </section>
            <section>
              <h4 className="mono"><span>03</span> What it does</h4>
              <ul className="detail-list">{project.features.map((f) => <li key={f}>{f}</li>)}</ul>
            </section>
            <section>
              <h4 className="mono"><span>04</span> Challenges &amp; what I learned</h4>
              <ul className="detail-list detail-list-alt">{project.challenges.map((c) => <li key={c}>{c}</li>)}</ul>
            </section>
          </div>
        </div>

        <footer className="detail-foot">
          <button type="button" onClick={() => onNav(-1)} className="mono">← {projects[(index - 1 + projects.length) % projects.length].title}</button>
          <button type="button" onClick={() => onNav(1)} className="mono">{projects[(index + 1) % projects.length].title} →</button>
        </footer>
      </article>
    </div>
  )
}
