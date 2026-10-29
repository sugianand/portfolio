import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// The command palette is a modal like the others: Tab stays inside it, and closing it
// hands focus back to where the visitor was instead of dropping it on the page body.
const src = readFileSync(new URL('../src/components/OverlayDialogs.tsx', import.meta.url), 'utf8')
const palette = src.slice(src.indexOf('export function PaletteDialog'), src.indexOf('const SHORTCUTS'))
const shortcuts = src.slice(src.indexOf('export function ShortcutsDialog'))
const overlays = readFileSync(new URL('../src/components/Overlays.tsx', import.meta.url), 'utf8')

test('the command palette is a labelled modal dialog', () => {
  assert.match(palette, /<div ref=\{boxRef\} className="palette-box" role="dialog" aria-modal="true" aria-label="Command palette"/)
})

test('Tab is trapped inside the command palette', () => {
  assert.match(palette, /trapTab\(e, boxRef\.current\)/)
})

test('closing the command palette returns focus without scrolling', () => {
  assert.match(palette, /const previous = document\.activeElement/)
  assert.match(palette, /previous\?\.focus\(\{ preventScroll: true \}\)/)
})

test('Tab is trapped inside the shortcuts dialog too', () => {
  assert.match(shortcuts, /trapTab\(e, boxRef\.current\)/)
})

// The dialogs are a separate chunk; a static import would pull them back into the first paint.
test('the dialogs load on demand, not with the entry chunk', () => {
  assert.doesNotMatch(overlays, /from '\.\/OverlayDialogs'/)
  assert.match(overlays, /import\('\.\/OverlayDialogs'\)/)
})
