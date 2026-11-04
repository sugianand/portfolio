// Parity test: the in-browser CineDNA port must rank exactly like the original
// Python engine. Fixtures come from running sugianand/CineDNA's
// parse_search_intent + rank_movies + build_match_reason on these queries.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { matchReason, search } from '../src/lib/cinedna.ts'

type Fixture = {
  query: string
  intent: { target: Record<string, number>; include: string[]; exclude: string[]; countries: string[]; refs: string[] }
  results: { title: string; score: number; why: string }[]
}

const fixtures: Fixture[] = JSON.parse(readFileSync(new URL('./cinedna.fixtures.json', import.meta.url), 'utf8'))

for (const f of fixtures) {
  test(`matches Python for "${f.query}"`, () => {
    const { intent, results } = search(f.query)
    assert.deepEqual(intent.target, f.intent.target)
    assert.deepEqual(intent.includeThemes, f.intent.include)
    assert.deepEqual(intent.excludeThemes, f.intent.exclude)
    assert.deepEqual(intent.preferredCountries, f.intent.countries)
    assert.deepEqual(intent.referenceTitles, f.intent.refs)
    assert.deepEqual(results.map((r) => r.movie.title), f.results.map((r) => r.title))
    results.forEach((r, i) => {
      assert.ok(Math.abs(r.score - f.results[i].score) <= 0.1, `${r.movie.title}: ${r.score} vs ${f.results[i].score}`)
      assert.equal(r.why, f.results[i].why)
    })
  })
}

test('readable reasons say "low" for negated dimensions, never "strong fit for romance" after "without romance"', () => {
  const { intent, results } = search('slow burn dark mystery without romance')
  const reasons = results.map((r) => matchReason(r.movie, intent, true))
  assert.equal(reasons[1], 'matches mystery; strong fit for low romance and darkness')
  for (const why of reasons) assert.doesNotMatch(why, /(?<!low )romance/)
  const action = search('mind-bending sci-fi, not too much action')
  for (const r of action.results) assert.match(matchReason(r.movie, action.intent, true), /low action/)
  // Dimensions the user asked for stay unprefixed.
  const twisty = search('not slow, very twisty thriller')
  assert.equal(matchReason(twisty.results[0].movie, twisty.intent, true), twisty.results[0].why)
})
