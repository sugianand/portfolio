// Windows and Linux visitors press Ctrl+K, so the palette must not tell them ⌘K.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { modKey } from '../src/lib/platform.ts'

test('Apple platforms show ⌘', () => {
  for (const p of ['MacIntel', 'macOS', 'iPhone', 'iPad']) assert.equal(modKey(p), '⌘', p)
})

test('everything else shows Ctrl', () => {
  for (const p of ['Win32', 'Windows', 'Linux x86_64', 'Chrome OS', 'Android', '']) assert.equal(modKey(p), 'Ctrl', p)
})
