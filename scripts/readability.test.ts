import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

// Readability floor: no text renders under 12px. Checks every absolute px size in the
// stylesheets (including the minimum of a clamp()) and inline fontSize values in components.
const MIN = 12
const src = new URL('../src/', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, src), 'utf8')

test('no stylesheet sets a font size under 12px', () => {
  const components = readdirSync(new URL('components/', src)).filter((f) => f.endsWith('.css')).map((f) => `components/${f}`)
  for (const file of ['index.css', 'App.css', ...components]) {
    for (const [decl, value] of read(file).matchAll(/font-size:\s*([^;}]+)/g)) {
      const floor = value.match(/^(?:clamp\(\s*|max\(\s*)?(\d+(?:\.\d+)?)px/)
      if (floor) assert.ok(Number(floor[1]) >= MIN, `${file}: ${decl.trim()}`)
    }
  }
})

test('no component sets an inline font size under 12px', () => {
  for (const file of readdirSync(new URL('components/', src))) {
    for (const [decl, value] of read(`components/${file}`).matchAll(/fontSize:\s*['"]?(\d+(?:\.\d+)?)/g)) {
      assert.ok(Number(value) >= MIN, `${file}: ${decl}`)
    }
  }
})
