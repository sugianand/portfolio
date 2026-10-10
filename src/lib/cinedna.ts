// A faithful TypeScript port of CineDNA's "describe a vibe" engine
// (backend/app/services/ai.py + scoring.py + data/movies.py in sugianand/CineDNA),
// so visitors can run the real ranking in the browser. Parity with the Python
// implementation is checked by scripts/cinedna.test.ts against fixtures generated
// from the original code.

export type Dimension =
  | 'emotional_intensity' | 'narrative_complexity' | 'visual_spectacle' | 'pacing' | 'mystery'
  | 'romance' | 'darkness' | 'humor' | 'plot_twists' | 'action' | 'character_depth'
  | 'world_building' | 'dialogue_density' | 'rewatchability'

export type Movie = {
  title: string
  year: number
  country: string
  genres: string[]
  themes: string[]
  dimensions: Record<Dimension, number>
  summary: string
}

export type Intent = {
  target: Partial<Record<Dimension, number>>
  includeThemes: string[]
  excludeThemes: string[]
  preferredCountries: string[]
  referenceTitles: string[]
  explanation: string
}

export type Result = { movie: Movie; score: number; why: string }

const d = (v: number[]): Record<Dimension, number> => {
  const keys: Dimension[] = ['emotional_intensity', 'narrative_complexity', 'visual_spectacle', 'pacing', 'mystery', 'romance', 'darkness', 'humor', 'plot_twists', 'action', 'character_depth', 'world_building', 'dialogue_density', 'rewatchability']
  return Object.fromEntries(keys.map((k, i) => [k, v[i]])) as Record<Dimension, number>
}

