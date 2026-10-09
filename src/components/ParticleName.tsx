import { useEffect, useRef } from 'react'
import { emit, isBooted, on, unlock } from '../lib/store'

type Particle = { x: number; y: number; tx: number; ty: number; vx: number; vy: number; accent: boolean }

const LINES = ['Suganeshwara', 'Anand.']
const MAX_PARTICLES = 7000

/**
 * The hero name, drawn as a field of particles sampled from rendered text.
 * Particles spring back to their letters, flee the pointer, and explode on click.
 */
export function ParticleName() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!wrap || !canvas || !ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const pointer = { x: -9999, y: -9999, down: false }
    let particles: Particle[] = []
    let size = 2
    let width = 0
    let height = 0
    let raf = 0
    let visible = true
    let released = 0
    let assembled = isBooted()
    let disposed = false

    const accentColor = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#fa6945'

    const build = async () => {
      try {
        await document.fonts.load('800 100px Syne')
      } catch {
        /* fall back to whatever font is available */
      }
      if (disposed) return
      width = wrap.clientWidth
      const probe = document.createElement('canvas').getContext('2d')!
      probe.font = '800 100px Syne, Arial Black, sans-serif'
      probe.letterSpacing = '-4px'
      const widest = Math.max(...LINES.map((l) => probe.measureText(l).width))
      const fontSize = Math.min(240, (width * 0.99 * 100) / widest)
      const lineHeight = fontSize * 0.86
      height = Math.ceil(lineHeight * LINES.length + fontSize * 0.12)
      wrap.style.height = `${height}px`

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const off = document.createElement('canvas')
      off.width = width
      off.height = height
      const octx = off.getContext('2d', { willReadFrequently: true })!
      octx.font = `800 ${fontSize}px Syne, Arial Black, sans-serif`
      octx.letterSpacing = `${-fontSize * 0.04}px`
      octx.textBaseline = 'alphabetic'
      octx.fillStyle = '#fff'
      octx.fillText(LINES[0], 0, lineHeight * 0.92)
      const word = LINES[1].slice(0, -1)
      const x0 = width - octx.measureText(LINES[1]).width
      octx.fillText(word, x0, lineHeight * 1.92)
      octx.fillStyle = '#f00'
      octx.fillText('.', x0 + octx.measureText(word).width, lineHeight * 1.92)

      const data = octx.getImageData(0, 0, width, height).data
      let filled = 0
      for (let i = 3; i < data.length; i += 16) if (data[i] > 128) filled += 4
      const gap = Math.max(2, Math.ceil(Math.sqrt(filled / MAX_PARTICLES)))
      size = Math.max(1.2, gap * 0.72)

      const next: Particle[] = []
      for (let y = 0; y < height; y += gap) {
        for (let x = 0; x < width; x += gap) {
          const idx = (y * width + x) * 4
          if (data[idx + 3] < 128) continue
          const accent = data[idx + 1] < 100
          const old = particles[next.length]
          next.push({
            x: old?.x ?? (reduce ? x : Math.random() * width),
            y: old?.y ?? (reduce ? y : height + Math.random() * height * 0.5),
            tx: x,
            ty: y,
            vx: 0,
            vy: 0,
            accent,
          })
        }
      }
      particles = next
      wrap.classList.add('ready')
      if (reduce) draw()
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const cream = '#f4f0e9'
      const accent = accentColor()
      ctx.fillStyle = cream
      for (const p of particles) if (!p.accent) ctx.fillRect(p.x, p.y, size, size)
      ctx.fillStyle = accent
      for (const p of particles) if (p.accent) ctx.fillRect(p.x, p.y, size, size)
    }

    const step = (now: number) => {
      const springy = assembled && now > released
      const radius = Math.max(70, width * 0.07)
      for (const p of particles) {
        const dx = p.x - pointer.x
        const dy = p.y - pointer.y
        const dist2 = dx * dx + dy * dy
        if (dist2 < radius * radius) {
          const dist = Math.sqrt(dist2) || 1
          const force = (1 - dist / radius) * (pointer.down ? 9 : 4)
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }
        if (springy) {
          p.vx += (p.tx - p.x) * 0.06
          p.vy += (p.ty - p.y) * 0.06
        } else if (!assembled) {
          p.vy += 0.02
        }
        p.vx *= 0.8
        p.vy *= 0.8
        p.x += p.vx
        p.y += p.vy
      }
      draw()
    }

    const loop = (now: number) => {
      if (visible) step(now)
      raf = requestAnimationFrame(loop)
    }

    const toLocal = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
    }
    const onMove = (e: PointerEvent) => toLocal(e)
    const onLeave = () => {
      pointer.x = pointer.y = -9999
      pointer.down = false
    }
    const onDown = (e: PointerEvent) => {
      toLocal(e)
      pointer.down = true
      for (const p of particles) {
        const angle = Math.atan2(p.y - pointer.y, p.x - pointer.x) + (Math.random() - 0.5)
        const power = 18 + Math.random() * 40
        p.vx += Math.cos(angle) * power
        p.vy += Math.sin(angle) * power
      }
      released = performance.now() + 650
      emit('scatter')
      unlock('scatter')
    }
    const onUp = () => { pointer.down = false }

    let resizeTimer = 0
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        if (wrap.clientWidth !== width) build()
      }, 150)
    }

    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting })
    io.observe(wrap)
    const offBoot = on('boot-done', () => {
      assembled = true
      released = performance.now() + 150
    })

    build()
    if (!reduce) {
      raf = requestAnimationFrame(loop)
      canvas.addEventListener('pointermove', onMove)
      canvas.addEventListener('pointerleave', onLeave)
      canvas.addEventListener('pointerdown', onDown)
      window.addEventListener('pointerup', onUp)
    }
    window.addEventListener('resize', onResize)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      io.disconnect()
      offBoot()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="particle-name" ref={wrapRef}>
      <h1 className="hero-name">
        <span>Suganeshwara</span>
        <span>Anand<em>.</em></span>
      </h1>
      <canvas ref={canvasRef} aria-hidden="true" data-cursor="click" />
    </div>
  )
}
