import assert from 'node:assert/strict'
import { test } from 'node:test'
import { shouldPlayIntro } from '../src/lib/intro.ts'

const base = { reducedMotion: false, seen: false, hash: '' }

test('plays on a first plain visit', () => {
  assert.equal(shouldPlayIntro(base), true)
  assert.equal(shouldPlayIntro({ ...base, hash: '#' }), true)
})

test('skips for reduced motion and once seen this session', () => {
  assert.equal(shouldPlayIntro({ ...base, reducedMotion: true }), false)
  assert.equal(shouldPlayIntro({ ...base, seen: true }), false)
})

test('skips on deep links so shared URLs open straight to their content', () => {
  for (const hash of ['#recruiter', '#project/cinedna', '#projects']) {
    assert.equal(shouldPlayIntro({ ...base, hash }), false, hash)
  }
})
