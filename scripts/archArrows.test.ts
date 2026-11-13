import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// Architecture arrowheads are <marker> paths inside .arch-edges. The edge styles
// (no fill, a stroke, a dash on hot edges) must not reach them, or every head turns
// into a hollow, dashed outline. Markers also paint outside the edge's color context,
// so the hot edge needs its own accent-filled head.
const css = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')
const tsx = readFileSync(new URL('../src/components/ArchDiagram.tsx', import.meta.url), 'utf8')
const rules = [...css.matchAll(/^(\.arch-edges[^{]*)\{([^}]*)\}/gm)].map(([, sel, body]) => ({ sel: sel.trim(), body }))

test('edge path styles do not match the marker paths', () => {
  for (const { sel, body } of rules) {
    if (/fill: none|stroke-dasharray/.test(body)) assert.match(sel, /\bg\b/, `${sel} would also style arrowheads`)
  }
})

test('arrowheads are solid, and hot edges get an accent head', () => {
  assert.ok(rules.some(({ sel, body }) => sel === '.arch-edges marker path' && /fill: var\(--wire\)/.test(body) && /stroke: none/.test(body)))
  assert.ok(rules.some(({ sel, body }) => sel.includes('arch-head-hot') && /fill: var\(--accent\)/.test(body)))
  assert.match(tsx, /hot \? '-hot' : ''/)
})
