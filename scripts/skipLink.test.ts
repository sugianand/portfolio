import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// Bypass blocks (WCAG 2.4.1): the skip link is the first thing rendered, so it is the
// first Tab stop, and it targets a focusable <main>.
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')

test('the skip link renders before anything else', () => {
  const body = app.slice(app.indexOf('return ('))
  const first = body.match(/<([A-Z]\w*)/)
  assert.equal(first?.[1], 'SkipLink')
})

test('the skip link targets a focusable main', () => {
  assert.match(app, /href="#main"/)
  assert.match(app, /<main id="main" tabIndex=\{-1\}>/)
})

test('the skip link shows on focus and stays out of print', () => {
  assert.match(css, /\.skip-link:focus \{ transform: none; \}/)
  assert.match(css, /@media print[\s\S]*\.skip-link,/)
})
