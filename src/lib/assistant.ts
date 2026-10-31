import { profile, projects, roles, skillGroups } from '../data.ts'
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
const isSkill = (d: Doc) => d.id.startsWith('skills-')

// Retrieve-then-rerank: what the question asks for (projects, roles, skills)
// decides which kind of passage should lead.
const INTENTS: [RegExp, (d: Doc) => boolean][] = [
  [/^(intern|internship)$/, (d) => isJob(d) && /\bIntern\b/.test(d.title)],
  [/^(project|built|build|demonstrat|show)$/, (d) => d.source.kind === 'project'],
  [/^(experience|jobs?|role|work|worked|company)$/, isJob],
  [/^(skill|stack|language|know|framework)$/, isSkill],
  [/^architecture$/, (d) => d.id.endsWith('-arch')],
]

// Words that say what kind of passage is wanted, not what it should be about.
const INTENT_WORDS = new Set(['project', 'built', 'build', 'demonstrat', 'show', 'experience', 'intern', 'internship', 'job', 'jobs', 'role', 'work', 'worked', 'company', 'skill', 'stack', 'language', 'know', 'framework', 'architecture'])

const KIND_VERBS = new Set(['build', 'demonstrat', 'show', 'know'])

const wantedKinds = (question: string) => {
  const tokens = tokenize(question)
  return INTENTS.filter(([re]) => tokens.some((t) => re.test(t))).map(([, match]) => match)
}

// A project or employer the question names. "What did he build at NeverEnding?"
// or "What is CineDNA's tech stack?" asks about that one source: a job has no
// project passages and a project no skill passages, so the kind word ("build",
// "stack") means that source's own, and its passages must lead.
let sources: { tokens: string[]; match: (d: Doc) => boolean }[] | null = null
const getSources = () =>
  (sources ??= [
    ...projects.map((p) => ({ name: p.title, match: (d: Doc) => d.source.kind === 'project' && d.source.id === p.id })),
    ...roles.map((r) => ({ name: r.org, match: (d: Doc) => d.id === `role-${r.hash}` })),
  ].map(({ name, match }) => ({ tokens: tokenize(name).filter((t) => !GENERIC.has(t) && !INTENT_WORDS.has(t)), match })))

// More than half of the name, so "run" alone is not The Frantic Run, nor "movie" Movie in Three Clues.
// When the source has passages of the wanted kind ("CineDNA's architecture"), the kind still decides.
// With no kind word a named project alone decides (see rerank): "How accurate is
// Whereabout?" is about Whereabout, though "accurate" is a third of an employer's name.
function namedSource(question: string) {
  const tokens = tokenize(question)
  const wanted = wantedKinds(question)
  const named = getSources().filter((s) => s.tokens.length && s.tokens.filter((t) => tokens.includes(t)).length * 2 > s.tokens.length)
  if (!named.length) return undefined
  const match = (d: Doc) => named.some((s) => s.match(d))
  if (!wanted.length) return match
  return getDocs().some((d) => match(d) && wanted.some((m) => m(d))) ? undefined : match
}

function rerank(question: string, hits: Hit[]) {
  const wanted = wantedKinds(question)
  const named = namedSource(question)
  if (!wanted.length) {
    // Only a project: "Wayne State" names jobs, but the education passage answers too.
    const own = named ? hits.filter((h) => h.doc.source.kind === 'project' && named(h.doc)) : []
    return own.length ? own : hits
  }
  const kinds = INTENTS.map(([, match]) => match)
  const others = named ? kinds : kinds.filter((m) => !wanted.includes(m))
  const weight = (d: Doc) => ((named ? named(d) : wanted.some((m) => m(d))) ? 1.6 : others.some((m) => m(d)) ? 0.6 : 1)
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

/**
 * "Has he worked with Python?" names one skill. Its skills passage says where he
 * used it, across projects and jobs, so it should lead over a single project's
 * stack line or a job that "worked" matched but that never mentions the skill.
 */
function leadWithSkill(question: string, hits: Hit[]) {
  const tokens = tokenize(question)
  const wanted = wantedKinds(question)
  // "Which project uses Python?" or "CineDNA's stack" asks about something else.
  if (namedSource(question) || namedProject(question) || wanted.some((m) => m !== isJob && m !== isSkill)) return hits
  const group = skillGroups.find((g) => g.items.some((i) => {
    const name = tokenize(i.name)
    return name.length === 1 && tokens.includes(name[0])
  }))
  const i = group ? hits.findIndex((h) => h.doc.id === `skills-${group.key}`) : -1
  if (i <= 0) return hits
  return [{ ...hits[i], score: hits[0].score }, ...hits.slice(0, i), ...hits.slice(i + 1)]
}

// Nouns so common in the data that they match on their own. "Has he built an
// iOS app?" asks about a kind of app, so when the word before one of these is
// nowhere in the data, any passage about some other app is the wrong answer.
const GENERIC = new Set(tokenize('app application deployment development system platform website service model software'))

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

// A skill group is one long sentence. "Does he know Java?" asks about one item
// in it, so quote the group's label and only the items the question names.
const SKILLS_PREFIX = 'Skills and technologies, '

function narrowSkills(text: string, asked: Set<string>) {
  if (!text.startsWith(SKILLS_PREFIX)) return text
  const body = text.slice(SKILLS_PREFIX.length, -1)
  const colon = body.indexOf(': ')
  const items = body.slice(colon + 2).split('; ')
  const picked = items.filter((item) => tokenize(item.split(' (used in ')[0]).some((t) => asked.has(t)))
  return picked.length && picked.length < items.length ? `${body.slice(0, colon)}: ${picked.join('; ')}.` : text
}

export function answer(asked: string): Answer {
  // The data only uses "go" as a verb ("tasks go in"), so "Does he know Go?" must not match it.
  // "This site" is the portfolio project, not NeverEnding's "website revamp".
  // "Review" in the data is only the food hobby, so a code review question must not match it.
  const question = asked
    .replace(/\bgo(lang)?\b/gi, 'golang')
    .replace(/\b(code|pull requests?|prs?) reviews?\b|\breview(s|ed|ing)? (\w+ )?(code|pull requests?|prs?)\b/gi, 'codereview')
    .replace(/\b(this|your) (web ?site|site|web ?page|page)\b/gi, 'this portfolio')
    // The profile says "time zone"; "timezone" alone would match nothing.
    .replace(/\btime-?zones?\b/gi, 'time zone')
  const raw = getIndex().search(question, 14)
  const terms = raw.terms
  const hits = leadWithSkill(question, leadWithSummary(question, rerank(question, raw.hits)))
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
  const subject = new Set(tokens.filter((t) => !INTENT_WORDS.has(t)))
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
      const text = narrowSkills(pick(hit), subject)
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
  // Within a named source the kind words are the topic: "CineDNA's stack" quotes its stack.
  const source = namedSource(question)
  let snippets = collect((h) => extract(h.doc.text, source?.(h.doc) ? terms : topical, 2))
  if (!snippets.length) {
    snippets = collect((h) => (kinds.some((m) => m(h.doc)) || titled(h.doc) ? extract(h.doc.text, terms, 2) || h.doc.text.split(/(?<=[.!?])\s+(?=[A-Z])/)[0] : ''))
  }
  // A kind-only question led by a passage of some other kind missed its point, and
  // one answered by a single source ("What has he built?") undersells the rest.
  if (kindOnly && (!(snippets.length && kinds.some((m) => m(snippets[0].doc))) || (snippets.length === 1 && fallback.length > 1))) snippets = fallback
  return { snippets, hits, terms: trace }
}
