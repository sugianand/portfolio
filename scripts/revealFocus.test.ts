import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// Focus visible (WCAG 2.4.7): a .reveal block fades in over ~0.9s, so Tab could land on a
// button at opacity 0. Any focus inside a reveal must show it fully, with no fade.
const app = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')

test('focus inside a reveal shows it at once', () => {
  const rule = app.match(/^\.reveal:focus-within \{([^}]*)\}/m)
  assert.ok(rule, 'missing .reveal:focus-within rule')
  assert.match(rule[1], /opacity: 1/)
  assert.match(rule[1], /transform: none/)
  assert.match(rule[1], /transition: none/)
})
