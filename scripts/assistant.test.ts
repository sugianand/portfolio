// The assistant must retrieve the right evidence for the questions recruiters
// actually ask, and refuse questions the site's data cannot answer.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { answer } from '../src/lib/assistant.ts'
import { stem } from '../src/lib/retrieval.ts'

const cases: [string, RegExp][] = [
  ['What AI projects has Sugi built?', /^(cinedna|portfolio|looking|11planner)/],
  ['What backend experience does he have?', /^(role-6f1a8e9|skills-backend|cinedna|three-clues|home-cleaning)/],
  ['What technologies does he know?', /^skills-/],
  ['Which project best demonstrates distributed or realtime engineering?', /^three-clues/],
  ['Why would Sugi be a good fit for an AI engineering role?', /^(looking|profile|cinedna)/],
  ['What did he do at Accurate Technologies?', /^role-7c3d2b8/],
  ['What is his GPA?', /^(education|stats)/],
  ['How do I contact Sugi?', /^contact/],
  ['How does CineDNA rank movies?', /^cinedna/],
  ['Has Sugi taught or mentored anyone?', /^role-(4e8b1d0|2d7e5c1|0c4b7f2)/],
  ['Where is he located?', /^profile/],
  ['When does he graduate?', /^education/],
  ['Where did he do his undergrad?', /^education/],
  ['Does he have leadership experience?', /^role-(4e8b1d0|2d7e5c1|0c4b7f2)/],
  ['Has he worked with LLMs?', /^(11planner|skills-ai_ml)/],
  ['What databases has he used?', /^skills-data/],
  ['Can I see his resume?', /^contact/],
  ['What was the hardest problem he solved?', /-hardest$/],
  ['What is CineDNA?', /^cinedna-/],
  ['Tell me about 11Planner', /^11planner-/],
  ['Does he know React?', /^skills-frontend/],
  ['Has he used Docker?', /^skills-infra/],
  ['What is his current job?', /^role-(4e8b1d0|9b2f6a4)/],
  ['What is his current role?', /^role-(4e8b1d0|9b2f6a4)/],
  ['Where does he currently work?', /^role-(4e8b1d0|9b2f6a4)/],
  ['What frameworks does he use?', /^skills-(frontend|backend)/],
  ['What is he studying?', /^education/],
  ['Is he available for internships?', /^looking/],
  ['Has he done machine learning?', /^skills-ai_ml/],
  ['What does he build?', /^profile/],
  ['Summarize Sugi in one line', /^profile/],
  // "Quick" must not match the contact passage that names the Quick summary panel.
  ['Give me a quick summary', /^profile$/],
  ['Can I get a short summary of Sugi?', /^profile$/],
  ['Give me a brief overview', /^profile$/],
  ['Is he a student?', /^education/],
  ['What did he learn from CineDNA?', /^cinedna-lessons$/],
  ['What lessons did he learn from Three Clues?', /^three-clues-lessons$/],
  ['What challenges did he face building 11Planner?', /^11planner-lessons$/],
  ['Does he know machine learning?', /^skills-ai_ml/],
  ['How many years of experience does he have?', /^role-/],
  ['What is his experience with RAG?', /^portfolio-/],
  ['How does the portfolio assistant work?', /^portfolio-/],
  ['Has he deployed anything to production?', /^(home-cleaning|11planner|portfolio|cinedna)-/],
  // "Hosted" asks about deployment, not Three Clues' game host.
  ['Where is the portfolio hosted?', /^portfolio-/],
  ['Where is this site hosted?', /^portfolio-/],
  ['Can he start immediately?', /^looking$/],
  ['When can he start?', /^looking$/],
  // "like AWS" must not match CineDNA's "like Interstellar", nor "services" its services/ai.py.
  ['Has he worked with cloud services like AWS?', /^skills-infra$/],
  ['What cloud platforms has he used?', /^skills-infra$/],
  ['Has he done any internships?', /^role-(6f1a8e9|7c3d2b8)$/],
  // "His code" asks for GitHub, not the portfolio's "Code-split" bullet.
  ['Where can I see his code?', /^contact$/],
  ['Can I see his repos?', /^contact$/],
  ['Is the code open source?', /^contact$/],
  ['What internships has he had?', /^role-(6f1a8e9|7c3d2b8)$/],
  ['Is he looking for internships?', /^looking$/],
  // Questions that name only a kind of passage list that kind.
  ['What jobs has he had?', /^role-/],
  ['Where has he worked?', /^role-/],
  ['List his projects', /^cinedna-summary$/],
  ['Show me his projects', /^cinedna-summary$/],
  ['What has he built?', /^cinedna-summary$/],
  // Superlatives and "what's" add nothing to rank by, so these list the projects too.
  ['What is his strongest project?', /^cinedna-summary$/],
  ["What's his most impressive project?", /^cinedna-summary$/],
  ['Which project is he proudest of?', /^cinedna-summary$/],
  ["What's his GitHub?", /^contact$/],
  // "APIs" skips the stemmer; it must find the APIs he built, not the "LLM APIs" skill.
  ['Has he built APIs?', /^(three-clues|home-cleaning|cinedna|11planner)-/],
  ['Has he built REST APIs?', /^(home-cleaning|cinedna|skills-backend)/],
  ['Has he worked with LLM APIs?', /^(skills-ai_ml|11planner)/],
  // Identity questions are all stop words apart from the name.
  ['Who is Sugi?', /^profile$/],
  ['Tell me about yourself', /^profile$/],
  ['What is his bachelors in?', /^education$/],
  ["Does he have a master's degree?", /^(education|role-a1f09e3)$/],
  ['Has he built a recommendation system?', /^cinedna-/],
  // A question that only names a project leads with what it is, not its numbers.
  ['What is Three Clues?', /^three-clues-summary$/],
  ['What is Movie in Three Clues?', /^three-clues-summary$/],
  ['What is the Home Cleaning Platform?', /^home-cleaning-summary$/],
  ['What is The Frantic Run?', /^frantic-run-summary$/],
  // "Go" the verb still works; only the language is missing from the data.
  ['Where did he go to school?', /^education$/],
  // Names that appear only in a project's stack or a role's place still answer.
  ['Has he used OpenAI?', /^11planner-/],
  ['Has he worked remotely?', /^role-6f1a8e9$/],
  ['Does he have experience with NLP?', /^(cinedna-|skills-ai_ml|looking)/],
  // Strengths questions ask why he fits; they were refused for lack of matching words.
  ['What are his strengths?', /^looking$/],
  ['What are his key strengths?', /^looking$/],
  ['What makes him stand out?', /^looking$/],
  ['What sets him apart?', /^looking$/],
  ["What's he good at?", /^looking$/],
  // Plurals like "games" and "roles" keep their e, so they meet "game" and "role".
  ['Has he built games?', /^(three-clues|frantic-run)-/],
  ['What games has he made?', /^(three-clues|frantic-run)-summary$/],
  // Roles he wants are not roles he has held.
  ['What roles is he targeting?', /^looking$/],
  ['Is he open to full-time roles?', /^looking$/],
  ['Which roles is he seeking?', /^looking$/],
  ['What roles has he held?', /^role-/],
  ['Why should we hire him?', /^looking$/],
]