export const MOVIES: Movie[] = [
  { title: 'Interstellar', year: 2014, country: 'USA', genres: ['Science Fiction', 'Drama', 'Adventure'], themes: ['time', 'family', 'sacrifice', 'survival', 'space', 'humanity'], dimensions: d([94, 88, 97, 71, 84, 45, 66, 17, 80, 64, 86, 95, 62, 91]), summary: "A grand, emotional science-fiction story about family, time, survival, and humanity's future." },
  { title: 'Arrival', year: 2016, country: 'USA', genres: ['Science Fiction', 'Drama', 'Mystery'], themes: ['language', 'time', 'grief', 'communication', 'humanity', 'choice'], dimensions: d([88, 86, 78, 55, 91, 32, 61, 8, 93, 22, 90, 80, 77, 86]), summary: 'A cerebral first-contact story built around language, grief, perception, and a major emotional revelation.' },
  { title: 'Inception', year: 2010, country: 'USA', genres: ['Science Fiction', 'Thriller', 'Action'], themes: ['dreams', 'memory', 'guilt', 'reality', 'identity', 'heist'], dimensions: d([79, 96, 95, 86, 88, 24, 67, 16, 90, 88, 75, 94, 78, 95]), summary: 'A high-concept dream heist combining layered reality, emotional guilt, action, and puzzle-box storytelling.' },
  { title: 'Shutter Island', year: 2010, country: 'USA', genres: ['Psychological Thriller', 'Mystery'], themes: ['identity', 'trauma', 'memory', 'guilt', 'madness', 'truth'], dimensions: d([82, 89, 66, 65, 97, 12, 93, 3, 98, 31, 89, 65, 72, 90]), summary: 'A dark psychological mystery about trauma, identity, and the dangerous boundary between truth and delusion.' },
  { title: 'Prisoners', year: 2013, country: 'USA', genres: ['Crime', 'Thriller', 'Drama'], themes: ['morality', 'family', 'obsession', 'justice', 'faith', 'desperation'], dimensions: d([93, 76, 52, 62, 92, 2, 98, 1, 85, 38, 96, 41, 72, 76]), summary: 'A morally brutal missing-person thriller driven by desperation, ambiguity, and intense performances.' },
  { title: 'Knives Out', year: 2019, country: 'USA', genres: ['Mystery', 'Comedy', 'Crime'], themes: ['family', 'class', 'deception', 'greed', 'murder', 'truth'], dimensions: d([58, 80, 48, 78, 93, 5, 48, 78, 89, 18, 72, 39, 91, 88]), summary: 'A witty modern murder mystery with layered deception, family conflict, social satire, and sharp dialogue.' },
  { title: 'Dune: Part Two', year: 2024, country: 'USA', genres: ['Science Fiction', 'Adventure', 'Drama'], themes: ['power', 'destiny', 'religion', 'war', 'colonialism', 'love'], dimensions: d([82, 79, 100, 83, 61, 47, 75, 8, 63, 91, 83, 100, 64, 94]), summary: 'A monumental science-fiction epic focused on power, prophecy, war, love, and political transformation.' },
  { title: 'The Dark Knight', year: 2008, country: 'USA', genres: ['Crime', 'Action', 'Drama'], themes: ['chaos', 'morality', 'justice', 'sacrifice', 'corruption', 'identity'], dimensions: d([84, 77, 89, 91, 58, 19, 89, 12, 77, 94, 90, 76, 74, 98]), summary: 'A crime epic about chaos, justice, sacrifice, and moral compromise disguised as a superhero film.' },
  { title: 'Andhadhun', year: 2018, country: 'India', genres: ['Thriller', 'Comedy', 'Crime'], themes: ['deception', 'murder', 'luck', 'greed', 'identity', 'morality'], dimensions: d([70, 91, 48, 88, 94, 21, 76, 72, 100, 37, 72, 35, 73, 93]), summary: 'A wickedly unpredictable Indian black-comedy thriller packed with deception, murder, and constant reversals.' },
  { title: 'Drishyam', year: 2015, country: 'India', genres: ['Crime', 'Thriller', 'Drama'], themes: ['family', 'crime', 'deception', 'protection', 'memory', 'justice'], dimensions: d([86, 87, 33, 70, 88, 8, 78, 14, 94, 20, 88, 31, 74, 89]), summary: 'A tightly constructed Indian thriller about an ordinary father using intelligence and storytelling to protect his family.' },
  { title: '3 Idiots', year: 2009, country: 'India', genres: ['Comedy', 'Drama'], themes: ['friendship', 'education', 'pressure', 'success', 'creativity', 'family'], dimensions: d([84, 55, 44, 75, 28, 35, 34, 93, 49, 8, 88, 36, 82, 97]), summary: 'A heartfelt comedy-drama about friendship, education pressure, creativity, and choosing a meaningful life.' },
  { title: 'Tumbbad', year: 2018, country: 'India', genres: ['Horror', 'Fantasy', 'Drama'], themes: ['greed', 'mythology', 'curse', 'family', 'wealth', 'consequence'], dimensions: d([75, 73, 86, 68, 82, 8, 98, 1, 70, 39, 78, 94, 56, 84]), summary: 'A visually distinctive Indian folk-horror fable about greed, mythology, inheritance, and consequence.' },
]

const FAST_PACING_TERMS = ['fast', 'fast paced', 'fast-paced']
const SLOW_PACING_TERMS = ['slow', 'slow burn', 'slow-burn']

const DIMENSION_RULES: [Dimension, string[]][] = [
  ['emotional_intensity', ['emotional', 'moving', 'heartfelt', 'sad', 'cry']],
  ['narrative_complexity', ['complex', 'mind bending', 'mind-bending', 'cerebral', 'confusing']],
  ['visual_spectacle', ['beautiful', 'visual', 'cinematic', 'spectacle', 'epic']],
  ['pacing', [...FAST_PACING_TERMS, ...SLOW_PACING_TERMS]],
  ['mystery', ['mystery', 'mysterious', 'detective', 'whodunit']],
  ['romance', ['romance', 'romantic', 'love story']],
  ['darkness', ['dark', 'bleak', 'grim']],
  ['humor', ['funny', 'comedy', 'humor', 'hilarious']],
  ['plot_twists', ['twist', 'twisty', 'unpredictable', 'shocking']],
  ['action', ['action', 'fight', 'explosive']],
  ['character_depth', ['character driven', 'character-driven', 'deep characters']],
  ['world_building', ['world building', 'world-building', 'immersive world']],
  ['dialogue_density', ['dialogue', 'talky', 'conversation']],
  ['rewatchability', ['rewatchable', 'rewatch']],
]

const NEGATED_THEME_ALIASES: Record<string, string> = {
  mysterious: 'mystery', detective: 'mystery', whodunit: 'mystery',
  romantic: 'romance', 'love story': 'romance',
  funny: 'comedy', humor: 'comedy', hilarious: 'comedy',
}

