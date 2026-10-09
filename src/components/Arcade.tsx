import { useEffect, useRef, useState } from 'react'
import { unlock } from '../lib/store'
import { SubHead } from './Sections'

const HIGH_KEY = 'sa26:frantic-high'
const H = 320
const GROUND = 270

type Obstacle = { x: number; w: number; h: number; fly: boolean }

const readHigh = () => {
  try {
    return Number(localStorage.getItem(HIGH_KEY)) || 0
  } catch {
    return 0
  }
}

/** A tiny remake of The Frantic Run: jump (twice) over blocks, speed ramps up. */
export function Arcade() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [state, setState] = useState<'idle' | 'running' | 'over'>('idle')
  const [score, setScore] = useState(0)
  const [high, setHigh] = useState(readHigh)
  const jumpRef = useRef<() => void>(() => {})

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    // Narrow screens get a shorter field so the game stays tall enough to play.
    const W = canvas.clientWidth < 600 ? 560 : 960
    canvas.style.aspectRatio = `${W} / ${H}`
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    const player = { x: 90, y: GROUND - 34, vy: 0, size: 34, jumps: 0 }
    let obstacles: Obstacle[] = []
    let speed = 6
    let distance = 0
    let points = 0
    let spawnIn = 60
    let raf = 0
    let mode: 'idle' | 'running' | 'over' = 'idle'
    let groundOffset = 0
    let trail: { x: number; y: number }[] = []

    const reset = () => {
      player.y = GROUND - player.size
      player.vy = 0
      player.jumps = 0
      obstacles = []
      speed = 6
      distance = 0
      points = 0
      spawnIn = 60
      trail = []
      setScore(0)
    }

    const jump = () => {
      if (mode !== 'running') {
        reset()
        mode = 'running'
        setState('running')
        return
      }
      if (player.jumps < 2) {
        player.vy = player.jumps === 0 ? -13.5 : -11
        player.jumps++
      }
    }
    jumpRef.current = jump

    const end = () => {
      mode = 'over'
      setState('over')
      setHigh((h) => {
        const next = Math.max(h, points)
        try {
          localStorage.setItem(HIGH_KEY, String(next))
        } catch {
          /* ignore */
        }
        return next
      })
    }

    const update = () => {
      speed = Math.min(15, 6 + distance / 1800)
      distance += speed
      groundOffset = (groundOffset + speed) % 40
      player.vy += 0.75
      player.y += player.vy
      if (player.y >= GROUND - player.size) {
        player.y = GROUND - player.size
        player.vy = 0
        player.jumps = 0
      }
      trail.push({ x: player.x, y: player.y })
      if (trail.length > 8) trail.shift()

      if (--spawnIn <= 0) {
        const fly = points > 8 && Math.random() < 0.25
        const h = fly ? 26 : 26 + Math.random() * 44
        obstacles.push({ x: W + 20, w: 18 + Math.random() * 22, h, fly })
        spawnIn = Math.max(34, 90 - speed * 3.2) + Math.random() * 50
      }
      for (const o of obstacles) o.x -= speed
      const before = obstacles.length
      obstacles = obstacles.filter((o) => o.x + o.w > -10)
      if (obstacles.length < before) {
        points += before - obstacles.length
        setScore(points)
        if (points >= 10) unlock('runner')
        if (points >= 40) unlock('marathon')
      }

      const pad = 5
      for (const o of obstacles) {
        const top = o.fly ? GROUND - 110 : GROUND - o.h
        const bottom = o.fly ? GROUND - 110 + o.h : GROUND
        if (player.x + player.size - pad > o.x && player.x + pad < o.x + o.w && player.y + player.size - pad > top && player.y + pad < bottom) {
          end()
          break
        }
      }
    }

    const draw = () => {
      const accent = css('--accent') || '#fa6945'
      ctx.clearRect(0, 0, W, H)
      ctx.strokeStyle = '#2b2b27'
      ctx.lineWidth = 1
      for (let x = -groundOffset; x < W; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, GROUND + 6)
        ctx.lineTo(x - 18, H)
        ctx.stroke()
      }
      ctx.fillStyle = '#f4f0e9'
      ctx.fillRect(0, GROUND, W, 2)

      trail.forEach((t, i) => {
        ctx.globalAlpha = (i / trail.length) * 0.25
        ctx.fillStyle = accent
        ctx.fillRect(t.x - (trail.length - i) * 4, t.y, player.size, player.size)
      })
      ctx.globalAlpha = 1
      ctx.fillStyle = accent
      ctx.fillRect(player.x, player.y, player.size, player.size)
      ctx.fillStyle = '#0a0a09'
      ctx.fillRect(player.x + 21, player.y + 9, 6, 6)

      for (const o of obstacles) {
        ctx.fillStyle = o.fly ? '#7aa7ff' : '#f4f0e9'
        const top = o.fly ? GROUND - 110 : GROUND - o.h
        ctx.fillRect(o.x, top, o.w, o.h)
      }
    }

    const loop = () => {
      if (mode === 'running') update()
      draw()
      raf = requestAnimationFrame(loop)
    }

    const visibleIO = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf)
      if (entry.isIntersecting) raf = requestAnimationFrame(loop)
      else if (mode === 'running') end()
    })
    visibleIO.observe(canvas)

    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== 'ArrowUp' && e.key !== 'w') return
      const target = e.target as HTMLElement
      if (target.closest('input, textarea')) return
      const rect = canvas.getBoundingClientRect()
      const onScreen = rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.25
      if (!onScreen) return
      e.preventDefault()
      jump()
    }
    window.addEventListener('keydown', onKey)
    draw()

    return () => {
      cancelAnimationFrame(raf)
      visibleIO.disconnect()
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div className="play-block" id="arcade">
      <SubHead label="B" title="The Frantic Run" note="A tiny remake of my 2024 endless runner. Space, ↑, or tap to jump. Double jump is allowed; flying blocks are best ducked under." />
      <div className="arcade-frame">
        <div className="arcade-hud mono">
          <span>score <b>{String(score).padStart(4, '0')}</b></span>
          <span>best <b>{String(Math.max(high, score)).padStart(4, '0')}</b></span>
        </div>
        <canvas ref={canvasRef} className="arcade-canvas" onPointerDown={(e) => { e.preventDefault(); jumpRef.current() }} data-cursor="jump" aria-label="Frantic Run mini-game" />
        {state !== 'running' && (
          <button type="button" className="arcade-overlay" onClick={() => jumpRef.current()}>
            <strong>{state === 'over' ? 'Game over' : 'Ready?'}</strong>
            <span className="mono">{state === 'over' ? `score ${score} · press space or tap to retry` : 'press space or tap to run'}</span>
          </button>
        )}
      </div>
    </div>
  )
}
