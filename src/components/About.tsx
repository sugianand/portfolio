import { profile, skills, stats } from '../data'
import { CountUp, Reveal } from './effects'
import { SectionHead } from './Sections'

const facts = [
  ['Studying', "M.S. Artificial Intelligence, Wayne State"],
  ['Degree', 'B.S. Computer Science, minor in Mathematics'],
  ['Based in', profile.location],
  ['Currently', 'Student Assistant at WSU C&IT · Peer Technical Mentor'],
  ['Previously', 'QA at Accurate Technologies · Backend at NeverEnding'],
  ['Looking for', 'Software engineering and AI roles'],
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
            Right now I&apos;m building AI-flavored products like CineDNA, real-time multiplayer games, and tools that make students&apos; lives easier.
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

      <Reveal className="skills">
        {Object.entries(skills).map(([group, list]) => (
          <div key={group} className="skill-group">
            <p className="mono">{group === 'ai' ? 'AI / ML' : group}</p>
            <div>{list.map((s) => <span key={s}>{s}</span>)}</div>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
