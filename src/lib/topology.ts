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

export type Box = { l: number; r: number; t: number; b: number; cx: number; cy: number }
type Point = [number, number]

/** An orthogonal polyline with its corners rounded, each radius clamped to fit. */
export function roundedPath(points: Point[], radius = 8) {
  let d = `M${points[0][0]},${points[0][1]}`
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1]
    const [x, y] = points[i]
    const [nx, ny] = points[i + 1]
    const r = Math.min(radius, Math.hypot(x - px, y - py) / 2, Math.hypot(nx - x, ny - y) / 2)
    const inX = x - Math.sign(x - px) * r, inY = y - Math.sign(y - py) * r
    const outX = x + Math.sign(nx - x) * r, outY = y + Math.sign(ny - y) * r
    d += ` L${inX},${inY} Q${x},${y} ${outX},${outY}`
  }
  const [lx, ly] = points[points.length - 1]
  return `${d} L${lx},${ly}`
}

/**
 * Whether an edge runs sideways. Edges between tiers follow the layout's tier
 * axis (`across`: tiers are columns); guessing from box positions alone would
 * turn a stacked edge to a node down and to the right into a squeezed sideways
 * curve. Same-tier siblings run sideways only when they sit side by side.
 */
export const runsAcross = (a: Box, b: Box, sameTier: boolean, across: boolean) => (sameTier ? b.l >= a.r - 4 : across)

/**
 * Routes an edge that skips one or more tiers around the nodes in between:
 * out through the gap beside its source, along the canvas gutter (whichever
 * side is nearer), and back in through the gap beside its target. Tiers are
 * columns when `across` is true and rows otherwise. Its ports sit toward the
 * gutter and it turns close to each node, so it never shares a port or a lane
 * with the direct edges that leave the middle of the same face.
 */
export function gutterRoute(a: Box, b: Box, across: boolean, size: { w: number; h: number }, gap: number, gutter: number) {
  const turn = gap / 4
  const inset = (len: number) => Math.min(16, len / 4)
  if (across) {
    const dir = b.cx >= a.cx ? 1 : -1
    const x1 = dir > 0 ? a.r : a.l, x2 = dir > 0 ? b.l : b.r
    const top = (a.cy + b.cy) / 2 <= size.h / 2
    const gy = top ? gutter : size.h - gutter
    const y1 = top ? a.t + inset(a.b - a.t) : a.b - inset(a.b - a.t)
    const y2 = top ? b.t + inset(b.b - b.t) : b.b - inset(b.b - b.t)
    return roundedPath([[x1, y1], [x1 + dir * turn, y1], [x1 + dir * turn, gy], [x2 - dir * turn, gy], [x2 - dir * turn, y2], [x2, y2]])
  }
  const dir = b.cy >= a.cy ? 1 : -1
  const y1 = dir > 0 ? a.b : a.t, y2 = dir > 0 ? b.t : b.b
  const left = (a.cx + b.cx) / 2 <= size.w / 2
  const gx = left ? gutter : size.w - gutter
  const x1 = left ? a.l + inset(a.r - a.l) : a.r - inset(a.r - a.l)
  const x2 = left ? b.l + inset(b.r - b.l) : b.r - inset(b.r - b.l)
  return roundedPath([[x1, y1], [x1, y1 + dir * turn], [gx, y1 + dir * turn], [gx, y2 - dir * turn], [x2, y2 - dir * turn], [x2, y2]])
}
