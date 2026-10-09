import { useState } from 'react'
import { profile, roles, skills, stats } from '../data'
import { copyEmail } from '../lib/store'
import { Clock, CountUp, Reveal, Scramble } from './effects'

export function Marquee({ words, reverse = false }: { words: string[]; reverse?: boolean }) {
  const row = [...words, ...words]
  return (
    <div className={`marquee ${reverse ? 'marquee-reverse' : ''}`} aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <span key={copy}>
            {row.map((w, i) => (
              <b key={`${copy}-${i}`}>{w}<i>✦</i></b>
            ))}
          </span>
        ))}
      </div>
    </div>
  )
}

export function Stats() {
  return (
    <section className="stats" aria-label="Quick numbers">
      {stats.map((s) => (
        <div key={s.label} className="stat">
          <strong><CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} /></strong>
          <span className="mono">{s.label}</span>
        </div>
      ))}
    </section>
  )
}

export function SectionHead({ index, kicker, title, accent, note }: { index: string; kicker: string; title: string; accent: string; note?: string }) {
  return (
    <Reveal className="section-head">
      <p className="kicker mono"><span>{index}</span> {kicker}</p>
      <h2>
        <Scramble text={title} /> <em><Scramble text={accent} /></em>
      </h2>
      {note && <p className="section-note">{note}</p>}
    </Reveal>
  )
}

export function GitLog() {
  const [open, setOpen] = useState<string | null>(roles[1].hash)

  return (
    <section className="section gitlog" id="log">
      <SectionHead index="02" kicker="Experience" title="git log" accent="--author=me" note="Every role is a commit. Click one to see the diff." />
      <Reveal className="terminal-frame">
        <div className="frame-bar mono">
          <span className="lights"><i /><i /><i /></span>
          <span>~/career — git log --graph --oneline</span>
          <span>{roles.length} commits</span>
        </div>
        <ol className="commits mono">
          {roles.map((role) => {
            const isOpen = open === role.hash
            return (
              <li key={role.hash} className={`commit ${isOpen ? 'open' : ''}`}>
                <button type="button" className="commit-head" onClick={() => setOpen(isOpen ? null : role.hash)} aria-expanded={isOpen} data-cursor={isOpen ? 'close' : 'diff'}>
                  <span className="graph">{isOpen ? '◉' : '●'}</span>
                  <span className="hash">{role.hash}</span>
                  {role.refs && <span className="refs">({role.refs})</span>}
                  <span className="type">{role.type}:</span>
                  <span className="msg">{role.title} <span className="at">@ {role.org}</span></span>
                  <span className="date">{role.date}</span>
                </button>
                <div className="commit-body">
                  <div>
                    <p className="diff-meta">Author: Suganeshwara Anand &lt;{profile.email}&gt;<br />Location: {role.place}</p>
                    <ul className="diff">
                      {role.diff.map((line) => <li key={line}><span>+</span>{line}</li>)}
                    </ul>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </Reveal>

      <Reveal className="skills">
        {Object.entries(skills).map(([group, list]) => (
          <div key={group} className="skill-group">
            <p className="mono">{group}</p>
            <div>{list.map((s) => <span key={s}>{s}</span>)}</div>
          </div>
        ))}
      </Reveal>
    </section>
  )
}

export function Contact() {
  return (
    <section className="section contact" id="contact">
      <p className="kicker mono"><span>05</span> Contact</p>
      <h2 className="contact-title">
        <Scramble text="Let's build" /><br /><em><Scramble text="something real." /></em>
      </h2>
      <div className="contact-row">
        <button type="button" className="contact-email" onClick={() => copyEmail(profile.email)} data-cursor="copy">
          {profile.email}<span className="mono">click to copy</span>
        </button>
        <div className="contact-links mono">
          <a href={`mailto:${profile.email}`}>Email ↗</a>
          <a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
          <a href={profile.resume} download="Suganeshwara-Anand-Resume.pdf">Resume ↓</a>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const built = new Date(__BUILD__.date)
  return (
    <footer className="footer mono">
      <span>© 2026 {profile.name}</span>
      <span>Detroit <Clock timeZone={profile.timezone} /></span>
      <a href={`${profile.source}/commit/${__BUILD__.hash}`} target="_blank" rel="noreferrer" title={__BUILD__.message}>
        build {__BUILD__.hash} · commit #{__BUILD__.count} · {built.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </a>
      <a href={profile.source} target="_blank" rel="noreferrer">View source ↗</a>
    </footer>
  )
}
