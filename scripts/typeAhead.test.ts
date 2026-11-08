// Typing straight after opening the assistant, before its panel has loaded, used to fire the
// page's one-key shortcuts ("r" opened the Quick summary, "?" the shortcuts) and lose the text.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { typeAhead } from '../src/lib/typeAhead.ts'

const key = (k: string, mods: Partial<Record<'metaKey' | 'ctrlKey' | 'altKey', boolean>> = {}) =>
  ({ key: k, metaKey: false, ctrlKey: false, altKey: false, ...mods })

const type = (text: string) => [...text].reduce<string>((d, k) => typeAhead(d, key(k)) ?? d, '')

test('shortcut letters and punctuation become text', () => {
  assert.equal(type('Where is he? r/'), 'Where is he? r/')
})

test('Backspace edits the draft', () => {
  assert.equal(typeAhead('abc', key('Backspace')), 'ab')
  assert.equal(typeAhead('', key('Backspace')), '')
})

test('non-text keys and modified shortcuts pass through', () => {
  for (const k of ['Escape', 'Tab', 'Enter', 'ArrowLeft', 'Shift']) assert.equal(typeAhead('a', key(k)), null, k)
  assert.equal(typeAhead('a', key('k', { metaKey: true })), null)
  assert.equal(typeAhead('a', key('k', { ctrlKey: true })), null)
  assert.equal(typeAhead('a', key('r', { altKey: true })), null)
})

test('the draft stops at the input maxLength', () => {
  assert.equal(typeAhead('x'.repeat(200), key('y')), 'x'.repeat(200))
})
