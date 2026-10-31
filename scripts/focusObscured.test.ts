import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// Focus not obscured (WCAG 2.4.11): when Tab scrolls an element into view, the browser
// honours scroll-padding, so the bottom padding must clear the fixed Ask launcher (and, on
// phones, the bottom nav pill). The launcher is at most ~46px tall.
const index = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
const app = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')
const LAUNCHER_HEIGHT = 46

const px = (re: RegExp, src: string) => {
  const m = src.match(re)
  assert.ok(m, `missing ${re}`)
  return Number(m[1])
}

test('desktop scroll padding clears the Ask launcher', () => {
  const pad = px(/^html \{ scroll-padding-bottom: (\d+)px; \}/m, index)
  const bottom = px(/^\.ask-launch \{[^}]*bottom: (\d+)px/m, app)
  assert.ok(pad >= bottom + LAUNCHER_HEIGHT, `${pad}px < ${bottom + LAUNCHER_HEIGHT}px`)
})

test('narrow-screen scroll padding clears the raised Ask launcher', () => {
  const pad = px(/max-width: 960px\) \{ html \{ scroll-padding-bottom: (\d+)px; \} \}/, index)
  const raised = [...app.matchAll(/\.ask-launch \{ bottom: (\d+)px/g)].map((m) => Number(m[1]))
  assert.ok(raised.length > 0)
  for (const bottom of raised) assert.ok(pad >= bottom + LAUNCHER_HEIGHT, `${pad}px < ${bottom + LAUNCHER_HEIGHT}px`)
})

test('scroll padding leaves the top alone so #section links land as before', () => {
  assert.doesNotMatch(index + app, /scroll-padding(-top)?:/)
})
