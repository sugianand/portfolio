import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// Touch screens have no Esc key, so every close button that says "esc" keeps that
// word in a hideable .esc-hint span, and touch screens hide it but keep the ✕.
const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')
const css = read('../src/App.css')
const components = ['Achievements', 'AssistantPanel', 'ProjectDetail', 'RecruiterPanel']

for (const name of components) {
  test(`${name} wraps its visible "esc" hint so touch screens can hide it`, () => {
    const src = read(`../src/components/${name}.tsx`)
    assert.match(src, /<span className="[^"]*\besc-hint\b[^"]*">esc <\/span>✕<\/button>/)
    assert.doesNotMatch(src, />esc ✕</, `${name}: bare "esc ✕" shows on touch screens`)
  })
}

test('touch screens hide the esc hint and keep the lone ✕ a 32px+ target', () => {
  const block = css.match(/@media \(hover: none\) and \(pointer: coarse\) \{([\s\S]*?)\n\}/)?.[1] ?? ''
  assert.match(block, /\.esc-hint \{ display: none; \}/)
  assert.match(block, /\.drawer-close, \.ask-close, \.rv-close \{ min-width: 32px; \}/)
})
