// The compact project cards draw each architecture as a tiny glyph; every node
// and edge must land inside the box so nothing is clipped.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { projects } from '../src/data.ts'
import { gutterRoute, miniTopology, roundedPath, runsAcross, type Box } from '../src/lib/topology.ts'

const W = 112
const H = 36

for (const p of projects.filter((p) => p.architecture)) {
  test(`${p.id} mini topology fits and keeps every node and edge`, () => {
    const arch = p.architecture!
    const { nodes, edges } = miniTopology(arch, W, H)
    assert.equal(nodes.length, arch.nodes.length)
    assert.equal(edges.length, arch.edges.length)
    for (const n of nodes) {
      assert.ok(n.x >= 0 && n.x <= W && n.y >= 0 && n.y <= H, `${n.id} at ${n.x},${n.y}`)
    }
    const xs = [...new Set(nodes.map((n) => n.x))].sort((a, b) => a - b)
    assert.equal(xs.length, Math.max(...arch.nodes.map((n) => n.tier)) + 1, 'one column per tier')
  })
}

test('edges to unknown nodes are dropped instead of drawn at NaN', () => {
  const { edges } = miniTopology({ nodes: [{ id: 'a', label: 'A', tech: '', detail: '', tier: 0 }], edges: [['a', 'missing']] }, W, H)
  assert.deepEqual(edges, [])
})

// Edges that skip a tier detour through the gutter instead of behind nodes.
const box = (l: number, t: number, w: number, h: number) => ({ l, t, r: l + w, b: t + h, cx: l + w / 2, cy: t + h / 2 })
const corners = (d: string) => [...d.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])])

test('a skip edge across columns runs through the gaps and the nearer gutter', () => {
  const d = gutterRoute(box(22, 30, 100, 40), box(400, 20, 100, 40), true, { w: 522, h: 200 }, 34, 11)
  const pts = corners(d)
  assert.deepEqual(pts[0], [122, 50], 'leaves the source on its right edge')
  assert.deepEqual(pts.at(-1), [400, 40], 'enters the target on its left edge')
  assert.ok(pts.every(([, y]) => y >= 11), 'stays inside the canvas')
  assert.ok(pts.some(([, y]) => y === 11), 'uses the top gutter, the nearer one')
  assert.ok(pts.filter(([, y]) => y !== 11).every(([x]) => x <= 139 || x >= 383), 'off the gutter, it stays in the gaps')
})

test('a skip edge down rows uses the side gutter and enters from above', () => {
  const pts = corners(gutterRoute(box(16, 16, 120, 60), box(16, 300, 300, 60), false, { w: 332, h: 400 }, 26, 8))
  assert.deepEqual(pts[0], [76, 76])
  assert.deepEqual(pts.at(-1), [166, 300])
  assert.ok(pts.some(([x]) => x === 8), 'uses the left gutter')
})

test('rounded corners never overshoot short segments', () => {
  const d = roundedPath([[0, 0], [4, 0], [4, 100]], 8)
  assert.ok(!/L-|L[5-9]/.test(d), d)
})

test('edges between stacked tiers run down even when the target sits to the right', () => {
  const box = (l: number, t: number, w = 100, h = 60): Box => ({ l, r: l + w, t, b: t + h, cx: l + w / 2, cy: t + h / 2 })
  const react = box(0, 100), renderLayer = box(110, 100), ci = box(110, 200)
  assert.equal(runsAcross(react, ci, false, false), false)
  assert.equal(runsAcross(react, renderLayer, true, false), true)
  assert.equal(runsAcross(box(0, 0), box(140, 120), false, true), true)
  assert.equal(runsAcross(box(0, 0), box(0, 80), true, true), false)
})
