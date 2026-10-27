import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { accentHex, accents, lightAccents, type AccentName } from '../src/lib/palette.ts'

// WCAG 2.x relative luminance and contrast ratio.
const luminance = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
const lightBlock = css.slice(css.indexOf(":root[data-theme='light']"))
const cssVar = (block: string, name: string) => block.match(new RegExp(`--${name}: (#[0-9a-f]{6})`))![1]

const dark = { ink: cssVar(css, 'ink'), ink2: cssVar(css, 'ink-2') }
const light = { ink: cssVar(lightBlock, 'ink'), ink2: cssVar(lightBlock, 'ink-2') }
const names = Object.keys(accents) as AccentName[]

test('every light accent keeps AA contrast as text on the light backgrounds', () => {
  for (const name of names) {
    for (const bg of [light.ink, light.ink2]) {
      assert.ok(contrast(lightAccents[name], bg) >= 4.5, `${name} ${lightAccents[name]} on ${bg}: ${contrast(lightAccents[name], bg).toFixed(2)}`)
    }
  }
})

test('light text stays readable on accent-filled buttons and panels', () => {
  for (const name of names) assert.ok(contrast(light.ink, lightAccents[name]) >= 4.5, name)
})

test('every dark accent keeps AA contrast on the dark backgrounds', () => {
  for (const name of names) {
    for (const bg of [dark.ink, dark.ink2]) assert.ok(contrast(accents[name], bg) >= 4.5, `${name} on ${bg}`)
  }
})

test('the CSS default accents match the palette', () => {
  assert.equal(cssVar(css, 'accent'), accentHex('orange', 'dark'))
  assert.equal(cssVar(lightBlock, 'accent'), accentHex('orange', 'light'))
})

test('light text tokens keep AA contrast on the light backgrounds', () => {
  for (const token of ['cream', 'muted', 'dim', 'text', 'text-lo', 'soft', 'green', 'blue', 'yellow', 'bad']) {
    for (const bg of [light.ink, light.ink2]) {
      const fg = cssVar(lightBlock, token)
      assert.ok(contrast(fg, bg) >= 4.5, `--${token} ${fg} on ${bg}: ${contrast(fg, bg).toFixed(2)}`)
    }
  }
})
