import { lazy, Suspense, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { projects, type Category, type Project } from '../data'
import { scrollToId } from '../lib/store'
import { miniTopology } from '../lib/topology'
import { Reveal } from './effects'
import { ProjectIcon } from './ProjectIcon'
import { SectionHead } from './Sections'

const FILTERS: ('All' | Category)[] = ['All', 'AI', 'Backend', 'Full Stack', 'Realtime', 'Games']
const HASH = '#project/'

// The case-study dialog is split into its own chunk and prefetched on hover or focus.
const loadDetail = () => import('./ProjectDetail')
const ProjectDetail = lazy(() => loadDetail().then((m) => ({ default: m.ProjectDetail })))
// Previews (and the CineDNA engine they run) sit below the fold, so they load as their own chunk.
const ProductPreview = lazy(() => import('./ProductPreview').then((m) => ({ default: m.ProductPreview })))

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

function FeaturedCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <article className={`fcard tone-${project.tone}`}>
      <button type="button" className="pcard-hit" onClick={onOpen} onPointerEnter={loadDetail} onFocus={loadDetail} aria-label={`Read the ${project.title} case study`} data-cursor="read" />
      <div className="fcard-preview"><Suspense fallback={<div className="pv pv-placeholder" aria-hidden="true" />}><ProductPreview id={project.id} /></Suspense></div>
      <div className="fcard-copy">
        <p className="pcard-top mono"><span>{project.kind}</span><span>{project.year}</span></p>
        <div className="ptitle"><ProjectIcon id={project.id} /><h3>{project.title}</h3></div>
        <p className="pcard-tagline">{project.tagline}</p>
        <p className="pcard-body">{project.body}</p>
        {project.metrics && (
          <dl className="fcard-metrics">
            {project.metrics.slice(0, 3).map((m) => (
              <div key={m.label}><dt>{m.value}</dt><dd>{m.label}</dd></div>
            ))}
          </dl>
        )}
        <div className="pcard-foot mono">
          <span className="pcard-cta">Read case study →</span>
          <span className="pcard-links">{project.links.map((l) => <ProjectLink key={l.label} link={l} />)}</span>
        </div>
      </div>
    </article>
  )
}

/** A tiny, decorative sketch of the project's architecture (or its loop, when it has none). */
function CardGlyph({ project }: { project: Project }) {
  const w = 112
  const h = 36
  if (!project.architecture) {
    return (
      <svg className="ccard-glyph" viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
        <circle className="glyph-edge" cx={h / 2} cy={h / 2} r={12} fill="none" />
        <circle className="glyph-node glyph-lead" cx={h / 2} cy={h / 2 - 12} r={3.5} />
      </svg>
    )
  }
  const { nodes, edges } = miniTopology(project.architecture, w, h)
  return (
    <svg className="ccard-glyph" viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      {edges.map((e) => <line key={e.key} className="glyph-edge" x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} />)}
      {nodes.map((n) => <circle key={n.id} className={`glyph-node${n.tier === 0 ? ' glyph-lead' : ''}`} cx={n.x} cy={n.y} r={3.5} />)}
    </svg>
  )
}

function CompactCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <article className="ccard">
      <button type="button" className="pcard-hit" onClick={onOpen} onPointerEnter={loadDetail} onFocus={loadDetail} aria-label={`Read the ${project.title} case study`} data-cursor="read" />
      <CardGlyph project={project} />
      <p className="pcard-top mono"><span>{project.kind}</span><span>{project.year}</span></p>
      <div className="ptitle"><ProjectIcon id={project.id} /><h3>{project.title}</h3></div>
      <p className="pcard-body">{project.body}</p>
      <div className="pcard-stack mono">{project.stack.slice(0, 4).map((s) => <span key={s}>{s}</span>)}</div>
      <div className="pcard-foot mono">
        <span className="pcard-cta">Case study →</span>
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

  const match = (p: Project) => filter === 'All' || p.categories.includes(filter)
  const featured = projects.filter((p) => p.featured && match(p))
  const more = projects.filter((p) => !p.featured && match(p))

  return (
    <section className="section projects" id="projects">
      <SectionHead index="02" kicker="Projects" title="Proof over" accent="promises." note="Real systems with real constraints. Open one for the architecture and the hard parts." />
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
      {featured.length > 0 && (
        <div className="fgrid">
          {featured.map((p) => <FeaturedCard key={p.id} project={p} onOpen={() => show(p)} />)}
        </div>
      )}
      {more.length > 0 && (
        <>
          <p className="more-label mono">More projects</p>
          <div className="cgrid">
            {more.map((p) => <CompactCard key={p.id} project={p} onOpen={() => show(p)} />)}
          </div>
        </>
      )}
      {open && createPortal(<Suspense fallback={null}><ProjectDetail project={open} onClose={() => show(null)} onNav={nav} /></Suspense>, document.body)}
    </section>
  )
}
