import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { projects, type Category, type Project } from '../data'
import { scrollToId } from '../lib/store'
import { Reveal } from './effects'
import { SectionHead } from './Sections'

const FILTERS: ('All' | Category)[] = ['All', 'AI', 'Full Stack', 'Realtime', 'Games']
const HASH = '#project/'

function ProjectLink({ link, onInternal }: { link: Project['links'][number]; onInternal?: () => void }) {
  if (link.href.startsWith('#')) {
    return (
      <a href={link.href} onClick={(e) => { e.preventDefault(); onInternal?.(); scrollToId(link.href.slice(1)) }}>
        {link.label} →
      </a>
    )
  }
  return <a href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>
}

function ProjectCard({ project, index, onOpen }: { project: Project; index: number; onOpen: () => void }) {
  return (
    <article className={`pcard tone-${project.tone}`}>
      <button type="button" className="pcard-hit" onClick={onOpen} aria-label={`Read the ${project.title} case study`} data-cursor="read" />
      <div className="pcard-top mono">
        <span>{String(index + 1).padStart(2, '0')} · {project.kind}</span>
        <span>{project.year}</span>
      </div>
      <div className="pcard-art" aria-hidden="true">
        <span className="art-glyph">{project.title[0]}</span>
        <span className="art-ring" />
        <span className="art-grid" />
      </div>
      <h3>{project.title}</h3>
      <p className="pcard-tagline">{project.tagline}</p>
      <p className="pcard-body">{project.body}</p>
      <div className="pcard-stack mono">{project.stack.slice(0, 4).map((s) => <span key={s}>{s}</span>)}</div>
      <div className="pcard-foot mono">
        <span className="pcard-cta">Read case study →</span>
        <span className="pcard-links">{project.links.map((l) => <ProjectLink key={l.label} link={l} />)}</span>
      </div>
    </article>
  )
}

function ProjectDetail({ project, onClose, onNav }: { project: Project; onClose: () => void; onNav: (dir: 1 | -1) => void }) {
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

const fromHash = () => {
  const id = window.location.hash.startsWith(HASH) ? window.location.hash.slice(HASH.length) : ''
  return projects.find((p) => p.id === id) ?? null
}

export function Projects() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')
  const [open, setOpen] = useState<Project | null>(fromHash)

  useEffect(() => {
    const onHash = () => setOpen(fromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const show = (project: Project | null) => {
    setOpen(project)
    const url = project ? `${HASH}${project.id}` : window.location.pathname + window.location.search
    window.history.replaceState(null, '', url)
  }

  const nav = (dir: 1 | -1) => {
    if (!open) return
    const i = projects.indexOf(open)
    show(projects[(i + dir + projects.length) % projects.length])
  }

  const shown = filter === 'All' ? projects : projects.filter((p) => p.categories.includes(filter))

  return (
    <section className="section projects" id="projects">
      <SectionHead index="02" kicker="Projects" title="Proof over" accent="promises." note="Things I've designed, built, and shipped. Click any project for the full story: what it is, why I built it, and what I learned." />
      <Reveal className="filters mono">
        {FILTERS.map((f) => {
          const count = f === 'All' ? projects.length : projects.filter((p) => p.categories.includes(f)).length
          return (
            <button key={f} type="button" className={filter === f ? 'active' : ''} onClick={() => setFilter(f)} aria-pressed={filter === f}>
              {f} <sup>{count}</sup>
            </button>
          )
        })}
      </Reveal>
      <div className="pgrid">
        {shown.map((p) => <ProjectCard key={p.id} project={p} index={projects.indexOf(p)} onOpen={() => show(p)} />)}
      </div>
      {open && createPortal(<ProjectDetail project={open} onClose={() => show(null)} onNav={nav} />, document.body)}
    </section>
  )
}
