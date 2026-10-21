import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { on, unlock } from '../lib/store'
import type { Turn } from './AssistantPanel'

// The retrieval engine and knowledge base load only when the panel opens.
const loadEngine = () => import('../lib/assistant')
// So does the panel's markup; the launcher is all the first paint needs.
const loadPanel = () => import('./AssistantPanel')
const AssistantPanel = lazy(() => loadPanel().then((m) => ({ default: m.AssistantPanel })))

const prefetch = () => {
  loadPanel()
  loadEngine()
}

export function Assistant() {
  const [open, setOpen] = useState(false)
  // Kept here, not in the panel, so the conversation survives closing and reopening.
  const [turns, setTurns] = useState<Turn[]>([])
  const [busy, setBusy] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const launchRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)

  useEffect(() => on('assistant', () => setOpen(true)), [])

  // Closing unmounts the focused panel, which drops keyboard focus to <body>; hand it back to the launcher.
  useEffect(() => {
    if (open) wasOpen.current = true
    else if (wasOpen.current && document.activeElement === document.body) launchRef.current?.focus({ preventScroll: true })
  }, [open])

  useEffect(() => {
    if (!open) return
    prefetch()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const ask = async (q: string) => {
    const question = q.trim()
    if (!question || busy) return
    setBusy(true)
    const { answer } = await loadEngine()
    setTurns((t) => [...t, { q: question, a: answer(question) }].slice(-12))
    unlock('assistant')
    setBusy(false)
  }

  return (
    <>
      <button ref={launchRef} type="button" className={`ask-launch ${open ? 'hidden-launch' : ''}`} onClick={() => setOpen(true)} onPointerEnter={prefetch} onFocus={prefetch} aria-expanded={open} aria-controls="ask-panel">
        <span aria-hidden="true">✦</span> <b>Ask about Sugi</b>
      </button>
      {open && <Suspense fallback={null}><AssistantPanel turns={turns} busy={busy} onAsk={ask} onClose={close} /></Suspense>}
    </>
  )
}
