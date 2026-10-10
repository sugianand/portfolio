// A small BM25 retriever with query expansion and extractive answering.
// No model, no server: it ranks passages from the site's own data and quotes them.

export type Source = { kind: 'section'; id: string } | { kind: 'project'; id: string } | { kind: 'link'; href: string }

export type Doc = {
  id: string
  /** Shown as the citation label. */
  title: string
  text: string
  source: Source
  /** Extra weight for terms in the title. */
  boost?: number
}

export type Hit = { doc: Doc; score: number }

const STOP = new Set('a an and are as at be but by can did do does for from has have he her his how i in is it its me of on or our she so than that the their them they this to was what when where which who why will with would you your about tell sugi suganeshwara anand any some has had into also just more most best'.split(' '))

// Query-side expansion: recruiter vocabulary mapped onto words that appear in the data.
const EXPAND: Record<string, string[]> = {
  ai: ['ml', 'llm', 'recommendation', 'ranking', 'retrieval', 'intelligence', 'nlu', 'bm25', 'openai'],
  ml: ['ai', 'learning', 'recommendation', 'ranking', 'pytorch', 'tensorflow'],
  machine: ['ml', 'learning'],
  llm: ['openai', 'ai', 'estimator'],
  rag: ['retrieval', 'bm25', 'assistant'],
  backend: ['api', 'fastapi', 'django', 'drf', 'express', 'worker', 'server', 'rest'],
  api: ['rest', 'fastapi', 'endpoint', 'express'],
  frontend: ['react', 'ui', 'next', 'webgl', 'canvas'],
  fullstack: ['frontend', 'backend', 'full', 'stack'],
  realtime: ['multiplayer', 'sync', 'snapshot', 'concurrent', 'clock', 'worker'],
  distributed: ['realtime', 'multiplayer', 'concurrent', 'versioned', 'worker', 'd1'],
  concurrency: ['concurrent', 'versioned', 'optimistic'],
  database: ['sql', 'mysql', 'postgresql', 'supabase', 'd1', 'sqlite'],
  db: ['database', 'sql'],
  cloud: ['cloudflare', 'worker', 'vercel', 'render', 'docker'],
  devops: ['docker', 'ci', 'github', 'actions', 'deploy'],
  test: ['testing', 'qa', 'regression', 'unit', 'integration', 'miniflare'],
  qa: ['test', 'regression', 'defect', 'accurate'],
  ati: ['accurate', 'technologies', 'qa'],
  accurate: ['qa', 'ecu', 'automotive', 'defect'],
  intern: ['internship', 'experience'],
  experience: ['intern', 'role', 'worked'],
  job: ['role', 'experience'],
  degree: ['education', 'computer', 'science', 'university'],
  school: ['education', 'university', 'wayne'],
  education: ['degree', 'university', 'gpa'],
  gpa: ['education'],
  hire: ['looking', 'roles', 'availability', 'internships', 'co'],
  fit: ['looking', 'roles', 'ai', 'built'],
  contact: ['email', 'linkedin', 'github', 'resume'],
  teach: ['mentor', 'tutor', 'coach', 'taught'],
  game: ['games', 'arcade', 'runner', 'multiplayer'],
  language: ['languages', 'python', 'typescript', 'java'],
  tech: ['stack', 'skills', 'languages'],
  technology: ['stack', 'skills'],
  skill: ['skills', 'stack'],
  project: ['projects', 'built'],
}

export function stem(word: string) {
  if (word.length <= 4) return word
  for (const suffix of ['ings', 'ing', 'ies', 'ed', 'es', 's']) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) return suffix === 'ies' ? `${word.slice(0, -3)}y` : word.slice(0, -suffix.length)
  }
  return word
}

export function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/full[\s-]?stack/g, 'fullstack')
    .replace(/real[\s-]?time/g, 'realtime')
    .split(/[^a-z0-9+#]+/)
    .filter((w) => w && !STOP.has(w))
    .map(stem)
}

export function expand(tokens: string[]) {
  const out = new Map<string, number>()
  for (const t of tokens) {
    out.set(t, Math.max(out.get(t) ?? 0, 1))
    for (const e of EXPAND[t] ?? []) {
      const s = stem(e)
      out.set(s, Math.max(out.get(s) ?? 0, 0.45))
    }
  }
  return out
}

export class Index {
  private docs: Doc[]
  private tf: Map<string, number>[] = []
  private len: number[] = []
  private df = new Map<string, number>()
  private avg = 0

  constructor(docs: Doc[]) {
    this.docs = docs
    for (const doc of docs) {
      const counts = new Map<string, number>()
      const add = (tokens: string[], weight: number) => tokens.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + weight))
      add(tokenize(doc.text), 1)
      add(tokenize(doc.title), doc.boost ?? 2)
      this.tf.push(counts)
      const length = [...counts.values()].reduce((a, b) => a + b, 0)
      this.len.push(length)
      counts.forEach((_, t) => this.df.set(t, (this.df.get(t) ?? 0) + 1))
    }
    this.avg = this.len.reduce((a, b) => a + b, 0) / Math.max(1, docs.length)
  }

  /** BM25 (k1 = 1.2, b = 0.75) over expanded query terms. */
  search(query: string, k = 6): { hits: Hit[]; terms: Map<string, number> } {
    const terms = expand(tokenize(query))
    const n = this.docs.length
    const hits: Hit[] = []
    this.docs.forEach((doc, i) => {
      let score = 0
      terms.forEach((w, t) => {
        const f = this.tf[i].get(t)
        if (!f) return
        const df = this.df.get(t) ?? 0
        const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5))
        score += w * idf * ((f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (this.len[i] / this.avg))))
      })
      if (score > 0) hits.push({ doc, score })
    })
    hits.sort((a, b) => b.score - a.score)
    return { hits: hits.slice(0, k), terms }
  }
}

/**
 * Picks the sentences of a passage that share the most terms with the query.
 * Returns an empty string when no sentence matches, so callers can drop it.
 */
export function extract(text: string, terms: Map<string, number>, max = 2) {
  // Split only at a period followed by a capital, so "Next.js" or "data.ts" stay intact.
  const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z0-9"(])/).map((s) => s.trim()).filter(Boolean)
  const scored = sentences.map((s, i) => {
    const toks = new Set(tokenize(s))
    let score = 0
    terms.forEach((w, t) => { if (toks.has(t)) score += w })
    return { s, i, score }
  })
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s)
    .join(' ')
}