test('strips -es only after a hissing sound', () => {
  assert.equal(stem('games'), stem('game'))
  assert.equal(stem('roles'), stem('role'))
  assert.equal(stem('boxes'), 'box')
  assert.equal(stem('matches'), 'match')
})

test('lists both games when asked about games', () => {
  const ids = answer('Has he built games?').snippets.map((s) => s.doc.source.kind === 'project' && s.doc.source.id)
  assert.ok(ids.includes('three-clues') && ids.includes('frantic-run'), String(ids))
})

test('quotes abbreviations like M.S. whole', () => {
  assert.match(answer('When does he graduate?').snippets[0].text, /^M\.S\. Artificial Intelligence/)
})

test('says what a project does, not just its name', () => {
  assert.match(answer('What does 11Planner do?').snippets[0].text, /study planner/)
})

test('lists only the internships when asked about internships', () => {
  const ids = answer('Has he done any internships?').snippets.map((s) => s.doc.id)
  assert.deepEqual(ids.sort(), ['role-6f1a8e9', 'role-7c3d2b8'])
})

test('reads "good at" as strengths only when nothing follows it', () => {
  assert.notEqual(answer('Is he good at Python?').snippets[0].doc.id, 'looking')
})

test('keeps ML terms apart from look-alike words', () => {
  assert.ok(!answer('Has he worked with embeddings?').snippets.some((s) => s.doc.id === 'role-7c3d2b8'))
  assert.ok(!answer('Has he fine-tuned models?').snippets.some((s) => s.doc.id === 'frantic-run-lessons'))
  assert.equal(answer('Has he worked with computer vision?').snippets.length, 0)
  assert.equal(answer('Has he tested embedded software?').snippets[0].doc.id, 'role-7c3d2b8')
  assert.equal(answer('What computer science degree does he have?').snippets[0].doc.id, 'education')
})

test('refuses kinds of apps and deployments the data never mentions', () => {
  for (const q of ['Has he built a mobile app?', 'Has he built an iOS app?', 'Has he built a blockchain app?', 'Has he built a desktop application?', 'Does he have experience with Kubernetes deployments?']) {
    assert.equal(answer(q).snippets.length, 0, q)
  }
  assert.equal(answer('Has he built a realtime system?').snippets[0].doc.id, 'three-clues-summary')
  assert.equal(answer('Has he built a Next.js app?').snippets[0].doc.id, '11planner-summary')
})

test('refuses work authorization questions the data cannot answer', () => {
  assert.equal(answer('Does he need visa sponsorship?').snippets.length, 0)
})

for (const [q, expected] of cases) {
  test(q, () => {
    const a = answer(q)
    assert.ok(a.snippets.length > 0, 'expected an answer')
    assert.match(a.snippets[0].doc.id, expected, `top hit was ${a.snippets[0].doc.id}`)
  })
}

test('refuses questions outside the data', () => {
  for (const q of ['What is the capital of France?', 'Give me a pizza recipe', 'zzzz', 'Does he need visa sponsorship?', 'Is he open to relocation?', 'What is his salary expectation?', 'Has he used AWS?', 'Is he a US citizen?', 'Has he worked at Google?', 'What is his phone number?', 'Does he know Go?', 'Has he used Golang?']) {
    assert.equal(answer(q).snippets.length, 0, q)
  }
})
