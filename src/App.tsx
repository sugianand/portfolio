import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { emit } from './lib/store'
import { AchievementButton, AchievementDrawer, ThemeReset, Toasts } from './components/Achievements'
import { Boot } from './components/Boot'
import { Hero } from './components/Hero'
import { Nav, type NavItem } from './components/Nav'
import { CommandPalette, Confetti, Konami, Shortcuts } from './components/Overlays'
import { Assistant } from './components/Assistant'
import { RecruiterView } from './components/RecruiterView'
import { ShaderBackdrop } from './components/ShaderBackdrop'
import { About } from './components/About'
import { GitHubActivity } from './components/GitHubActivity'
import { Projects } from './components/Projects'
import { Contact, Footer, GitLog, Marquee } from './components/Sections'


const navItems: NavItem[] = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects', short: 'Work' },
  { id: 'log', label: 'Experience', short: 'Exp' },
  { id: 'github', label: 'GitHub', short: 'Git' },
  { id: 'contact', label: 'Contact' },
]

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
      <Boot />
      <ShaderBackdrop />
      <Nav items={navItems} extra={<><ThemeReset /><button type="button" className="hud rv-trigger hide-sm" onClick={() => emit('recruiter')}>60s overview</button><button type="button" className="hud mono hide-sm" onClick={() => emit('palette')} aria-label="Open command palette"><kbd>⌘K</kbd></button><AchievementButton onOpen={() => setDrawerOpen(true)} /></>} />
      <main>
        <Hero />
        <Marquee words={['Dependable systems', 'Intelligent tools', 'Build / Debug / Ship', 'Software + AI', 'Detroit, MI']} />
        <About />
        <Projects />
        <GitLog />
        <GitHubActivity />
        <Marquee words={['Curious enough to ask why', 'Practical enough to ship']} reverse />
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
