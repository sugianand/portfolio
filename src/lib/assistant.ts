import { profile, projects, skillGroups } from '../data.ts'
import { buildKnowledge } from './knowledge.ts'
import { expand, extract, Index, tokenize, type Doc, type Hit } from './retrieval.ts'

export type Snippet = { text: string; doc: Doc; score: number }
export type Answer = { snippets: Snippet[]; hits: Hit[]; terms: [string, number][] }

let docs: Doc[] | null = null
const getDocs = () => (docs ??= buildKnowledge())
let index: Index | null = null
const getIndex = () => (index ??= new Index(getDocs()))

/** Below this BM25 score the best passage is not about the question. */
export const MIN_SCORE = 3

// One-word project and skill names. Each appears in many passages, so its IDF
// is too low to clear MIN_SCORE alone, yet a question that names one ("What is
// CineDNA?", "Does he know React?") is always on topic.
let names: Set<string> | null = null
const getNames = () =>
  (names ??= new Set([...projects.map((p) => p.title), ...skillGroups.flatMap((g) => g.items.map((i) => i.name))].map(tokenize).filter((t) => t.length === 1).map(([t]) => t)))

/**
 * Retrieval-only answering: rank passages with BM25, keep the ones close to
 * the best match, and quote their most relevant sentences with citations.
 */
// The timeline lists the degree in progress next to the jobs; it is not a job.
const degrees = profile.education.map((e) => e.degree)
const isJob = (d: Doc) => d.id.startsWith('role-') && !degrees.some((deg) => d.title.startsWith(deg))

// Retrieve-then-rerank: what the question asks for (projects, roles, skills)
// decides which kind of passage should lead.
const INTENTS: [RegExp, (d: Doc) => boolean][] = [
  [/^(intern|internship)$/, (d) => isJob(d) && /\bIntern\b/.test(d.title)],
  [/^(project|built|build|demonstrat|show)$/, (d) => d.source.kind === 'project'],
  [/^(experience|jobs?|role|work|worked|company)$/, isJob],
  [/^(skill|stack|language|know|framework)$/, (d) => d.id.startsWith('skills-')],
  [/^architecture$/, (d) => d.id.endsWith('-arch')],
]

// Words that say what kind of passage is wanted, not what it should be about.
const INTENT_WORDS = new Set(['project', 'built', 'build', 'demonstrat', 'show', 'experience', 'intern', 'internship', 'job', 'jobs', 'role', 'work', 'worked', 'company', 'skill', 'stack', 'language', 'know', 'framework', 'architecture'])

const KIND_VERBS = new Set(['build', 'demonstrat', 'show', 'know'])

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

/**
 * "What is Three Clues?" names a project and nothing else, so its summary should
 * lead, even when a passage that repeats the title (its numbers) scores higher.
 */
function namedProject(question: string) {
  // "What is this site built with?" still names only the project: "built" says what kind of answer.
  const tokens = tokenize(question).filter((t) => !INTENT_WORDS.has(t))
  if (!tokens.length) return undefined
  return projects.find((p) => {
    const title = tokenize(p.title)
    return tokens.every((t) => title.includes(t)) && tokens.length * 2 >= title.length
  })
}

function leadWithSummary(question: string, hits: Hit[]) {
  // "What does the Three Clues architecture look like?" wants the diagram's passage, not the summary.
  if (tokenize(question).includes('architecture')) return hits
  const project = namedProject(question)
  const i = project ? hits.findIndex((h) => h.doc.id === `${project.id}-summary`) : -1
  if (i <= 0) return hits
  return [{ ...hits[i], score: hits[0].score }, ...hits.slice(0, i), ...hits.slice(i + 1)]
}

// Nouns so common in the data that they match on their own. "Has he built an
// iOS app?" asks about a kind of app, so when the word before one of these is
// nowhere in the data, any passage about some other app is the wrong answer.
const GENERIC = new Set(tokenize('app application deployment system platform website service model software'))

const unknown = (t: string) => ![...expand([t]).keys()].some((e) => getIndex().has(e))

const unknownModifier = (tokens: string[]) => tokens.some((t, i) => GENERIC.has(tokens[i + 1]) && unknown(t))

// "Does he have AWS experience?" asks about AWS; when the data never mentions
// it, "experience" alone would quote his first job as if it were the answer.
const unknownSubject = (tokens: string[]) => {
  const subject = tokens.filter((t) => !INTENT_WORDS.has(t))
  return subject.length > 0 && subject.every(unknown)
}

/**
 * "What jobs has he had?" or "List his projects" names only a kind of passage,
 * so no text scores well; answer with the first passage of each such source.
 */
function kindAnswer(kinds: ((d: Doc) => boolean)[]): Snippet[] {
  const seen = new Set<string>()
  const out: Snippet[] = []
  for (const doc of getDocs()) {
    const key = doc.source.kind === 'project' ? doc.source.id : doc.id
    if (out.length >= 4 || seen.has(key) || !kinds.some((m) => m(doc))) continue
    seen.add(key)
    out.push({ text: doc.text.split(/(?<=[.!?])\s+(?=[A-Z])/)[0], doc, score: 0 })
  }
  return out
}

export function answer(asked: string): Answer {
  // The data only uses "go" as a verb ("tasks go in"), so "Does he know Go?" must not match it.
  // "This site" is the portfolio project, not NeverEnding's "website revamp".
  const question = asked
    .replace(/\bgo(lang)?\b/gi, 'golang')
    .replace(/\b(this|your) (web ?site|site|web ?page|page)\b/gi, 'this portfolio')
  const raw = getIndex().search(question, 14)
  const terms = raw.terms
  const hits = leadWithSummary(question, rerank(question, raw.hits))
  const trace = [...terms.entries()]
  const kinds = wantedKinds(question)
  // "What does he build?" asks what he does, so verbs alone don't make a kind-only question.
  const tokens = tokenize(question)
  const kindOnly = kinds.length > 0 && tokens.every((t) => INTENT_WORDS.has(t)) && !tokens.every((t) => KIND_VERBS.has(t))
  const fallback = kindOnly ? kindAnswer(kinds) : []
  const named = tokens.some((t) => getNames().has(t))
  // Relevance is judged before the rerank: it only reorders passages, so it
  // must not turn an on-topic question into a refusal.
  if (!hits.length || unknownModifier(tokens) || unknownSubject(tokens) || (raw.hits[0].score < MIN_SCORE && !named)) return { snippets: fallback, hits, terms: trace }

  const topical = new Map([...terms].filter(([t]) => !INTENT_WORDS.has(t)))
  if (!topical.size) terms.forEach((w, t) => topical.set(t, w))
  const cutoff = hits[0].score * 0.45
  const candidates = hits.filter((h) => h.score >= cutoff)

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

  // Pass 1 quotes passages that match the question's topic. If none do, the
  // question only names a kind of thing ("what technologies…"), so pass 2
  // lets passages of that kind answer on their own, along with passages whose
  // title names the topic ("hardest problem") even if their text never does.
  const titled = (d: Doc) => tokenize(d.title).some((t) => topical.has(t))
  let snippets = collect((h) => extract(h.doc.text, topical, 2))
  if (!snippets.length) {
    snippets = collect((h) => (kinds.some((m) => m(h.doc)) || titled(h.doc) ? extract(h.doc.text, terms, 2) || h.doc.text.split(/(?<=[.!?])\s+(?=[A-Z])/)[0] : ''))
  }
  // A kind-only question led by a passage of some other kind missed its point.
  if (kindOnly && !(snippets.length && kinds.some((m) => m(snippets[0].doc)))) snippets = fallback
  return { snippets, hits, terms: trace }
}
