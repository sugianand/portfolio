import { answer } from './assistant.ts'

/** Questions the portfolio card's preview types into the assistant, in order. */
export const PREVIEW_QUESTIONS = ['Which project shows realtime work?', 'Where is he studying?', 'What AI projects has Sugi built?']

export type TraceRow = { label: string; score: number; width: number }
export type Trace = { terms: string[]; rows: TraceRow[] }

/** The real assistant's ranking for a question, shaped for the portfolio card's preview. */
export function retrievalTrace(question: string, n = 3): Trace {
  const { hits, terms } = answer(question)
  const top = hits.slice(0, n)
  const max = top[0]?.score || 1
  return {
    terms: terms.filter(([, w]) => w === 1).map(([t]) => t).slice(0, 4),
    // Doc titles read "Name: tagline"; the name alone fits a preview row.
    rows: top.map((h) => ({ label: h.doc.title.split(':')[0], score: h.score, width: Math.round((h.score / max) * 100) })),
  }
}
