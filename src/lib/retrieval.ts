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

const STOP = new Set('a an and are as at be but by can did do does for from has have he her his how i in is it its me of on or our she so than that the their them they this to was what when where which who why will with would you your about tell sugi suganeshwara anand any some has had into also just more most best need see use used using like such done list all ever'.split(' '))
// Superlatives ("his strongest project", "his biggest project") rank nothing the data says, like "best" above,
// and neither does the "s" left over from "what's" or "he's".
for (const w of 's strongest proudest proud impressive favorite favourite standout flagship greatest coolest biggest largest top notable'.split(' ')) STOP.add(w)
// "Give me a quick summary" asks for the profile; "quick" would otherwise match
// the contact passage that names the Quick summary panel.
for (const w of 'give quick brief short'.split(' ')) STOP.add(w)
// "What roles has he held?" names only a kind of passage, so it lists the jobs.
STOP.add('held')
// "His last job" or "most recent internship" asks which job; the job passages list the
// newest first and carry their dates, so recency words would only match "the latest
// server snapshot" or nothing at all.
for (const w of 'last latest recent recently previous previously prior past newest'.split(' ')) STOP.add(w)
// "Is he good at system design?" asks about the design; the data never says "good".
STOP.add('good')

// Query-side expansion: recruiter vocabulary mapped onto words that appear in the data.
const EXPAND: Record<string, string[]> = {
  ai: ['ml', 'llm', 'recommendation', 'ranking', 'retrieval', 'intelligence', 'nlu', 'bm25', 'openai'],
  ml: ['ai', 'recommendation', 'ranking', 'pytorch', 'tensorflow'],
  lesson: ['learn', 'challenge'],
  llm: ['openai', 'ai', 'estimator'],
  llms: ['llm', 'openai', 'estimator'],
  openai: ['llm', 'estimator'],
  nlp: ['nlu', 'natural', 'language'],
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
  production: ['live', 'deploy'],
  deploy: ['live', 'deployment', 'vercel'],
  devops: ['docker', 'ci', 'github', 'actions', 'deploy'],
  test: ['testing', 'qa', 'regression', 'unit', 'integration', 'miniflare'],
  qa: ['test', 'regression', 'defect', 'accurate'],
  ati: ['accurate', 'technologies', 'qa'],
  accurate: ['qa', 'ecu', 'automotive', 'defect'],
  // A model's accuracy is stated as its error ("949 km median error").
  accuracy: ['error', 'median'],
  intern: ['internship', 'experience'],
  experience: ['intern', 'role', 'worked'],
  job: ['role', 'experience'],
  degree: ['education', 'computer', 'science', 'university'],
  school: ['education', 'university', 'wayne'],
  education: ['degree', 'university', 'gpa'],
  gpa: ['education'],
  graduate: ['education', 'degree', 'progress'],
  graduation: ['education', 'degree', 'progress'],
  undergrad: ['education', 'completed'],
  undergraduate: ['education', 'completed'],
  bachelor: ['education', 'completed', 'computer', 'science'],
  master: ['education', 'progress', 'artificial', 'intelligence'],
  recommendation: ['recommendations', 'ranking', 'rank'],
  recommender: ['recommendation', 'recommendations', 'ranking'],
  student: ['education', 'degree', 'progress'],
  study: ['education', 'master', 'degree', 'intelligence', 'progress'],
  location: ['detroit'],
  currently: ['current', 'now', 'progress'],
  current: ['now'],
  leadership: ['mentor', 'coach', 'taught', 'lead'],
  lead: ['mentor', 'coach', 'taught'],
  available: ['looking', 'availability', 'roles'],
  hire: ['looking', 'roles', 'availability', 'internships', 'co'],
  fit: ['looking', 'roles', 'ai', 'built'],
  contact: ['email', 'linkedin', 'github', 'resume'],
  teach: ['mentor', 'tutor', 'coach', 'taught'],
  game: ['games', 'runner', 'multiplayer'],
  language: ['languages', 'python', 'typescript', 'java'],
  tech: ['stack', 'skills', 'languages'],
  technology: ['stack', 'skills'],
  skill: ['skills', 'stack'],
  framework: ['react', 'next', 'fastapi', 'django', 'express', 'blazor'],
  project: ['projects', 'built'],
  build: ['builder', 'builds', 'built'],
  summarize: ['builder', 'engineer', 'software'],
  summary: ['builder', 'engineer', 'software'],
  overview: ['builder', 'engineer', 'software'],
}
// Questions are stemmed before lookup, so the keys must be too: "distributed"
// arrives as "distribut" and "devops" as "devop".
const EXPANSIONS = new Map(Object.entries(EXPAND).map(([k, v]) => [stem(k), v]))

