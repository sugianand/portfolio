import { useCallback, useState } from 'react'
import './App.css'
import { emit } from './lib/store'
import { AchievementButton, AchievementDrawer, Toasts } from './components/Achievements'
import { Arcade } from './components/Arcade'
import { Boot } from './components/Boot'
import { Hero } from './components/Hero'
import { Nav, type NavItem } from './components/Nav'
import { CommandPalette, Confetti, Konami } from './components/Overlays'
import { ShaderBackdrop } from './components/ShaderBackdrop'
import { Contact, Footer, GitLog, Marquee, Stats } from './components/Sections'
import { Terminal } from './components/Terminal'
import { Work } from './components/Work'

const navItems: NavItem[] = [
  { id: 'work', label: 'Work' },
  { id: 'log', label: 'Log' },
  { id: 'shell', label: 'Shell' },
  { id: 'arcade', label: 'Arcade' },
  { id: 'contact', label: 'Contact' },
]

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  return (
    <>
      <Boot />
      <ShaderBackdrop />
      <Nav items={navItems} extra={<><button type="button" className="hud mono hide-sm" onClick={() => emit('palette')} aria-label="Open command palette"><kbd>⌘K</kbd></button><AchievementButton onOpen={() => setDrawerOpen(true)} /></>} />
      <main>
        <Hero />
        <Marquee words={['Dependable systems', 'Intelligent tools', 'Build / Debug / Ship', 'Software + AI', 'Detroit, MI']} />
        <Stats />
        <Work />
        <GitLog />
        <Terminal />
        <Arcade />
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
