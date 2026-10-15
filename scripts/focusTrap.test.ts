// Modal dialogs (case studies, Quick summary, shortcuts, side quests) must keep
// keyboard focus inside them: Tab wraps at the edges instead of escaping to the page.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { wrapFocus } from '../src/lib/focusTrap.ts'

test('Tab from the dialog itself enters at the first or last item', () => {
  assert.equal(wrapFocus(-1, 5, false), 0)
  assert.equal(wrapFocus(-1, 5, true), 4)
})

test('Tab wraps at the edges', () => {
  assert.equal(wrapFocus(4, 5, false), 0)
  assert.equal(wrapFocus(0, 5, true), 4)
})

test('Tab in the middle is left to the browser', () => {
  assert.equal(wrapFocus(2, 5, false), null)
  assert.equal(wrapFocus(2, 5, true), null)
  assert.equal(wrapFocus(0, 5, false), null)
  assert.equal(wrapFocus(4, 5, true), null)
})

test('a single item keeps focus on itself', () => {
  assert.equal(wrapFocus(0, 1, false), 0)
  assert.equal(wrapFocus(0, 1, true), 0)
})

test('no items defers to the caller', () => {
  assert.equal(wrapFocus(-1, 0, false), null)
})
