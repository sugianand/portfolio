import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// On phones the case study is a full-screen sheet: dimmed gutters around a floating card
// cost ~38px of a 360px screen and squeezed the architecture diagram's node labels.
const app = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')
const phone = [...app.matchAll(/^@media \(max-width: 640px\) \{\n([\s\S]*?)^\}/gm)].map((m) => m[1]).find((b) => b.includes('.arch-canvas')) ?? ''

test('the case study sheet goes edge to edge on phones', () => {
  assert.match(phone, /\.detail \{ padding: 0; \}/)
  assert.match(phone, /\.detail-sheet \{[^}]*min-height: 100%;[^}]*border: 0;/)
})

test('larger screens keep the floating sheet', () => {
  assert.match(app, /^\.detail \{[^}]*padding: clamp\(12px, 4vh, 48px\) var\(--gutter\);/m)
})
