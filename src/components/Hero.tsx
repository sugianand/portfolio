import { useEffect, useState } from 'react'
import { profile } from '../data'
import { scrollToId } from '../lib/store'
import { useInView } from '../lib/useInView'
import { Clock, Scramble } from './effects'
import { ParticleName } from './ParticleName'

const ALIASES = ['Sugi', 'SA', 'sugianand', 'the one who reads the logs', 'root-cause enthusiast', 'edge-case collector', 'professional debugger']

/** Cycles while on screen; stays on the first alias for reduced motion. */
function Aliases() {
  const [ref, inView] = useInView<HTMLParagraphElement>(0.2, false)
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (!inView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % ALIASES.length), 2600)
    return () => window.clearInterval(id)
  }, [inView])
  return (
    <p ref={ref} className="aka mono" aria-label={`Also known as ${ALIASES.join(', ')}`}>
      <span>a.k.a.</span>
      <b aria-hidden="true"><Scramble key={index} text={ALIASES[index]} /></b>
    </p>
  )
}

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-meta mono">
        <span><i className="dot" /> Open to AI, backend &amp; full-stack roles</span>
        <span>{profile.location} · <Clock timeZone={profile.timezone} /></span>
      </div>

      <ParticleName />
      <Aliases />

      <div className="hero-foot">
        <div className="hero-copy">
          <p className="hero-role">{profile.headline}</p>
          <p className="hero-intro">
            M.S. in AI at Wayne State. I build <em>ranking and retrieval systems</em>, <em className="nowrap">real-time backends</em>, and <span className="nowrap">full-stack</span> products.
          </p>
        </div>
        <div className="hero-actions mono">
          <button type="button" className="chip chip-solid" onClick={() => scrollToId('projects')} data-cursor="go">View projects ↓</button>
          <a className="chip" href={profile.resume} target="_blank" rel="noreferrer">Resume ↗</a>
        </div>
      </div>
    </section>
  )
}
