import assert from 'node:assert/strict'
import { test } from 'node:test'
import { PREVIEW_QUESTIONS, retrievalTrace } from '../src/lib/retrievalTrace.ts'

test('every preview question shows three ranked sources and its query terms', () => {
  for (const q of PREVIEW_QUESTIONS) {
    const { terms, rows } = retrievalTrace(q)
    assert.ok(terms.length > 0, `no terms for "${q}"`)
    assert.equal(rows.length, 3, `"${q}" ranks ${rows.length} sources`)
    assert.equal(rows[0].width, 100)
    for (let i = 1; i < rows.length; i++) assert.ok(rows[i].score <= rows[i - 1].score && rows[i].width > 0)
    for (const r of rows) assert.ok(r.label && !r.label.includes(':'), `label "${r.label}"`)
  }
})

test('the preview ranks the right source first', () => {
  assert.equal(retrievalTrace('Which project shows realtime work?').rows[0].label, 'Movie in Three Clues')
  assert.equal(retrievalTrace('Where is he studying?').rows[0].label, 'Education and GPA')
})
