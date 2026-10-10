import { useState } from 'react'
import { evidenceLabels, profile, projects, skillGroups, stats } from '../data'
import { CountUp, Reveal } from './effects'
import { SectionHead } from './Sections'

const facts = [
  ['Studying', "M.S. Artificial Intelligence, Wayne State"],
  ['Degree', 'B.S. Computer Science, minor in Mathematics'],
  ['Based in', profile.location],
  ['Currently', 'Student Assistant at WSU C&IT · Peer Technical Mentor'],
  ['Previously', 'QA at Accurate Technologies · Backend at NeverEnding'],
  ['Looking for', 'AI, ML, backend, and full-stack roles; internships and co-ops'],
]

export function About() {
  return (
    <section className="section about" id="about">
      <SectionHead index="01" kicker="About" title="Curious enough to ask why." accent="Practical enough to ship." />
      <div className="about-grid">
        <Reveal className="about-copy">
          <p className="about-lead">
            I&apos;m Suganeshwara, or <em>Sugi</em>. I&apos;m a computer scientist from Wayne State, now working on a master&apos;s in Artificial Intelligence.
          </p>
          <p>
            I like the hard middle of a problem: the edge cases, the architecture, and the moment a rough idea becomes something real. I&apos;ve tested embedded automotive software, built Django and Java backends for financial products, imaged hundreds of machines with a portal I wrote, and taught students to build games.
          </p>
          <p>
            Right now I&apos;m building CineDNA, a natural-language movie recommender, and Movie in Three Clues, a real-time multiplayer game on Cloudflare Workers, alongside graduate AI coursework.
          </p>
          <div className="about-actions mono">
            <a className="chip chip-solid" href={profile.resume} target="_blank" rel="noreferrer">Resume ↗</a>
            <a className="chip" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
            <a className="chip" href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a>
          </div>
        </Reveal>
        <Reveal className="facts" delay={120}>
          <dl>
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="mono">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      <div className="stats">
        {stats.map((s) => (
          <div key={s.label} className="stat">
            <strong><CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} /></strong>
            <span className="mono">{s.label}</span>
          </div>
        ))}
      </div>

      <SkillMap />
    </section>
  )
}

const evidenceName = (key: string) => projects.find((p) => p.id === key)?.title ?? evidenceLabels[key] ?? key

/** Skills grouped by area; selecting one shows where it is actually used. */
function SkillMap() {
  const [active, setActive] = useState<string | null>(null)
  const item = skillGroups.flatMap((g) => g.items).find((i) => i.name === active)

  return (
    <Reveal className="skillmap">
      <div className="skills">
        {skillGroups.map((g) => (
          <div key={g.key} className="skill-group">
            <p className="mono">{g.label}</p>
            <div>
              {g.items.map((i) => (
                <button
                  key={i.name}
                  type="button"
                  className={`${i.evidence ? 'has-ev' : ''} ${active === i.name ? 'active' : ''}`}
                  onPointerEnter={() => setActive(i.name)}
                  onFocus={() => setActive(i.name)}
                  onClick={() => setActive(i.name)}
                  aria-pressed={active === i.name}
                >
                  {i.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="skill-evidence" aria-live="polite">
        {item
          ? item.evidence
            ? <><b>{item.name}</b> <span className="mono">used in</span> {item.evidence.map(evidenceName).join(' · ')}</>
            : <><b>{item.name}</b> <span className="mono">no public project yet</span></>
          : <span className="mono">Select a skill to see where it&apos;s used. Underlined skills link to real projects or roles.</span>}
      </p>
    </Reveal>
  )
}
