import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// ARIA prohibits naming a paragraph, so screen readers ignore aria-label on <p> and the
// cycling aliases (hidden from assistive tech) would never be read. Use real hidden text.
const hero = readFileSync(new URL('../src/components/Hero.tsx', import.meta.url), 'utf8')
const aka = hero.slice(hero.indexOf('className="aka'), hero.indexOf('</p>', hero.indexOf('className="aka')))

test('the alias line is not named with a prohibited aria-label', () => {
  assert.doesNotMatch(aka, /aria-label/)
})

test('screen readers hear every alias once, from visually hidden text', () => {
  assert.match(aka, /<span className="sr-only">Also known as \{ALIASES\.join\(', '\)\}<\/span>/)
  assert.match(aka, /<span aria-hidden="true">a\.k\.a\.<\/span>/)
  assert.match(aka, /<b aria-hidden="true">/)
})
