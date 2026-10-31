import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// Target size (WCAG 2.5.8): the case-study pager and the card source/live links are
// 19–20px tall as text, so they pad their hit areas up to at least 24px without
// shifting layout (the matching negative margin cancels the padding).
const css = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')

const padded = (selector: string) => {
  const rule = css.match(new RegExp(`^${selector.replace(/[.]/g, '\\.')} \\{([^}]*)\\}`, 'm'))?.[1] ?? ''
  const pad = Number(rule.match(/padding-block: (\d+)px/)?.[1] ?? 0)
  const margin = Number(rule.match(/margin-block: -(\d+)px/)?.[1] ?? -1)
  return { pad, margin }
}

for (const [selector, textHeight] of [['.detail-foot button', 20], ['.pcard-links a', 19]] as const) {
  test(`${selector} has a 24px+ target that does not shift layout`, () => {
    const { pad, margin } = padded(selector)
    assert.ok(textHeight + 2 * pad >= 24, `${selector}: ${textHeight + 2 * pad}px`)
    assert.equal(margin, pad, `${selector}: margin-block should cancel padding-block`)
  })
}
