import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { search } from '../lib/cinedna'
import { PREVIEW_QUESTIONS, retrievalTrace } from '../lib/retrievalTrace'
import { useInView } from '../lib/useInView'

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Ticks while the element is on screen; frozen at 0 for reduced motion. */
function useTicker(ms: number) {
  const [ref, inView] = useInView<HTMLDivElement>(0.2, false)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!inView || reduceMotion()) return
    const id = window.setInterval(() => setTick((t) => t + 1), ms)
    return () => window.clearInterval(id)
  }, [inView, ms])
  return [ref, tick] as const
}

function Browser({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="pv" aria-hidden="true">
      <div className="pv-bar"><span className="lights"><i /><i /><i /></span><span className="pv-url mono">{url}</span></div>
      <div className="pv-body">{children}</div>
    </div>
  )
}

const CINE_QUERIES = ['slow burn dark mystery without romance', 'funny indian movie with twists', 'something like Interstellar but darker', 'beautiful cinematic world building']

function CinePreview() {
  const [ref, tick] = useTicker(140)
  const cycle = 46
  const qi = Math.floor(tick / cycle) % CINE_QUERIES.length
  const step = tick % cycle
  const query = CINE_QUERIES[qi]
  const typed = query.slice(0, Math.min(query.length, step * 2))
  const done = typed.length === query.length
  const { results } = useMemo(() => search(query, 3), [query])
  return (
    <div ref={ref}>
      <Browser url="cinedna · /api/search">
        <div className="pv-search mono">{reduceMotion() ? query : typed}<i className={done ? '' : 'caret'} /></div>
        <ul className="pv-results">
          {results.map((r, i) => (
            <li key={r.movie.title} className={done || reduceMotion() ? 'in' : ''} style={{ transitionDelay: `${i * 90}ms` }}>
              <b>{r.movie.title}</b>
              <i><em style={{ width: `${r.score}%` }} /></i>
              <span className="mono">{r.score.toFixed(0)}</span>
            </li>
          ))}
        </ul>
      </Browser>
    </div>
  )
}

const CLUES = ['Story · a farmer-pilot leaves his family behind', 'Director · known for bending time on screen', 'Character · a robot named TARS']

function CluesPreview() {
  const [ref, tick] = useTicker(450)
  const step = tick % 16
  const shown = reduceMotion() ? 3 : Math.min(3, 1 + Math.floor(step / 4))
  const points = [300, 200, 100][shown - 1]
  const solved = step >= 13
  return (
    <div ref={ref}>
      <Browser url="three-clues · room K7QD2X">
        <div className="pv-clues">
          <div className="pv-clue-top mono"><span>Round 2 / 5</span><span>{solved ? 'Solved' : `${points} pts`}</span></div>
          <div className="pv-timer"><i style={{ transform: `scaleX(${solved ? 0 : 1 - (step % 4) / 4})` }} /></div>
          {CLUES.map((c, i) => <p key={c} className={i < shown ? 'in' : ''}>{c}</p>)}
          <div className={`pv-answer mono ${solved ? 'solved' : ''}`}>{solved ? 'Interstellar  +100' : '_ _ _ _ _ _ _ _ _ _ _ _'}</div>
        </div>
      </Browser>
    </div>
  )
}

// The site's own assistant, run live: a question types out, then its real BM25
// query terms and top three sources appear, as in the assistant's retrieval trace.
function PortfolioPreview() {
  const [ref, tick] = useTicker(140)
  const cycle = 46
  const query = PREVIEW_QUESTIONS[Math.floor(tick / cycle) % PREVIEW_QUESTIONS.length]
  const step = tick % cycle
  const typed = reduceMotion() ? query : query.slice(0, Math.min(query.length, step * 2))
  const done = typed.length === query.length
  const { terms, rows } = useMemo(() => retrievalTrace(query), [query])
  return (
    <div ref={ref}>
      <Browser url="sugianand.vercel.app · ask">
        <div className="pv-search mono">{typed}<i className={done ? '' : 'caret'} /></div>
        <div className={`pv-terms mono ${done ? 'in' : ''}`}>{terms.map((t) => <span key={t}>{t}</span>)}</div>
        <ul className="pv-results pv-sources">
          {rows.map((r, i) => (
            <li key={r.label} className={done ? 'in' : ''} style={{ transitionDelay: `${i * 90}ms` }}>
              <b>{r.label}</b>
              <i><em style={{ width: `${r.width}%` }} /></i>
              <span className="mono">{r.score.toFixed(1)}</span>
            </li>
          ))}
        </ul>
      </Browser>
    </div>
  )
}

export function ProductPreview({ id }: { id: string }) {
  if (id === 'cinedna') return <CinePreview />
  if (id === 'three-clues') return <CluesPreview />
  if (id === 'portfolio') return <PortfolioPreview />
  return null
}