const THEME_VOCAB = [
  'family', 'time', 'space', 'survival', 'identity', 'memory', 'guilt', 'reality',
  'morality', 'justice', 'crime', 'deception', 'murder', 'greed', 'friendship',
  'education', 'mythology', 'power', 'destiny', 'religion', 'war', 'love',
  'trauma', 'truth', 'dreams', 'language', 'grief', 'communication', 'action',
  'comedy', 'horror', 'mystery', 'romance', 'thriller', 'science fiction',
]

export const DIMENSION_WEIGHTS: Record<Dimension, number> = {
  emotional_intensity: 1.15, narrative_complexity: 1.05, visual_spectacle: 0.95, pacing: 1.0,
  mystery: 1.1, romance: 0.75, darkness: 0.9, humor: 0.85, plot_twists: 1.1, action: 0.9,
  character_depth: 1.05, world_building: 0.9, dialogue_density: 0.7, rewatchability: 0.7,
}

const NEGATION_PREFIX = '(?:without|no|avoid(?:ing)?|exclud(?:e|ing)|not)'
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')
const normalize = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const contains = (query: string, term: string) => {
  const t = normalize(term)
  return t.length > 0 && ` ${query} `.includes(` ${t} `)
}
const unique = (xs: string[]) => [...new Set(xs)].sort()

function findReferences(query: string, movies: Movie[]): Movie[] {
  const exact = movies.filter((m) => contains(query, m.title))
  if (exact.length) return exact
  const byBase = new Map<string, Movie[]>()
  for (const m of movies) {
    const base = m.title.split(/:|\s[-–—]\s/)[0].trim()
    if (base !== m.title && normalize(base).length >= 4) {
      const key = normalize(base)
      byBase.set(key, [...(byBase.get(key) ?? []), m])
    }
  }
  return [...byBase.entries()].filter(([base, c]) => c.length === 1 && contains(query, base)).map(([, c]) => c[0])
}

function applyModifier(query: string, keyword: string, current: number) {
  const k = escapeRe(normalize(keyword))
  const less = [`less\\s+${k}`, `not\\s+(?:too\\s+)?${k}`, `without\\s+(?:too\\s+much\\s+)?${k}`]
  const more = [`more\\s+${k}`, `very\\s+${k}`, `really\\s+${k}`]
  if (less.some((p) => new RegExp(p).test(query))) return Math.max(5, current - 25)
  if (more.some((p) => new RegExp(p).test(query))) return Math.min(100, current + 20)
  return current
}

function isNegated(query: string, term: string) {
  const t = escapeRe(term).replace(/ /g, '\\s+')
  return new RegExp(`\\b${NEGATION_PREFIX}\\s+(?:(?:any|too\\s+much)\\s+)?${t}\\b`).test(query)
}

export function parseIntent(query: string, movies: Movie[] = MOVIES): Intent {
  const q = normalize(query)
  const refs = findReferences(q, movies)
  const target: Partial<Record<Dimension, number>> = refs.length ? { ...refs[0].dimensions } : {}
  const include: string[] = []
  const exclude: string[] = []
  const countries: string[] = []

  if (['indian', 'bollywood', 'hindi'].some((w) => contains(q, w))) countries.push('India')
  if (['american', 'hollywood', 'us movie', 'u.s.'].some((w) => contains(q, w))) countries.push('USA')

  for (const theme of THEME_VOCAB) {
    if (!contains(q, theme)) continue
    ;(isNegated(q, theme) ? exclude : include).push(theme)
  }

  for (const [dim, keywords] of DIMENSION_RULES) {
    const matched = keywords.find((k) => contains(q, k))
    if (!matched) continue
    let current = target[dim] ?? 75
    if (dim === 'pacing') {
      const negPacing = keywords.find((k) => contains(q, k) && isNegated(q, k))
      if (negPacing) current = SLOW_PACING_TERMS.includes(negPacing) ? 85 : 35
      else current = SLOW_PACING_TERMS.includes(matched) ? 35 : 85
    } else if (isNegated(q, matched)) {
      current = 10
      const alias = NEGATED_THEME_ALIASES[matched]
      if (alias) exclude.push(alias)
    } else {
      current = applyModifier(q, matched, current)
    }
    target[dim] = current
  }

  if (q.includes('less complicated') || q.includes('less confusing')) target.narrative_complexity = Math.max(20, (target.narrative_complexity ?? 70) - 30)
  if (q.includes('darker')) target.darkness = Math.min(100, (target.darkness ?? 65) + 25)
  if (q.includes('funnier') || q.includes('more funny')) target.humor = Math.min(100, (target.humor ?? 55) + 25)

  const referenceTitles = refs.map((m) => m.title)
  return {
    target,
    includeThemes: unique(include),
    excludeThemes: unique(exclude),
    preferredCountries: countries,
    referenceTitles,
    explanation: referenceTitles.length
      ? `Started from the Movie DNA of ${referenceTitles[0]} and adjusted it using your request.`
      : 'Converted your natural-language request into Movie DNA traits and themes.',
  }
}

