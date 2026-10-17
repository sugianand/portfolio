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
 * Routes an edge that skips one or more tiers around the nodes in between:
 * out through the gap beside its source, along the canvas gutter (whichever
 * side is nearer), and back in through the gap beside its target. Tiers are
 * columns when `across` is true and rows otherwise.
 */
export function gutterRoute(a: Box, b: Box, across: boolean, size: { w: number; h: number }, gap: number, gutter: number) {
  if (across) {
    const dir = b.cx >= a.cx ? 1 : -1
    const x1 = dir > 0 ? a.r : a.l, x2 = dir > 0 ? b.l : b.r
    const gy = (a.cy + b.cy) / 2 <= size.h / 2 ? gutter : size.h - gutter
    return roundedPath([[x1, a.cy], [x1 + (dir * gap) / 2, a.cy], [x1 + (dir * gap) / 2, gy], [x2 - (dir * gap) / 2, gy], [x2 - (dir * gap) / 2, b.cy], [x2, b.cy]])
  }
  const dir = b.cy >= a.cy ? 1 : -1
  const y1 = dir > 0 ? a.b : a.t, y2 = dir > 0 ? b.t : b.b
  const gx = (a.cx + b.cx) / 2 <= size.w / 2 ? gutter : size.w - gutter
  return roundedPath([[a.cx, y1], [a.cx, y1 + (dir * gap) / 2], [gx, y1 + (dir * gap) / 2], [gx, y2 - (dir * gap) / 2], [b.cx, y2 - (dir * gap) / 2], [b.cx, y2]])
}
