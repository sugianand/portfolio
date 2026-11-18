import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// The card previews cycle through results; a title that wraps makes its row taller
// than its neighbours for one cycle. Titles stay on one line, and the phone column
// fits the longest CineDNA preview title ("The Dark Knight", ~102px at 13px Geist).
const css = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')

test('preview result titles never wrap', () => {
  const rule = css.match(/\.pv-results b \{([^}]*)\}/)?.[1] ?? ''
  for (const decl of ['white-space: nowrap', 'overflow: hidden', 'text-overflow: ellipsis', 'min-width: 0']) {
    assert.ok(rule.includes(decl), `.pv-results b is missing ${decl}`)
  }
})

test('phone title column fits the longest preview title', () => {
  const phone = css.match(/@media \(max-width: 640px\) \{[\s\S]*?\.pv-results li \{ grid-template-columns: (\d+)px/)
  assert.ok(phone, 'no phone column for .pv-results li')
  assert.ok(Number(phone[1]) >= 104, `title column is ${phone[1]}px; "The Dark Knight" needs ~102px`)
})
