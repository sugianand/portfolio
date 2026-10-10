import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'
import { useInView } from '../lib/useInView'

const GLYPHS = '!<>-_\\/[]{}=+*^?#01ABCDEFXYZ'
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function Reveal({ children, as: Tag = 'div', className = '', delay = 0 }: { children: ReactNode; as?: ElementType; className?: string; delay?: number }) {
  const [ref, inView] = useInView<HTMLElement>(0.15)
  return (
    <Tag ref={ref} className={`reveal ${inView ? 'is-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  )
}

/** Text that decodes from random glyphs when it scrolls into view, and again on hover. */
export function Scramble({ text, className = '', trigger = 'view' }: { text: string; className?: string; trigger?: 'view' | 'hover' | 'both' }) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.4)
  const [output, setOutput] = useState(text)
  const frame = useRef(0)

  const run = () => {
    if (reduceMotion()) return
    cancelAnimationFrame(frame.current)
    const start = performance.now()
    const duration = 380 + text.length * 22
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const settled = Math.floor(progress * text.length)
      let next = ''
      for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        next += i < settled || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]
      }
      setOutput(next)
      if (progress < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }

  const runRef = useRef(run)
  useEffect(() => {
    runRef.current = run
  })
  const onView = trigger !== 'hover'

  useEffect(() => {
    if (inView && onView) runRef.current()
    return () => cancelAnimationFrame(frame.current)
  }, [inView, onView, text])

  return (
    <span ref={ref} className={`scramble ${className}`} onPointerEnter={trigger !== 'view' ? run : undefined}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{output}</span>
    </span>
  )
}

export function CountUp({ value, decimals = 0, suffix = '' }: { value: number; decimals?: number; suffix?: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.6)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const duration = reduceMotion() ? 1 : 1400
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setCurrent(value * (1 - Math.pow(1 - t, 4)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value])

  return (
    <span ref={ref} className="count">
      <span className="sr-only">{value.toFixed(decimals)}{suffix}</span>
      <span aria-hidden="true">{current.toFixed(decimals)}{suffix}</span>
    </span>
  )
}

// Building an Intl formatter is far more expensive than using one, and the
// clocks tick every second, so keep one per time zone.
const formatters = new Map<string, Intl.DateTimeFormat>()
const formatterFor = (timeZone: string) => {
  let f = formatters.get(timeZone)
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    formatters.set(timeZone, f)
  }
  return f
}

/** Live wall clock for a time zone. Pauses while the tab is hidden. */
export function Clock({ timeZone }: { timeZone: string }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => { if (!document.hidden) setNow(new Date()) }, 1000)
    return () => window.clearInterval(id)
  }, [])
  return <>{formatterFor(timeZone).format(now)}</>
}
