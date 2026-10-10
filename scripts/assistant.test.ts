// The assistant must retrieve the right evidence for the questions recruiters
// actually ask, and refuse questions the site's data cannot answer.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { answer } from '../src/lib/assistant.ts'

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
]

for (const [q, expected] of cases) {
  test(q, () => {
    const a = answer(q)
    assert.ok(a.snippets.length > 0, 'expected an answer')
    assert.match(a.snippets[0].doc.id, expected, `top hit was ${a.snippets[0].doc.id}`)
  })
}

test('refuses questions outside the data', () => {
  for (const q of ['What is the capital of France?', 'Give me a pizza recipe', 'zzzz']) {
    assert.equal(answer(q).snippets.length, 0, q)
  }
})
