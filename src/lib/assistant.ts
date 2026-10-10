import { buildKnowledge } from './knowledge.ts'
import { extract, Index, tokenize, type Doc, type Hit } from './retrieval.ts'

export type Snippet = { text: string; doc: Doc; score: number }
export type Answer = { snippets: Snippet[]; hits: Hit[]; terms: [string, number][] }

let index: Index | null = null
const getIndex = () => (index ??= new Index(buildKnowledge()))

/** Below this BM25 score the best passage is not about the question. */
export const MIN_SCORE = 3

/**
 * Retrieval-only answering: rank passages with BM25, keep the ones close to
 * the best match, and quote their most relevant sentences with citations.
 */
// Retrieve-then-rerank: what the question asks for (projects, roles, skills)
// decides which kind of passage should lead.
const INTENTS: [RegExp, (d: Doc) => boolean][] = [
  [/^(project|built|build|demonstrat|show)$/, (d) => d.source.kind === 'project'],
  [/^(experience|intern|internship|job|role|work|worked|company)$/, (d) => d.id.startsWith('role-')],
  [/^(skill|stack|language|know)$/, (d) => d.id.startsWith('skills-')],
]

// Words that say what kind of passage is wanted, not what it should be about.
const INTENT_WORDS = new Set(['project', 'built', 'build', 'demonstrat', 'show', 'experience', 'intern', 'internship', 'job', 'role', 'work', 'worked', 'company', 'skill', 'stack', 'language', 'know'])

const wantedKinds = (question: string) => {
  const tokens = tokenize(question)
  return INTENTS.filter(([re]) => tokens.some((t) => re.test(t))).map(([, match]) => match)
}

function rerank(question: string, hits: Hit[]) {
  const wanted = wantedKinds(question)
  if (!wanted.length) return hits
  const others = INTENTS.map(([, match]) => match).filter((m) => !wanted.includes(m))
  const weight = (d: Doc) => (wanted.some((m) => m(d)) ? 1.6 : others.some((m) => m(d)) ? 0.6 : 1)
  return hits.map((h) => ({ ...h, score: h.score * weight(h.doc) })).sort((a, b) => b.score - a.score)
}

export function answer(question: string): Answer {
  const raw = getIndex().search(question, 14)
  const terms = raw.terms
  const hits = rerank(question, raw.hits)
  const trace = [...terms.entries()]
  if (!hits.length || hits[0].score < MIN_SCORE) return { snippets: [], hits, terms: trace }

  const topical = new Map([...terms].filter(([t]) => !INTENT_WORDS.has(t)))
  if (!topical.size) terms.forEach((w, t) => topical.set(t, w))
  const cutoff = hits[0].score * 0.45
  const candidates = hits.filter((h) => h.score >= cutoff)

  // Pass 1 quotes passages that match the question's topic. If none do, the
  // question only names a kind of thing ("what technologies…"), so pass 2
  // lets passages of that kind answer on their own.
  const collect = (pick: (hit: Hit) => string) => {
    const perSource = new Map<string, number>()
    const out: Snippet[] = []
    for (const hit of candidates) {
      if (out.length >= 4) break
      const key = hit.doc.source.kind === 'project' ? hit.doc.source.id : hit.doc.id
      const used = perSource.get(key) ?? 0
      if (used >= 2) continue
      const text = pick(hit)
      if (!text) continue
      perSource.set(key, used + 1)
      out.push({ text, doc: hit.doc, score: hit.score })
    }
    return out
  }

  const kinds = wantedKinds(question)
  let snippets = collect((h) => extract(h.doc.text, topical, 2))
  if (!snippets.length && kinds.length) {
    snippets = collect((h) => (kinds.some((m) => m(h.doc)) ? extract(h.doc.text, terms, 2) || h.doc.text.split(/(?<=[.!?])\s+(?=[A-Z])/)[0] : ''))
  }
  return { snippets, hits, terms: trace }
}