export function stem(word: string) {
  if (word.length <= 4) return word
  // "-es" is a suffix only after a hiss ("classes", "matches"); in "games" or "roles"
  // the e belongs to the word, so only the s goes and the plural meets its singular.
  for (const suffix of ['ings', 'ing', 'ies', 'ed', 'es', 's']) {
    if (suffix === 'es' && !/(s|x|z|ch|sh)es$/.test(word)) continue
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) return suffix === 'ies' ? `${word.slice(0, -3)}y` : word.slice(0, -suffix.length)
  }
  return word
}

export function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/full[\s-]?stack/g, 'fullstack')
    .replace(/real[\s-]?time/g, 'realtime')
    // "Learn" alone asks for lessons; "machine learning" asks for ML, and "years of
    // experience" for the roles (the year count is not in the data).
    .replace(/\b(machine|deep)[\s-]?learning\b/g, 'ml')
    .replace(/\bhow many years of experience\b/g, 'experience')
    .replace(/\blocated\b/g, 'location')
    // "Led" is too short for the stemmer, so "has he led a project?" must become "lead".
    .replace(/\bled\b/g, 'lead')
    // "Where is he based?" asks for his location; "rule-based" in the data must not match it.
    .replace(/^(\s*where\b.*)\bbased\b|\bbased (in|out of)\b/, '$1location')
    // "How can I reach him?" or "get in touch" asks for contact details.
    .replace(/\breach (out to )?(him|sugi)\b|\breach out\b|\bget in touch\b/g, 'contact')
    // The data says "Remote", so "has he worked remotely?" must find that role.
    .replace(/\bremotely\b/g, 'remote')
    // Short plurals skip the stemmer, so "APIs" would only match "LLM APIs";
    // and "LLM APIs" ask about LLMs, not about building APIs.
    .replace(/\bllms? apis?\b/g, 'llms')
    .replace(/\bapis\b/g, 'api')
    // "Cloud services" asks about cloud, not about a file like services/ai.py.
    .replace(/\bcloud (services?|platforms?|providers?|computing)\b/g, 'cloud')
    // "Where is it hosted?" asks about deployment, not Three Clues' game host.
    .replace(/\b(hosted|hosting)\b/g, 'deploy')
    // "Experience with RAG" asks about RAG, not about jobs; "how does X work"
    // asks how X works, not where he works; "when can he start" asks for availability.
    .replace(/\bexperience (with|in|using)\b/g, ' ')
    .replace(/^(\s*how\b.*)\bworks?\b/, '$1')
    .replace(/\b(when can (he|sugi) start|start (immediately|soon|right away)|start date)\b/g, 'available')
    // "Full time or part time?" asks what kind of role he wants, not about "full website revamp".
    .replace(/\b(full|part)[\s-]?time\b/g, 'available')
    // "Roles he's targeting" or "open to full-time roles" asks what he wants next, not his past jobs.
    .replace(/\broles?\b(?=.*\b(targets?|targeting|seeking|open to|looking for)\b)|(?<=\b(targets?|targeting|seeking|open to|looking for)\b.*)\broles?\b/g, 'available')
    // "Who is Sugi?" asks for the one-line summary; its other words are all stop words.
    .replace(/^\s*(who is (he|sugi|suganeshwara)( anand)?|tell me about (him|yourself|sugi|suganeshwara)( anand)?|introduce (him|yourself|sugi))\W*$/, 'summary')
    // "Where can I see his code?" asks for his GitHub, not the "Code-split" bullet.
    .replace(/\b(his|sugi'?s) (source )?code\b|\bsource code\b|\bopen[\s-]?source\b|\b(code )?repo(s|sitory|sitories)?\b/g, 'github')
    // "What are his strengths?" or "what makes him stand out?" asks why he fits,
    // which the data answers with what he builds and the roles he wants.
    // So does "his strongest skill" or "what is he best at", which no skill list can rank.
    .replace(/\b((key|main|biggest|core) )?strengths?\b|\b(he|sugi)('?s| is)? (really )?(good|best) at\W*$|\bexcels? at\W*$|\bdo(es)? best\W*$|\b(strongest|best|greatest) (technical )?(skill|area)s?\W*$|\bstands? out\b|\bsets? (him|sugi) apart\b/g, 'fit')
    // "His best work" or "show me his work" asks for projects, not where he works.
    .replace(/\b(best|strongest|finest|top|greatest|proudest|favou?rite|impressive|notable) work\b|\bshow me (his|sugi'?s) work\b|\bwork (is )?(he|sugi)('?s| is)? (most )?proud(est)? of\b/g, 'project')
    // ML terms must not collide with look-alike words: "embeddings" and "embedded"
    // stem alike, "fine-tuned" is not the game's "tuning", and "computer vision"
    // is not "Computer Science".
    .replace(/\bembedded\b/g, 'embeddedsystem')
    .replace(/\bfine[\s-]?tun(e|ed|es|ing)\b/g, 'finetune')
    .replace(/\bcomputer vision\b/g, 'computervision')
    // "System design" asks how he architects systems; "what does X look like" is
    // not "looking for" a role.
    .replace(/\b(systems? design|(software|system) architecture|design(ing)? systems|architect(ed|ing|s)?)\b/g, 'architecture')
    .replace(/\blooks? like\b/g, ' ')
    // "Team player" or "worked on a team" asks about teamwork, not the game's team modes;
    // the data shows it as 11Planner's contributors and Agile sprints.
    // "How big was the team?" asks for its size, which the data gives as contributors;
    // "big" alone would quote the Movies hobby's "big releases".
    .replace(/\bhow (big|large)\b(.*)\bteams?\b|\bteams? size\b|\bhow many (people|developers|engineers|members|teammates)\b/g, '$2 contributors')
    .replace(/\bteam[\s-]?(player|work|mates?)\b|\b(work(ed|s)?|been) (on|in|with|as part of) (a |the )?teams?\b|\bcollaborat\w*/g, 'contributors agile')
    // "What does he do for fun?" or "outside of work" asks about the B-Roll, not his jobs.
    // "His favorite movie" is one of those favorites, not Movie in Three Clues.
    .replace(/\b(outside (of )?work|off the clock|free time|spare time|for fun|(?<!(research|technical|academic) )interests|hobby)\b/g, 'hobbies')
    .replace(/\bfavou?rite (movies?|films?|sports?|foods?|restaurants?|spots?)\b/g, 'hobbies $1')
    // The data has no phone number, and "number" alone would match the stats.
    .replace(/\b(phone|cell|mobile) (number|no)\b/g, 'phone')
    .split(/[^a-z0-9+#]+/)
    .filter((w) => w && !STOP.has(w))
    .map(stem)
}

export function expand(tokens: string[]) {
  const out = new Map<string, number>()
  for (const t of tokens) {
    out.set(t, Math.max(out.get(t) ?? 0, 1))
    for (const e of EXPANSIONS.get(t) ?? []) {
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

  /** Whether any passage contains the term. */
  has(term: string) {
    return this.df.has(term)
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
  // Abbreviations like "M.S." or "B.S." do not end a sentence either.
  const sentences = text.split(/(?<=[.!?])(?<!\b[A-Z]\.[A-Z]\.)\s+(?=[A-Z0-9"(])/).map((s) => s.trim()).filter(Boolean)
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
