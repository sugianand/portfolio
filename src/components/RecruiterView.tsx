import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { on } from '../lib/store'

const HASH = '#recruiter'

// The summary is markup nobody needs until they ask for it, so it loads on first open.
const loadPanel = () => import('./RecruiterPanel')
const RecruiterPanel = lazy(() => loadPanel().then((m) => ({ default: m.RecruiterPanel })))

const clearHash = () => {
  if (window.location.hash === HASH) window.history.replaceState(null, '', window.location.pathname + window.location.search)
}

/** A one-screen summary for someone with 60 seconds. Opens via the hero, nav, ⌘K, `r`, or #recruiter. */
export function RecruiterView() {
  const [open, setOpen] = useState(() => window.location.hash === HASH)
  const close = useCallback(() => {
    setOpen(false)
    clearHash()
  }, [])

  useEffect(() => {
    const show = () => setOpen(true)
    const onHash = () => setOpen(window.location.hash === HASH)
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'r' || e.metaKey || e.ctrlKey || e.altKey) return
      if ((e.target as HTMLElement).closest('input, textarea, [contenteditable]')) return
      if (document.querySelector('[aria-modal="true"]')) return
      setOpen(true)
    }
    const off = on('recruiter', show)
    window.addEventListener('hashchange', onHash)
    window.addEventListener('keydown', onKey)
    // Fetch the chunk once the page is idle so the first open is instant.
    const idle = window.setTimeout(loadPanel, 2500)
    return () => {
      off()
      window.clearTimeout(idle)
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  if (!open) return null
  return <Suspense fallback={null}><RecruiterPanel onClose={close} /></Suspense>
}
