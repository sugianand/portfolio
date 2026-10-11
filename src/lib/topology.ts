import type { Project } from '../data'

type Arch = NonNullable<Project['architecture']>
export type MiniNode = { id: string; x: number; y: number; tier: number }
export type MiniEdge = { key: string; x1: number; y1: number; x2: number; y2: number }

/**
 * Lays an architecture out as a tiny glyph: one column per tier, nodes spread
 * evenly down each column, edges as straight lines between node centres.
 */
export function miniTopology(arch: Arch, width: number, height: number, pad = 6) {
  const tiers = Math.max(...arch.nodes.map((n) => n.tier)) + 1
  const colX = (t: number) => (tiers === 1 ? width / 2 : pad + (t * (width - 2 * pad)) / (tiers - 1))
  const nodes: MiniNode[] = []
  for (let t = 0; t < tiers; t++) {
    const col = arch.nodes.filter((n) => n.tier === t)
    col.forEach((n, i) => nodes.push({ id: n.id, tier: t, x: colX(t), y: pad + ((i + 0.5) * (height - 2 * pad)) / col.length }))
  }
  const at = new Map(nodes.map((n) => [n.id, n]))
  const edges: MiniEdge[] = arch.edges.flatMap(([from, to]) => {
    const a = at.get(from)
    const b = at.get(to)
    return a && b ? [{ key: `${from}-${to}`, x1: a.x, y1: a.y, x2: b.x, y2: b.y }] : []
  })
  return { nodes, edges }
}
