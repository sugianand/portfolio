import { useEffect, useState } from 'react'
import { markBooted } from '../lib/store'

const KEY = 'sa26:booted'

const shouldBoot = () => {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    return sessionStorage.getItem(KEY) !== '1'
  } catch {
    return true
  }
}

const browserName = () => {
  const ua = navigator.userAgent
  if (/Edg\//.test(ua)) return 'Edge'
  if (/Firefox\//.test(ua)) return 'Firefox'
  if (/Chrome\//.test(ua)) return 'Chrome'
  if (/Safari\//.test(ua)) return 'Safari'
  return 'a browser'
}

const pad = (label: string, status: string) => `${label} ${'.'.repeat(Math.max(3, 36 - label.length))} ${status}`

export function Boot() {
  const [active] = useState(shouldBoot)
  const [lines, setLines] = useState(0)
  const [progress, setProgress] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(!active)

  const [script] = useState(() => [
    `SA-OS 26.10 LTS  ·  build ${__BUILD__.hash}  ·  tty1`,
    pad('checking memory', '3.97 GPA ok'),
    pad('mounting /dev/curiosity', 'ok'),
    pad('loading coffee.service', 'ok'),
    pad('linking wsu.cs + minor(math)', 'ok'),
    pad('compiling ms.artificial_intelligence', 'in progress'),
    pad(`visitor: ${browserName()} @ ${window.innerWidth}x${window.innerHeight}`, 'welcome'),
    pad('starting suganeshwara.anand', 'ok'),
  ])

  useEffect(() => {
    if (!active) {
      markBooted()
      return
    }
    let cancelled = false
    const timers: number[] = []
    const finish = () => {
      if (cancelled) return
      cancelled = true
      timers.forEach(clearTimeout)
      try {
        sessionStorage.setItem(KEY, '1')
      } catch {
        /* ignore */
      }
      setLines(script.length)
      setProgress(100)
      setLeaving(true)
      markBooted()
      window.setTimeout(() => setGone(true), 900)
    }

    script.forEach((_, i) => timers.push(window.setTimeout(() => setLines(i + 1), 120 + i * 140)))
    const barStart = 120 + script.length * 140
    for (let i = 1; i <= 20; i++) timers.push(window.setTimeout(() => setProgress(i * 5), barStart + i * 28))
    timers.push(window.setTimeout(finish, barStart + 20 * 28 + 250))

    window.addEventListener('keydown', finish, { once: true })
    window.addEventListener('pointerdown', finish, { once: true })
    window.addEventListener('wheel', finish, { once: true, passive: true })
    document.documentElement.style.overflow = 'hidden'
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      window.removeEventListener('keydown', finish)
      window.removeEventListener('pointerdown', finish)
      window.removeEventListener('wheel', finish)
      document.documentElement.style.overflow = ''
    }
  }, [active, script])

  useEffect(() => {
    if (leaving) document.documentElement.style.overflow = ''
  }, [leaving])

  if (gone) return null

  return (
    <div className={`boot ${leaving ? 'boot-leave' : ''}`} role="status" aria-label="Loading">
      <pre className="boot-log mono">
        {script.slice(0, lines).map((line, i) => (
          <span key={i} className={i === 0 ? 'boot-title' : ''}>
            {i > 0 && <b>[{(i * 0.1213).toFixed(4).padStart(8, ' ')}] </b>}
            {line}
            {'\n'}
          </span>
        ))}
        {!leaving && <i className="boot-caret">█</i>}
      </pre>
      <div className="boot-bar">
        <div className="boot-bar-label mono"><span>{progress < 100 ? 'booting' : 'ready'}</span><span>{String(progress).padStart(3, '0')}%</span></div>
        <div className="boot-bar-track"><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
        <p className="boot-skip mono">press any key to skip</p>
      </div>
    </div>
  )
}
