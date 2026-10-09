import { lazy, Suspense, useCallback, useState } from 'react'
import './App.css'
import { emit } from './lib/store'
import { AchievementButton, AchievementDrawer, ThemeReset, Toasts } from './components/Achievements'
import { Boot } from './components/Boot'
import { Hero } from './components/Hero'
import { Nav, type NavItem } from './components/Nav'
import { CommandPalette, Confetti, Konami } from './components/Overlays'
import { ShaderBackdrop } from './components/ShaderBackdrop'
import { About } from './components/About'
import { GitHubActivity } from './components/GitHubActivity'
import { Projects } from './components/Projects'
import { Contact, Footer, GitLog, Marquee, Playground } from './components/Sections'

// The Playground sits far below the fold, so its terminal and game load as separate chunks.
const Terminal = lazy(() => import('./components/Terminal').then((m) => ({ default: m.Terminal })))
const Arcade = lazy(() => import('./components/Arcade').then((m) => ({ default: m.Arcade })))

const navItems: NavItem[] = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects', short: 'Work' },
  { id: 'log', label: 'Experience', short: 'Exp' },
  { id: 'github', label: 'GitHub', short: 'Git' },
  { id: 'playground', label: 'Playground', short: 'Play' },
  { id: 'contact', label: 'Contact' },
]

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  return (
    <>
      <Boot />
      <ShaderBackdrop />
      <Nav items={navItems} extra={<><ThemeReset /><button type="button" className="hud mono hide-sm" onClick={() => emit('palette')} aria-label="Open command palette"><kbd>⌘K</kbd></button><AchievementButton onOpen={() => setDrawerOpen(true)} /></>} />
      <main>
        <Hero />
        <Marquee words={['Dependable systems', 'Intelligent tools', 'Build / Debug / Ship', 'Software + AI', 'Detroit, MI']} />
        <About />
        <Projects />
        <GitLog />
        <GitHubActivity />
        <Playground>
          <Suspense fallback={null}>
            <Terminal />
            <Arcade />
          </Suspense>
        </Playground>
        <Marquee words={['Curious enough to ask why', 'Practical enough to ship']} reverse />
        <Contact />
      </main>
      <Footer />
      <AchievementDrawer open={drawerOpen} onClose={closeDrawer} />
      <Toasts />
      <CommandPalette onAchievements={() => setDrawerOpen(true)} />
      <Confetti />
      <Konami />
    </>
  )
}

export default App
