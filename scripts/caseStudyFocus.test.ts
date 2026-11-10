import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// The case study sheet remounts for each project (key={project.id}), so moving to the
// next one with ←/→ used to drop keyboard focus to <body>.
const src = readFileSync(new URL('../src/components/ProjectDetail.tsx', import.meta.url), 'utf8')

test('the header arrows are tagged so focus can return to them', () => {
  assert.match(src, /aria-label="Previous project" data-nav="prev"/)
  assert.match(src, /aria-label="Next project" data-nav="next"/)
})

test('every way of paging records where focus was', () => {
  assert.doesNotMatch(src, /onNav\((1|-1)\)/, 'page through go(), not onNav() directly')
  assert.match(src, /navFrom\.current = \(document\.activeElement[^)]*\)\?\.dataset\.nav/)
})

test('focus moves into the new sheet after paging', () => {
  assert.match(src, /useLayoutEffect\(\(\) => \{\n\s+const sheet = sheetRef\.current\n\s+if \(!sheet \|\| sheet\.contains\(document\.activeElement\)\) return[\s\S]*?\(target \?\? sheet\)\.focus\(\{ preventScroll: true \}\)\n\s+\}, \[project\.id\]\)/)
})

test('the opener is captured before that refocus runs', () => {
  const opener = src.indexOf("unlock('casestudy')")
  const refocus = src.indexOf('}, [project.id])')
  assert.ok(opener > 0 && opener < refocus)
  assert.match(src.slice(0, opener), /useLayoutEffect\(\(\) => \{\n\s+$/)
})
