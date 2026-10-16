import assert from 'node:assert/strict'
import { test } from 'node:test'
import { budgetBytes, initialScripts } from './budget.ts'

test('counts the entry module and its modulepreloads, once each', () => {
  const html = `
    <script type="module" crossorigin src="./assets/index-abc.js"></script>
    <link rel="modulepreload" crossorigin href="./assets/jsx-runtime-def.js">
    <link rel="modulepreload" href="./assets/index-abc.js">
    <link rel="stylesheet" href="./assets/index-xyz.css">
    <script type="application/ld+json">{}</script>`
  assert.deepEqual(initialScripts(html), ['./assets/index-abc.js', './assets/jsx-runtime-def.js'])
})

test('ignores inline and non-module scripts', () => {
  assert.deepEqual(initialScripts('<script>var a = 1</script><script src="legacy.js"></script>'), [])
})

test('reads the claimed budget in Vite-style kilobytes', () => {
  assert.equal(budgetBytes('<100 KB'), 100_000)
  assert.equal(budgetBytes(' < 92.5 kb '), 92_500)
  assert.throws(() => budgetBytes('100 ms'))
})
