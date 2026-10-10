import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Answer } from '../lib/assistant'
import type { Source } from '../lib/retrieval'
import { on, scrollToId, unlock } from '../lib/store'

const SUGGESTIONS = [
  'What AI projects has Sugi built?',
  'Which project shows realtime engineering?',
  'What backend experience does Sugi have?',
  'What did Sugi do at Accurate Technologies?',
  'Why is Sugi a fit for an AI engineering role?',
  'What technologies does Sugi know?',
]

type Turn = { q: string; a: Answer }

// The retrieval engine and knowledge base load only when the panel opens.
const loadEngine = () => import('../lib/assistant')

function sourceLabel(src: Source, title: string) {
  if (src.kind === 'project') return `${title.split(':')[0].replace(/ (problem|hardest|architecture|numbers|features).*$/i, '')} case study`
  if (src.kind === 'section') return { about: 'About', log: 'Experience', contact: 'Contact', projects: 'Projects' }[src.id] ?? src.id
  return 'Link'
}

export function Assistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => on('assistant', () => setOpen(true)), [])

  useEffect(() => {
    if (!open) return
    loadEngine()
    window.setTimeout(() => inputRef.current?.focus(), 50)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [turns])

  const ask = async (q: string) => {
    const question = q.trim()
    if (!question || busy) return
    setBusy(true)
    setInput('')
    const { answer } = await loadEngine()
    setTurns((t) => [...t, { q: question, a: answer(question) }].slice(-12))
    unlock('assistant')
    setBusy(false)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    ask(input)
  }

  const go = (src: Source) => {
    if (window.matchMedia('(max-width: 820px)').matches) setOpen(false)
    if (src.kind === 'section') scrollToId(src.id)
    else if (src.kind === 'project') window.location.assign(`#project/${src.id}`)
    else window.open(src.href, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <button type="button" className={`ask-launch ${open ? 'hidden-launch' : ''}`} onClick={() => setOpen(true)} onPointerEnter={loadEngine} aria-expanded={open} aria-controls="ask-panel">
        <span aria-hidden="true">✦</span> <b>Ask about Sugi</b>
      </button>
      {open && (
        <section className="ask" id="ask-panel" role="dialog" aria-label="Ask about Sugi">
          <div className="ask-head">
            <div>
              <strong>Ask about Sugi</strong>
              <span className="mono">BM25 retrieval over this site&apos;s verified data · every answer is quoted and cited</span>
            </div>
            <button type="button" className="mono ask-close" onClick={() => setOpen(false)} aria-label="Close assistant">esc ✕</button>
          </div>

          <div className="ask-log" ref={logRef} aria-live="polite">
            {!turns.length && (
              <div className="ask-empty">
                <p>Ask anything about Sugi&apos;s projects, experience, or skills. Answers come only from what this site states, so there&apos;s nothing invented.</p>
                <div className="ask-suggest">
                  {SUGGESTIONS.map((s) => <button key={s} type="button" onClick={() => ask(s)}>{s}</button>)}
                </div>
              </div>
            )}
            {turns.map((t, i) => {
              const sources = t.a.snippets.map((s) => s.doc)
              return (
                <div className="ask-turn" key={i}>
                  <p className="ask-q">{t.q}</p>
                  {t.a.snippets.length ? (
                    <div className="ask-a">
                      {t.a.snippets.map((s, j) => <p key={s.doc.id}>{s.text} <sup className="mono">[{j + 1}]</sup></p>)}
                      <div className="ask-sources">
                        {sources.map((d, j) => (
                          <button key={d.id} type="button" onClick={() => go(d.source)}>
                            <span className="mono">[{j + 1}]</span> {sourceLabel(d.source, d.title)} →
                          </button>
                        ))}
                      </div>
                      <details className="ask-trace">
                        <summary className="mono">Show retrieval trace</summary>
                        <p className="mono">query terms: {t.a.terms.map(([term, w]) => (w < 1 ? `${term}(${w})` : term)).join(' ')}</p>
                        <ol className="mono">{t.a.hits.slice(0, 6).map((h) => <li key={h.doc.id}>{h.score.toFixed(2)}  {h.doc.id}</li>)}</ol>
                      </details>
                    </div>
                  ) : (
                    <div className="ask-a ask-none">
                      <p>That isn&apos;t covered by anything on this site, and I won&apos;t guess. Try asking about a project, a role, or a skill, or email {''}
                        <a href="mailto:sugianand89@gmail.com">sugianand89@gmail.com</a>.</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <form className="ask-form" onSubmit={submit}>
            <label className="sr-only" htmlFor="ask-input">Your question</label>
            <input id="ask-input" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. What did Sugi build with FastAPI?" maxLength={200} autoComplete="off" />
            <button type="submit" disabled={!input.trim() || busy}>Ask</button>
          </form>
        </section>
      )}
    </>
  )
}
