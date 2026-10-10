// Parity test: the in-browser CineDNA port must rank exactly like the original
// Python engine. Fixtures come from running sugianand/CineDNA's
// parse_search_intent + rank_movies + build_match_reason on these queries.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { search } from '../src/lib/cinedna.ts'

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