const matching = (movie: Movie, prefs: string[]) => {
  const terms = [...movie.themes, ...movie.genres].map(normalize)
  return new Set(prefs.map(normalize).filter((p) => p && terms.some((t) => ` ${t} `.includes(` ${p} `))))
}

function dimensionSimilarity(movie: Movie, target: Intent['target']) {
  const entries = Object.entries(target) as [Dimension, number][]
  if (!entries.length) return 0.5
  let err = 0
  let total = 0
  for (const [name, desired] of entries) {
    const w = DIMENSION_WEIGHTS[name] ?? 1
    err += w * ((movie.dimensions[name] - desired) / 100) ** 2
    total += w
  }
  return total === 0 ? 0.5 : Math.max(0, 1 - Math.sqrt(err / total))
}

function themeSimilarity(movie: Movie, intent: Intent) {
  const include = new Set(intent.includeThemes.map(normalize))
  const exclude = new Set(intent.excludeThemes.map(normalize))
  if (!include.size && !exclude.size) return 0.5
  const excluded = matching(movie, [...exclude]).size
  const exclusion = exclude.size ? 1 - excluded / Math.max(1, exclude.size) : 1
  if (!include.size) return Math.max(0, Math.min(1, exclusion))
  const included = matching(movie, [...include]).size / include.size
  return Math.max(0, Math.min(1, included * 0.8 + exclusion * 0.2))
}

export function scoreMovie(movie: Movie, intent: Intent) {
  let score = dimensionSimilarity(movie, intent.target) * 0.72 + themeSimilarity(movie, intent) * 0.28
  if (intent.preferredCountries.length) {
    const preferred = intent.preferredCountries.map((c) => c.toLowerCase())
    score += preferred.includes(movie.country.toLowerCase()) ? 0.08 : -0.05
  }
  return Math.round(Math.max(0, Math.min(1, score)) * 1000) / 10
}

export function matchReason(movie: Movie, intent: Intent) {
  const reasons: string[] = []
  const own = new Set([...movie.themes, ...movie.genres].map((x) => x.toLowerCase()))
  const themes = intent.includeThemes.filter((t) => own.has(t.toLowerCase()))
  if (themes.length) reasons.push(`matches ${themes.slice(0, 3).join(', ')}`)
  const dims = Object.keys(intent.target) as Dimension[]
  if (dims.length) {
    const closest = [...dims].sort((a, b) => Math.abs(movie.dimensions[a] - intent.target[a]!) - Math.abs(movie.dimensions[b] - intent.target[b]!)).slice(0, 2)
    reasons.push(`strong fit for ${closest.map((n) => n.replace(/_/g, ' ')).join(' and ')}`)
  }
  if (intent.preferredCountries.includes(movie.country)) reasons.push(`fits your ${movie.country} preference`)
  return reasons.join('; ') || 'overall Movie DNA similarity'
}

export function search(query: string, limit = 6): { intent: Intent; results: Result[] } {
  const intent = parseIntent(query)
  const refs = new Set(intent.referenceTitles.map((t) => t.toLowerCase()))
  const results = MOVIES
    .filter((m) => !refs.has(m.title.toLowerCase()) && matching(m, intent.excludeThemes).size === 0)
    .map((movie) => ({ movie, score: scoreMovie(movie, intent), why: matchReason(movie, intent) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
  return { intent, results }
}
