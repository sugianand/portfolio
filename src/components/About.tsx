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

// Two-letter symbols for the periodic-table view of the stack.
const SYMBOLS: Record<string, string> = {
  Python: 'Py', TypeScript: 'Ts', JavaScript: 'Js', Java: 'Ja', 'C#': 'C#', 'C++': 'C+', SQL: 'Sq',
  'Recommendation & ranking': 'Rk', 'Rule-based NLU': 'Nl', 'Information retrieval (BM25)': 'Ir', 'LLM APIs': 'Ll',
  PyTorch: 'Pt', TensorFlow: 'Tf', NumPy: 'Np', MATLAB: 'Ml',
  FastAPI: 'Fa', 'Django / DRF': 'Dj', Express: 'Ex', 'Cloudflare Workers': 'Cf', 'REST API design': 'Ra',
  React: 'Re', 'Next.js': 'Nx', Blazor: 'Bz', 'WebGL / GLSL': 'Gl', Canvas: 'Cv',
  'PostgreSQL (Supabase)': 'Pg', MySQL: 'My', 'SQLite (D1)': 'Sl',
  Docker: 'Dk', 'GitHub Actions': 'Ga', Vercel: 'Vc', Render: 'Rn', Git: 'Gt', Linux: 'Lx', Jira: 'Ji',
  'Regression & root-cause analysis': 'Rc', 'Unit & integration tests': 'Ut', Miniflare: 'Mf',
}

const SHORT: Record<string, string> = {
  'Recommendation & ranking': 'Ranking', 'Information retrieval (BM25)': 'Retrieval', 'Rule-based NLU': 'NLU',
  'REST API design': 'REST APIs', 'PostgreSQL (Supabase)': 'Postgres', 'SQLite (D1)': 'SQLite',
  'Regression & root-cause analysis': 'Root cause', 'Unit & integration tests': 'Testing', 'Cloudflare Workers': 'Workers',
  'GitHub Actions': 'Actions', 'WebGL / GLSL': 'WebGL', 'Django / DRF': 'Django',
}

/** The stack as a periodic table: one tile per skill, colored by family; dots count where it is used. */
function SkillMap() {
  const [active, setActive] = useState<string | null>(null)
  const all = skillGroups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.key })))
  const item = all.find((i) => i.name === active)

  return (
    <Reveal className="skillmap">
      <ul className="ptable-legend mono" aria-label="Skill families">
        {skillGroups.map((g) => <li key={g.key} className={`fam-${g.key}`}><i />{g.label}</li>)}
      </ul>
      <div className="ptable">
        {all.map((i, n) => (
          <button
            key={i.name}
            type="button"
            className={`el fam-${i.group} ${i.evidence ? '' : 'el-noev'} ${active === i.name ? 'active' : ''}`}
            onPointerEnter={() => setActive(i.name)}
            onFocus={() => setActive(i.name)}
            onClick={() => setActive(i.name)}
            aria-pressed={active === i.name}
            aria-label={`${i.name}${i.evidence ? `, used in ${i.evidence.length}` : ''}`}
          >
            <span className="el-n mono">{n + 1}</span>
            <b>{SYMBOLS[i.name] ?? i.name.slice(0, 2)}</b>
            <span className="el-name">{SHORT[i.name] ?? i.name}</span>
            <span className="el-dots" aria-hidden="true">{(i.evidence ?? []).map((e) => <i key={e} />)}</span>
          </button>
        ))}
      </div>
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
