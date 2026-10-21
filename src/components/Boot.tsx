import { lazy, Suspense, useEffect, useState } from 'react'
import { INTRO_KEY, shouldPlayIntro } from '../lib/intro'
import { markBooted } from '../lib/store'

const shouldBoot = () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let seen = false
  try {
    seen = sessionStorage.getItem(INTRO_KEY) === '1'
  } catch {
    /* storage blocked: play it */
  }
  const forced = new URLSearchParams(window.location.search).has('intro')
  return shouldPlayIntro({ enabled: __INTRO__, forced, reducedMotion, seen, hash: window.location.hash })
}

// Most visits skip the title card (production, deep links, reduced motion, already seen), so
// it loads as its own chunk only when it will play. If that chunk fails, the site just opens.
const Skipped = () => {
  useEffect(markBooted, [])
  return null
}
const TitleCard = lazy(() =>
  import('./TitleCard').then((m) => ({ default: m.TitleCard }), () => ({ default: Skipped })),
)

export function Boot() {
  const [active] = useState(shouldBoot)

  useEffect(() => {
    if (!active) markBooted()
  }, [active])

  if (!active) return null
  // A blank stage covers the page while the chunk arrives, so the hero never flashes first.
  return (
    <Suspense fallback={<div className="boot tc" role="status" aria-label="Loading Sugi's portfolio" />}>
      <TitleCard />
    </Suspense>
  )
}
