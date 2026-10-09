import { useEffect, useRef, type PointerEvent } from 'react'
import { profile, projects, type Project } from '../data'
import { scrollToId } from '../lib/store'
import { Scramble } from './effects'

function tilt(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== 'mouse') return
  const el = event.currentTarget
  const rect = el.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width - 0.5
  const y = (event.clientY - rect.top) / rect.height - 0.5
  el.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`)
  el.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`)
  el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`)
  el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`)
}

function untilt(event: PointerEvent<HTMLElement>) {
  const el = event.currentTarget
  el.style.setProperty('--rx', '0deg')
  el.style.setProperty('--ry', '0deg')
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article className={`project tone-${project.tone}`} onPointerMove={tilt} onPointerLeave={untilt}>
      <div className="project-inner">
        <div className="project-top mono">
          <span>{String(index + 1).padStart(2, '0')} / {project.kind}</span>
          <span>{project.year}</span>
        </div>
        <div className="project-art" aria-hidden="true">
          <span className="art-glyph">{project.title[0]}</span>
          <span className="art-ring" />
          <span className="art-ring art-ring-2" />
          <span className="art-grid" />
        </div>
        <div className="project-copy">
          <h3>{project.title}</h3>
          <p className="project-tagline">{project.tagline}</p>
          <p className="project-body">{project.body}</p>
        </div>
        <div className="project-foot">
          <div className="project-stack mono">{project.stack.map((s) => <span key={s}>{s}</span>)}</div>
          <div className="project-links mono">
            {project.links.map((link) =>
              link.href.startsWith('#') ? (
                <a key={link.label} href={link.href} onClick={(e) => { e.preventDefault(); scrollToId(link.href.slice(1)) }} data-cursor="play">{link.label} →</a>
              ) : (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer" data-cursor="open">{link.label} ↗</a>
              ),
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export function Work() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return
    const wide = window.matchMedia('(min-width: 821px)')
    let distance = 0
    let raf = 0

    const measure = () => {
      if (!wide.matches) {
        section.style.height = ''
        track.style.transform = ''
        return
      }
      distance = Math.max(0, track.scrollWidth - window.innerWidth)
      section.style.height = `${distance + window.innerHeight}px`
      update()
    }

    const update = () => {
      if (!wide.matches) return
      const top = section.getBoundingClientRect().top
      const p = Math.min(1, Math.max(0, -top / (distance || 1)))
      track.style.transform = `translate3d(${-p * distance}px, 0, 0)`
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    const resize = new ResizeObserver(measure)
    resize.observe(track)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    wide.addEventListener('change', measure)
    measure()
    return () => {
      resize.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
      wide.removeEventListener('change', measure)
    }
  }, [])

  return (
    <section className="work" id="work" ref={sectionRef}>
      <div className="work-sticky">
        <div className="work-track" ref={trackRef}>
          <div className="work-intro">
            <p className="kicker mono"><span>01</span> Selected work · 2024 to now</p>
            <h2><Scramble text="Proof" /><br /><Scramble text="over" /><br /><em><Scramble text="promises." /></em></h2>
            <p className="section-note">Things I&apos;ve designed, built, and shipped. Keep scrolling; the page moves sideways here.</p>
            <span className="work-hint mono">scroll →</span>
          </div>
          {projects.map((project, i) => <ProjectCard key={project.id} project={project} index={i} />)}
          <a className="work-outro" href={`${profile.github}?tab=repositories`} target="_blank" rel="noreferrer" data-cursor="open">
            <span className="mono">More in the archive</span>
            <strong>All repos<br />on GitHub ↗</strong>
          </a>
        </div>
        <div className="work-progress"><span ref={barRef} /></div>
      </div>
    </section>
  )
}
