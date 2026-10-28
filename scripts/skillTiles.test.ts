import assert from 'node:assert/strict'
import { test } from 'node:test'
import { skillGroups } from '../src/data.ts'
import { LOGOS } from '../src/lib/logos.ts'
import { SHORT, TILE_NAME_MAX, tileName, tileSymbol } from '../src/lib/skillTiles.ts'

const names = skillGroups.flatMap((g) => g.items.map((i) => i.name))

test('every skill tile label fits without an ellipsis', () => {
  for (const name of names) assert.ok(tileName(name).length <= TILE_NAME_MAX, `"${tileName(name)}" (${name}) needs a SHORT label`)
})

test('every shortened label belongs to a skill in data.ts', () => {
  for (const name of Object.keys(SHORT)) assert.ok(names.includes(name), `stale SHORT entry: ${name}`)
})

test('skills without a logo get a distinct symbol', () => {
  const symbols = names.filter((n) => !LOGOS[n]).map(tileSymbol)
  assert.equal(new Set(symbols).size, symbols.length, `duplicate symbols: ${symbols.join(' ')}`)
})
