import { useState } from 'react'
import { evidenceLabels, profile, projects, skillGroups, stats } from '../data'
import { LOGOS } from '../lib/logos'
import { SHORT, tileName, tileSymbol } from '../lib/skillTiles'
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
            I&apos;m Suganeshwara, or <em>Sugi</em>: a Wayne State CS grad now doing an M.S. in AI.
          </p>
          <p>
            I like the hard middle of a problem: edge cases, architecture, the moment an idea becomes real. I&apos;ve tested automotive software, built financial backends, and shipped a recommender and a multiplayer game.
          </p>
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

// Screen-reader detail after the visible tile name. Keeping the name as real text rather than an
// aria-label means what voice users see is what they say (WCAG 2.5.3).
const skillDetail = ({ name, evidence }: { name: string; evidence?: string[] }) => {
  const parts = [SHORT[name] && name, evidence && `used in ${evidence.length}`].filter(Boolean)
  return parts.length ? ` (${parts.join(', ')})` : ''
}

// Phones open the table on the most-used skills; the rest wait behind "Show all".
const PHONE_TOP = 12

/** The stack as a periodic table: one tile per skill, colored by family; dots count where it is used. */
function SkillMap() {
  const [active, setActive] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const all = skillGroups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.key })))
  const top = new Set([...all].sort((a, b) => (b.evidence?.length ?? 0) - (a.evidence?.length ?? 0)).slice(0, PHONE_TOP).map((i) => i.name))
  const item = all.find((i) => i.name === active)

  return (
    <Reveal className="skillmap">
      <ul className="ptable-legend mono" aria-label="Skill families">
        {skillGroups.map((g) => <li key={g.key} className={`fam-${g.key}`}><i />{g.label}</li>)}
      </ul>
      <div className={`ptable ${expanded ? 'ptable-all' : ''}`}>
        {all.map((i, n) => (
          <button
            key={i.name}
            type="button"
            className={`el fam-${i.group} ${i.evidence ? '' : 'el-noev'} ${top.has(i.name) ? '' : 'el-more'} ${active === i.name ? 'active' : ''}`}
            onPointerEnter={() => setActive(i.name)}
            onFocus={() => setActive(i.name)}
            onClick={() => setActive(i.name)}
            aria-pressed={active === i.name}
          >
            <span className="el-n mono" aria-hidden="true">{n + 1}</span>
            {LOGOS[i.name]
              ? <svg className="el-logo" viewBox="0 0 24 24" aria-hidden="true"><path d={LOGOS[i.name]} /></svg>
              : <b aria-hidden="true">{tileSymbol(i.name)}</b>}
            <span className="el-name">{tileName(i.name)}</span>
            <span className="sr-only">{skillDetail(i)}</span>
            <span className="el-dots" aria-hidden="true">{(i.evidence ?? []).map((e) => <i key={e} />)}</span>
          </button>
        ))}
      </div>
      <button type="button" className="ptable-toggle mono" aria-expanded={expanded} onClick={() => setExpanded((e) => !e)}>
        {expanded ? 'Show fewer' : `Show all ${all.length} skills`}
      </button>
      <p className="skill-evidence" aria-live="polite">
        {item
          ? item.evidence
            ? <><b>{item.name}</b> <span className="mono">used in</span> {item.evidence.map(evidenceName).join(' · ')}</>
            : <><b>{item.name}</b> <span className="mono">no public project yet</span></>
          : <span className="mono">Hover or tap an element. Each dot is a project or role that uses it.</span>}
      </p>
    </Reveal>
  )
}
