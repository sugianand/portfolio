import './App.css'
import { Boot } from './components/Boot'
import { Hero } from './components/Hero'
import { Nav, type NavItem } from './components/Nav'
import { ShaderBackdrop } from './components/ShaderBackdrop'
import { Contact, Footer, GitLog, Marquee, Stats } from './components/Sections'
import { Work } from './components/Work'

const navItems: NavItem[] = [
  { id: 'work', label: 'Work' },
  { id: 'log', label: 'Log' },
  { id: 'contact', label: 'Contact' },
]

function App() {
  return (
    <>
      <Boot />
      <ShaderBackdrop />
      <Nav items={navItems} />
      <main>
        <Hero />
        <Marquee words={['Dependable systems', 'Intelligent tools', 'Build / Debug / Ship', 'Software + AI', 'Detroit, MI']} />
        <Stats />
        <Work />
        <GitLog />
        <Marquee words={['Curious enough to ask why', 'Practical enough to ship']} reverse />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
