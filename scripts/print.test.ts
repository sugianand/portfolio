import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// Browsers drop backgrounds when printing, so any on-screen divider drawn as a background
// showing through a grid gap has to become a real border on paper.
const css = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')

/** The body of every `@media print { ... }` block, joined. */
const printRules = (src: string) => {
  const out: string[] = []
  for (let i = src.indexOf('@media print'); i !== -1; i = src.indexOf('@media print', i + 1)) {
    let depth = 0
    const start = src.indexOf('{', i)
    for (let j = start; j < src.length; j++) {
      if (src[j] === '{') depth++
      else if (src[j] === '}' && --depth === 0) { out.push(src.slice(start + 1, j)); break }
    }
  }
  return out.join('\n')
}

const rule = (src: string, selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return [...src.matchAll(new RegExp(`(?:^|\\n)\\s*${escaped} \\{([^}]*)\\}`, 'g'))].map((m) => m[1]).join(';')
}

test('the recruiter view grid uses gap-as-divider on screen', () => {
  assert.match(rule(css, '.rv-grid'), /gap: 1px; background: var\(--line\)/)
})

test('the printed recruiter view draws its section dividers as borders', () => {
  const print = printRules(css)
  const grid = rule(print, '.rv-grid')
  const section = rule(print, '.rv-grid section')
  assert.match(grid, /gap: 0/)
  assert.match(grid, /border-width: 1px 0 0 1px/)
  assert.match(section, /border-right: 1px solid var\(--line\)/)
  assert.match(section, /border-bottom: 1px solid var\(--line\)/)
})

test('paper shrinks the B-Roll rows and contact row so Contact shares a page', () => {
  const print = printRules(css)
  assert.match(rule(print, '.hobby'), /padding: 5pt 0/)
  assert.match(rule(print, '.hobby h3'), /font-size: 13pt/)
  assert.match(rule(print, '.contact-row'), /gap: 8pt/)
  // Nothing printed under 12px (9pt).
  for (const m of print.matchAll(/font-size: ([\d.]+)pt/g)) assert.ok(Number(m[1]) >= 9, `${m[1]}pt is under 12px`)
})
