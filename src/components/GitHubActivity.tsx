import { useEffect, useMemo, useRef, useState } from 'react'
import { profile } from '../data'
import { useInView } from '../lib/useInView'
import { Reveal } from './effects'
import { SectionHead } from './Sections'

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }
type Repo = { name: string; url: string; description: string | null; language: string | null; pushed: string }
type Data = { total: number; days: Day[]; repos: number | null; active: Repo[] }

const USER = 'sugianand'
const CACHE = 'sa26:gh2'
// Profile plumbing, not projects.
const HIDDEN = new Set(['sugianand', 'sugianand.github.io'])
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

async function load(): Promise<Data> {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE) ?? 'null') as Data | null
    if (cached) return cached
  } catch {
    /* ignore */
  }
  const [contrib, user, repos] = await Promise.all([
    fetch(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
    fetch(`https://api.github.com/users/${USER}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    fetch(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=12`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
  ])
  const cutoff = Date.now() - 45 * 864e5
  const active: Repo[] = (repos as { name: string; html_url: string; description: string | null; language: string | null; pushed_at: string; fork: boolean }[])
    .filter((r) => !r.fork && !HIDDEN.has(r.name) && Date.parse(r.pushed_at) > cutoff)
    .slice(0, 4)
    .map((r) => ({ name: r.name, url: r.html_url, description: r.description, language: r.language, pushed: r.pushed_at }))
  const data: Data = { total: contrib.total.lastYear, days: contrib.contributions, repos: user?.public_repos ?? null, active }
  try {
    sessionStorage.setItem(CACHE, JSON.stringify(data))
  } catch {
    /* ignore */
  }
  return data
}

const ago = (iso: string) => {
  const h = (Date.now() - Date.parse(iso)) / 36e5
  if (h < 1) return 'just now'
  if (h < 24) return `${Math.floor(h)}h ago`
  const d = Math.floor(h / 24)
  return d === 1 ? 'yesterday' : `${d} days ago`
}

function CurrentlyBuilding({ repos }: { repos: Repo[] }) {
  return (
    <div className="now">
      <p className="now-title mono"><i className="dot" /> Currently building <span>· live from GitHub</span></p>
      <ul>
        {repos.map((r) => (
          <li key={r.name}>
            <a href={r.url} target="_blank" rel="noreferrer">
              <b>{r.name}{r.name === 'portfolio' ? ' (this site)' : ''}</b>
              {r.description && <span>{r.description}</span>}
              <em className="mono">{[r.language, `pushed ${ago(r.pushed)}`].filter(Boolean).join(' · ')}</em>
            </a>
          </li>
        ))}
        <li className="now-static">
          <b>Graduate AI coursework</b>
          <span>M.S. in Artificial Intelligence at Wayne State University</span>
          <em className="mono">in progress</em>
        </li>
      </ul>
    </div>
  )
}

function summarize(days: Day[]) {
  let longest = 0
  let run = 0
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0
    longest = Math.max(longest, run)
  }
  const best = days.reduce((a, b) => (b.count > a.count ? b : a), days[0])
  const active = days.filter((d) => d.count > 0).length
  return { longest, best, active }
}

export function GitHubActivity() {
  const [data, setData] = useState<Data | null>(null)
  const [failed, setFailed] = useState(false)
  const [hover, setHover] = useState<Day | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [data])

  const [sectionRef, near] = useInView<HTMLElement>(0)

  useEffect(() => {
    if (!near) return
    let alive = true
    load().then((d) => alive && setData(d)).catch(() => alive && setFailed(true))
    return () => { alive = false }
  }, [near])

  const weeks = useMemo(() => {
    if (!data) return []
    const out: (Day | null)[][] = []
    const first = new Date(`${data.days[0].date}T00:00:00`).getDay()
    let week: (Day | null)[] = Array(first).fill(null)
    for (const d of data.days) {
      week.push(d)
      if (week.length === 7) {
        out.push(week)
        week = []
      }
    }
    if (week.length) out.push([...week, ...Array(7 - week.length).fill(null)])
    return out
  }, [data])

  const summary = useMemo(() => (data ? summarize(data.days) : null), [data])

  const monthLabels = weeks.map((w, i) => {
    const day = w.find(Boolean)
    if (!day) return ''
    const m = new Date(`${day.date}T00:00:00`).getMonth()
    const prev = i > 0 ? weeks[i - 1].find(Boolean) : null
    return !prev || new Date(`${prev.date}T00:00:00`).getMonth() !== m ? MONTHS[m] : ''
  })

  return (
    <section className="section activity" id="github" ref={sectionRef}>
      <SectionHead index="04" kicker="GitHub" title="Commit" accent="history." note="Live from GitHub: what I'm building right now, and every day of work over the past year." />
      <Reveal className="gh-frame">
        <div className="frame-bar mono">
          <span className="lights"><i /><i /><i /></span>
          <span>github.com/{USER}</span>
          <a href={profile.github} target="_blank" rel="noreferrer">open ↗</a>
        </div>

        {failed && (
          <p className="gh-empty mono">Couldn&apos;t reach GitHub right now. <a href={profile.github} target="_blank" rel="noreferrer">See the profile ↗</a></p>
        )}
        {!data && !failed && <p className="gh-empty mono">fetching contributions…</p>}

        {data && summary && (
          <>
            {data.active.length > 0 && <CurrentlyBuilding repos={data.active} />}
            <div className="gh-stats">
              <div><strong>{data.total}</strong><span className="mono">contributions, last 12 months</span></div>
              <div><strong>{summary.active}</strong><span className="mono">active days</span></div>
              <div><strong>{summary.longest}</strong><span className="mono">longest streak (days)</span></div>
              <div><strong>{data.repos ?? '—'}</strong><span className="mono">public repos</span></div>
            </div>
            <div className="gh-scroll" ref={scrollRef} tabIndex={0} role="region" aria-label="Contribution calendar, scrollable">
              <div className="gh-graph" style={{ gridTemplateColumns: `24px repeat(${weeks.length}, 1fr)` }}>
                <span />
                {monthLabels.map((m, i) => <span key={i} className="gh-month mono">{m}</span>)}
                {[0, 1, 2, 3, 4, 5, 6].map((row) => (
                  <div key={row} className="gh-row" style={{ display: 'contents' }}>
                    <span className="gh-dow mono">{row % 2 ? ['', 'Mon', '', 'Wed', '', 'Fri', ''][row] : ''}</span>
                    {weeks.map((w, col) => {
                      const d = w[row]
                      return d ? (
                        <i
                          key={col}
                          className={`gh-cell l${d.level}`}
                          onPointerEnter={() => setHover(d)}
                          onPointerLeave={() => setHover(null)}
                          title={`${d.count} contribution${d.count === 1 ? '' : 's'} on ${d.date}`}
                        />
                      ) : <i key={col} className="gh-cell gh-pad" />
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="gh-foot mono">
              <span>
                {hover
                  ? `${hover.count} contribution${hover.count === 1 ? '' : 's'} · ${new Date(`${hover.date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`
                  : `Best day: ${summary.best.count} on ${new Date(`${summary.best.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
              </span>
              <span className="gh-legend">less {[0, 1, 2, 3, 4].map((l) => <i key={l} className={`gh-cell l${l}`} />)} more</span>
            </div>
          </>
        )}
      </Reveal>
    </section>
  )
}
