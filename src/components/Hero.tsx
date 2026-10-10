import { useEffect, useState } from 'react'
import { profile } from '../data'
import { emit, scrollToId } from '../lib/store'
import { Clock, Scramble } from './effects'
import { ParticleName } from './ParticleName'

const ALIASES = ['Sugi', 'SA', 'sugianand', 'the one who reads the logs', 'root-cause enthusiast', 'edge-case collector', 'professional debugger']

function Aliases() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % ALIASES.length), 2600)
    return () => window.clearInterval(id)
  }, [])
  return (
    <p className="aka mono" aria-label={`Also known as ${ALIASES.join(', ')}`}>
      <span>a.k.a.</span>
      <b aria-hidden="true"><Scramble key={index} text={ALIASES[index]} /></b>
      <span className="aka-count hide-sm" aria-hidden="true">psst: click the name</span>
    </p>
  )
}

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-meta mono">
        <span><i className="dot" /> Open to AI, backend &amp; full-stack roles</span>
        <span>{profile.location} · <Clock timeZone={profile.timezone} /></span>
        <span className="hide-sm">42.33°N 83.05°W</span>
      </div>

      <ParticleName />
      <Aliases />

      <div className="hero-foot">
        <div className="hero-copy">
          <p className="hero-role">{profile.headline}</p>
          <p className="hero-intro">
            M.S. in AI at Wayne State, B.S. in CS. I build <em>ranking and retrieval systems</em>, <em>real-time multiplayer backends</em>, and full-stack products, and I ship them with tests.
          </p>
          <p className="hero-targets mono">{profile.targets.join(' · ')} — {profile.availability.toLowerCase()}</p>
        </div>
        <div className="hero-actions mono">
          <button type="button" className="chip chip-solid" onClick={() => emit('recruiter')}>60-second overview</button>
          <button type="button" className="chip" onClick={() => scrollToId('projects')} data-cursor="go">View projects ↓</button>
          <a className="chip" href={profile.resume} target="_blank" rel="noreferrer">Resume ↗</a>
          <button type="button" className="chip" onClick={() => scrollToId('contact')}>Contact</button>
        </div>
      </div>
    </section>
  )
}
