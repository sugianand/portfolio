import { lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react'
import './App.css'
import { AchievementButton, AchievementDrawer, ThemeReset, ThemeToggle, Toasts } from './components/Achievements'
import { FilmHud } from './components/FilmHud'
import { Hero } from './components/Hero'
import { Nav, type NavItem } from './components/Nav'
import { CommandPalette, Confetti, Konami, Shortcuts } from './components/Overlays'
import { Assistant } from './components/Assistant'
import { RecruiterView } from './components/RecruiterView'
import { ShaderBackdrop } from './components/ShaderBackdrop'
import { Contact, Footer, GitLog, Marquee } from './components/Sections'

// Below-the-fold sections load as separate chunks so the first paint only parses what it
// shows. Each fallback keeps the section's id, so #section deep links and the nav still
// have somewhere to land while the chunk arrives.
const About = lazy(() => import('./components/About').then((m) => ({ default: m.About })))
const Projects = lazy(() => import('./components/Projects').then((m) => ({ default: m.Projects })))
const Personal = lazy(() => import('./components/Personal').then((m) => ({ default: m.Personal })))
const GitHubActivity = lazy(() => import('./components/GitHubActivity').then((m) => ({ default: m.GitHubActivity })))

const Deferred = ({ id, children }: { id: string; children: ReactNode }) => (
  <Suspense fallback={<section className="section section-pending" id={id} aria-busy="true" />}>{children}</Suspense>
)

const navItems: NavItem[] = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects', short: 'Work' },
  { id: 'log', label: 'Experience', short: 'Exp' },
  { id: 'github', label: 'GitHub', short: 'Git' },
  { id: 'personal', label: 'B-Roll', short: 'B-Roll' },
  { id: 'contact', label: 'Contact' },
]

// The first Tab stop, so keyboard and screen-reader users can jump past the nav controls.
// Focus moves without touching the hash, which the case-study and summary routes listen to.
const SkipLink = () => (
  <a
    className="skip-link"
    href="#main"
    onClick={(e) => {
      e.preventDefault()
      document.getElementById('main')?.focus()
    }}
  >
    Skip to content
  </a>
)

// The browser tries to jump to #section before React has rendered it, so deep links
// (shared URLs, the 404 page) need a hand. Lazy chunks and web fonts shift the layout
// for a moment after mount, so re-pin until then unless the visitor starts scrolling.
const useInitialSectionHash = () => {
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!navItems.some((item) => item.id === id)) return
    const jump = () => document.getElementById(id)?.scrollIntoView({ block: 'start' })
    const timers = [0, 300, 900, 1800].map((ms) => window.setTimeout(jump, ms))
    const stop = () => timers.forEach(clearTimeout)
    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const
    events.forEach((e) => window.addEventListener(e, stop, { once: true, passive: true }))
    return () => {
      stop()
      events.forEach((e) => window.removeEventListener(e, stop))
    }
  }, [])
}

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  useInitialSectionHash()

  return (
    <>
      <SkipLink />
      <ShaderBackdrop />
      <FilmHud />
      <Nav items={navItems} extra={<><ThemeReset /><ThemeToggle /><AchievementButton onOpen={() => setDrawerOpen(true)} /></>} />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Marquee words={['Dependable systems', 'Intelligent tools', 'Build / Debug / Ship', 'Software + AI', 'Detroit, MI']} />
        <Deferred id="about"><About /></Deferred>
        <Deferred id="projects"><Projects /></Deferred>
        <GitLog />
        <Deferred id="github"><GitHubActivity /></Deferred>
        <Deferred id="personal"><Personal /></Deferred>
        <Contact />
      </main>
      <Footer />
      <AchievementDrawer open={drawerOpen} onClose={closeDrawer} />
      <Toasts />
      <CommandPalette onAchievements={() => setDrawerOpen(true)} />
      <Shortcuts />
      <RecruiterView />
      <Assistant />
      <Confetti />
      <Konami />
    </>
  )
}

export default App
