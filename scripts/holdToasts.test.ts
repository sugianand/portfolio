// Quest toasts wait while a dialog is open so they never cover what someone is reading
// (an assistant answer, the Quick summary, a case study), then appear once it closes.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { holdWhileBusy } from '../src/lib/holdToasts.ts'

const setup = () => {
  const shown: string[] = []
  const pending: (() => void)[] = []
  const state = { busy: false }
  const show = holdWhileBusy<string>(() => state.busy, (s) => shown.push(s), (retry) => pending.push(retry))
  const tick = () => pending.splice(0).forEach((retry) => retry())
  return { shown, pending, state, show, tick }
}

test('shows at once when nothing is open', () => {
  const { shown, pending, show } = setup()
  show('a')
  assert.deepEqual(shown, ['a'])
  assert.equal(pending.length, 0)
})

test('holds while a dialog is open and releases in order after it closes', () => {
  const { shown, pending, state, show, tick } = setup()
  state.busy = true
  show('a')
  show('b')
  assert.deepEqual(shown, [])
  assert.equal(pending.length, 1, 'one retry scheduled, not one per toast')
  tick()
  assert.deepEqual(shown, [], 'still open: keeps holding')
  state.busy = false
  tick()
  assert.deepEqual(shown, ['a', 'b'])
  assert.equal(pending.length, 0)
})

test('a toast raised after the dialog closes waits behind held ones', () => {
  const { shown, state, show, tick } = setup()
  state.busy = true
  show('a')
  state.busy = false
  show('b')
  assert.deepEqual(shown, [], 'queued behind a, which has not been released yet')
  tick()
  assert.deepEqual(shown, ['a', 'b'])
})
