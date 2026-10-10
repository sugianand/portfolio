import { useLayoutEffect, useRef, useState } from 'react'
import type { Project } from '../data'
import { unlock } from '../lib/store'

type Arch = NonNullable<Project['architecture']>
type Path = { key: string; d: string; from: string; to: string }

/**
 * A data-driven system diagram. Nodes sit in tiers (columns on wide screens,
 * rows on narrow ones); edges are measured from the rendered node boxes so the
 * same data works at any width. Focus, hover, or click a node to explain it.
 */
export function ArchDiagram({ arch }: { arch: Arch }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>())
  const [active, setActive] = useState(arch.nodes[0].id)
  const [paths, setPaths] = useState<Path[]>([])
  const [size, setSize] = useState({ w: 0, h: 0 })

  const tiers = Math.max(...arch.nodes.map((n) => n.tier)) + 1
  const columns = Array.from({ length: tiers }, (_, t) => arch.nodes.filter((n) => n.tier === t))

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const measure = () => {
      const box = wrap.getBoundingClientRect()
      const rect = (id: string) => {
        const r = nodeRefs.current.get(id)!.getBoundingClientRect()
        return { l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top, cx: r.left - box.left + r.width / 2, cy: r.top - box.top + r.height / 2 }
      }
      const next = arch.edges.map(([from, to]) => {
        const a = rect(from)
        const b = rect(to)
        const horizontal = b.l >= a.r - 4
        if (horizontal) {
          const x1 = a.r, y1 = a.cy, x2 = b.l, y2 = b.cy, mx = (x1 + x2) / 2
          return { key: `${from}-${to}`, from, to, d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}` }
        }
        const down = b.t >= a.b - 4
        const x1 = a.cx, y1 = down ? a.b : a.t, x2 = b.cx, y2 = down ? b.t : b.b, my = (y1 + y2) / 2
        return { key: `${from}-${to}`, from, to, d: `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}` }
      })
      setPaths(next)
      setSize({ w: box.width, h: box.height })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [arch])

  const current = arch.nodes.find((n) => n.id === active)!
  const linked = new Set(arch.edges.filter(([a, b]) => a === active || b === active).flatMap(([a, b]) => [a, b]))
  const name = (id: string) => arch.nodes.find((n) => n.id === id)!.label
  const links = arch.edges
    .filter(([a, b]) => a === active || b === active)
    .map(([a, b, label]) => `${a === active ? '→' : '←'} ${name(a === active ? b : a)}${label ? ` (${label})` : ''}`)

  return (
    <div className="arch">
      <div className="arch-canvas" ref={wrapRef} style={{ ['--tiers' as string]: tiers }}>
        <svg className="arch-edges" width={size.w} height={size.h} aria-hidden="true">
          <defs>
            <marker id="arch-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
            </marker>
          </defs>
          {paths.map((p) => {
            const hot = p.from === active || p.to === active
            return (
              <g key={p.key} className={hot ? 'hot' : ''}>
                <path d={p.d} markerEnd="url(#arch-arrow)" />
              </g>
            )
          })}
        </svg>
        {columns.map((col, t) => (
          <div className="arch-tier" key={t}>
            {col.map((n) => (
              <button
                key={n.id}
                type="button"
                ref={(el) => { if (el) nodeRefs.current.set(n.id, el); else nodeRefs.current.delete(n.id) }}
                className={`arch-node ${n.id === active ? 'active' : ''} ${linked.has(n.id) && n.id !== active ? 'linked' : ''}`}
                onPointerEnter={() => setActive(n.id)}
                onFocus={() => setActive(n.id)}
                onClick={() => { setActive(n.id); unlock('arch') }}
                aria-pressed={n.id === active}
              >
                <b>{n.label}</b>
                <span className="mono">{n.tech}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="arch-detail" aria-live="polite">
        <p className="mono">{current.tech}</p>
        <strong>{current.label}</strong>
        <span>{current.detail}</span>
        {links.length > 0 && <em className="mono">{links.join('   ')}</em>}
      </div>
    </div>
  )
}
