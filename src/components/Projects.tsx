import { lazy, Suspense, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { projects, type Category, type Project } from '../data'
import { scrollToId } from '../lib/store'
import { Reveal } from './effects'
import { SectionHead } from './Sections'

const FILTERS: ('All' | Category)[] = ['All', 'AI', 'Full Stack', 'Realtime', 'Games']
const HASH = '#project/'

// The case-study dialog is split into its own chunk and prefetched on hover or focus.
const loadDetail = () => import('./ProjectDetail')
const ProjectDetail = lazy(() => loadDetail().then((m) => ({ default: m.ProjectDetail })))

export function ProjectLink({ link, onInternal }: { link: Project['links'][number]; onInternal?: () => void }) {
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
      <button type="button" className="pcard-hit" onClick={onOpen} onPointerEnter={loadDetail} onFocus={loadDetail} aria-label={`Read the ${project.title} case study`} data-cursor="read" />
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
      {open && createPortal(<Suspense fallback={null}><ProjectDetail project={open} onClose={() => show(null)} onNav={nav} /></Suspense>, document.body)}
    </section>
  )
}
