import { useCallback, useState } from 'react'
import './App.css'
import { AchievementButton, AchievementDrawer, Toasts } from './components/Achievements'
import { Boot } from './components/Boot'
import { Hero } from './components/Hero'
import { Nav, type NavItem } from './components/Nav'
import { ShaderBackdrop } from './components/ShaderBackdrop'
import { Contact, Footer, GitLog, Marquee, Stats } from './components/Sections'
import { Terminal } from './components/Terminal'
import { Work } from './components/Work'

const navItems: NavItem[] = [
  { id: 'work', label: 'Work' },
  { id: 'log', label: 'Log' },
  { id: 'shell', label: 'Shell' },
  { id: 'contact', label: 'Contact' },
]

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  return (
    <>
      <Boot />
      <ShaderBackdrop />
      <Nav items={navItems} extra={<AchievementButton onOpen={() => setDrawerOpen(true)} />} />
      <main>
        <Hero />
        <Marquee words={['Dependable systems', 'Intelligent tools', 'Build / Debug / Ship', 'Software + AI', 'Detroit, MI']} />
        <Stats />
        <Work />
        <GitLog />
        <Terminal />
        <Marquee words={['Curious enough to ask why', 'Practical enough to ship']} reverse />
        <Contact />
      </main>
      <Footer />
      <AchievementDrawer open={drawerOpen} onClose={closeDrawer} />
      <Toasts />
    </>
  )
}

export default App
