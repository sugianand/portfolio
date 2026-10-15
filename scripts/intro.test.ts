import assert from 'node:assert/strict'
import { test } from 'node:test'
import { shouldPlayIntro } from '../src/lib/intro.ts'

const base = { enabled: true, forced: false, reducedMotion: false, seen: false, hash: '' }

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

test('stays off in builds that disable it, unless forced with ?intro', () => {
  assert.equal(shouldPlayIntro({ ...base, enabled: false }), false)
  assert.equal(shouldPlayIntro({ ...base, enabled: false, forced: true }), true)
  assert.equal(shouldPlayIntro({ ...base, enabled: false, forced: true, seen: true, hash: '#projects' }), true)
})
