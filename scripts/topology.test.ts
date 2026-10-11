// The compact project cards draw each architecture as a tiny glyph; every node
// and edge must land inside the box so nothing is clipped.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { projects } from '../src/data.ts'
import { miniTopology } from '../src/lib/topology.ts'

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
