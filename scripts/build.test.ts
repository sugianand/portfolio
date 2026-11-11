// The footer's commit number must be the real one: a shallow clone undercounts it.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildLabel, commitCount } from '../src/lib/build.ts'

test('a full clone reports its commit count', () => {
  assert.equal(commitCount('218', 'false'), 218)
})

test('a shallow clone, a failed git, or junk reports no count', () => {
  assert.equal(commitCount('50', 'true'), 0)
  assert.equal(commitCount('0', 'false'), 0)
  assert.equal(commitCount('', 'false'), 0)
  assert.equal(commitCount('abc', 'false'), 0)
})

test('the footer label leaves out an unknown count', () => {
  const b = { hash: 'abc1234', count: 218, message: 'm', date: '' }
  assert.equal(buildLabel(b, 'Nov 11, 2026'), 'build abc1234 · commit #218 · Nov 11, 2026')
  assert.equal(buildLabel({ ...b, count: 0 }, 'Nov 11, 2026'), 'build abc1234 · Nov 11, 2026')
})
