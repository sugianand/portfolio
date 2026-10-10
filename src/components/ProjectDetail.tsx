import { useEffect, useRef, type ReactNode } from 'react'
import { projects, type Project } from '../data'
import { ArchDiagram } from './ArchDiagram'
import { CineDNADemo } from './CineDNADemo'
import { unlock } from '../lib/store'
import { ProjectLink } from './Projects'

type Block = { title: string; body: ReactNode }

function sections(p: Project): Block[] {
  const list = (items: string[], alt = false) => <ul className={`detail-list ${alt ? 'detail-list-alt' : ''}`}>{items.map((x) => <li key={x}>{x}</li>)}</ul>
  const blocks: (Block | null)[] = [
    { title: 'The problem', body: <p>{p.problem}</p> },
    { title: 'The solution', body: <p>{p.overview}</p> },
    p.id === 'cinedna' ? { title: 'Try it', body: <CineDNADemo /> } : null,
    p.architecture ? { title: 'Architecture', body: <><p className="detail-hint">Hover, tap, or tab through the components.</p><ArchDiagram arch={p.architecture} /></> } : null,
    p.hardest ? { title: 'Hardest engineering problem', body: <p>{p.hardest}</p> } : null,
    p.built ? { title: 'What I built', body: list(p.built) } : null,
    { title: 'What it does', body: list(p.features) },
    { title: 'Lessons', body: list(p.challenges, true) },
    { title: 'Why I built it', body: <p>{p.why}</p> },
    p.next ? { title: 'What I\'d build next', body: list(p.next) } : null,
  ]
  return blocks.filter((b): b is Block => b !== null)
}

export function ProjectDetail({ project, onClose, onNav }: { project: Project; onClose: () => void; onNav: (dir: 1 | -1) => void }) {
  const index = projects.indexOf(project)
  const sheetRef = useRef<HTMLElement>(null)

  useEffect(() => {
    unlock('casestudy')
    const previous = document.activeElement as HTMLElement | null
    sheetRef.current?.focus({ preventScroll: true })
    return () => previous?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea')) return
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
          {project.metrics && (
            <dl className="detail-metrics">
              {project.metrics.map((m) => <div key={m.label}><dt>{m.value}</dt><dd>{m.label}</dd></div>)}
            </dl>
          )}
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
            {sections(project).map((b, i) => (
              <section key={b.title}>
                <h3 className="mono detail-h"><span>{String(i + 1).padStart(2, '0')}</span> {b.title}</h3>
                {b.body}
              </section>
            ))}
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
