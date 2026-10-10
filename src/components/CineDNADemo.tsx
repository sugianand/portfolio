import { useMemo, useState } from 'react'
import { search, type Dimension } from '../lib/cinedna'
import { unlock } from '../lib/store'

const EXAMPLES = [
  'slow burn dark mystery without romance',
  'something like Interstellar but darker',
  'funny indian movie with twists',
  'mind-bending, not too much action',
]

const pretty = (d: string) => d.replace(/_/g, ' ')

/** Runs the real CineDNA ranking engine (ported to TypeScript) in the browser. */
export function CineDNADemo() {
  const [query, setQuery] = useState(EXAMPLES[0])
  const { intent, results } = useMemo(() => search(query.trim() || ' ', 4), [query])
  const dims = Object.entries(intent.target) as [Dimension, number][]

  return (
    <div className="demo">
      <div className="demo-head">
        <p className="mono">Live demo · CineDNA&apos;s ranking engine running in your browser</p>
        <label className="demo-input">
          <span className="sr-only">Describe a movie vibe</span>
          <input value={query} onChange={(e) => { setQuery(e.target.value); unlock('demo') }} placeholder="Describe a vibe…" maxLength={200} spellCheck={false} />
        </label>
        <div className="demo-examples">
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" className={ex === query ? 'active' : ''} onClick={() => setQuery(ex)}>{ex}</button>
          ))}
        </div>
      </div>
      <div className="demo-body">
        <div className="demo-intent">
          <p className="mono">Parsed intent</p>
          <span className="demo-expl">{intent.explanation}</span>
          {dims.length > 0 ? (
            <ul className="demo-dims">
              {dims.map(([k, v]) => (
                <li key={k}><span>{pretty(k)}</span><i><b style={{ width: `${v}%` }} /></i><em className="mono">{v}</em></li>
              ))}
            </ul>
          ) : <span className="demo-empty">No DNA traits detected. Try words like dark, funny, twisty, or slow burn.</span>}
          {(intent.includeThemes.length > 0 || intent.excludeThemes.length > 0) && (
            <div className="demo-tags mono">
              {intent.includeThemes.map((t) => <span key={t} className="inc">+ {t}</span>)}
              {intent.excludeThemes.map((t) => <span key={t} className="exc">− {t}</span>)}
            </div>
          )}
        </div>
        <ol className="demo-results">
          {results.map((r, i) => (
            <li key={r.movie.title}>
              <span className="demo-rank mono">{i + 1}</span>
              <div>
                <strong>{r.movie.title} <small>{r.movie.year} · {r.movie.country}</small></strong>
                <span>{r.why}</span>
              </div>
              <em className="mono">{r.score.toFixed(1)}</em>
            </li>
          ))}
          {!results.length && <li className="demo-empty">Every film was filtered out by an excluded theme.</li>}
        </ol>
      </div>
      <p className="demo-foot mono">12-film starter catalog · weighted RMSE over 14 dimensions · parity-tested against the Python original</p>
    </div>
  )
}
