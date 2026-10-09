import { useEffect, useRef, useState } from 'react'
import './App.css'
import heroObject from './assets/hero.png'

type Panel = 'home' | 'work' | 'about' | 'contact'

const tabs: { id: Panel; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]

function App() {
  const [activePanel, setActivePanel] = useState<Panel>('home')
  const pageRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const page = pageRef.current
    if (!page) return

    const updatePointer = (event: PointerEvent) => {
      page.style.setProperty('--pointer-x', `${event.clientX}px`)
      page.style.setProperty('--pointer-y', `${event.clientY}px`)
    }

    window.addEventListener('pointermove', updatePointer)
    return () => window.removeEventListener('pointermove', updatePointer)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        const currentIndex = tabs.findIndex((tab) => tab.id === activePanel)
        const direction = event.key === 'ArrowRight' ? 1 : -1
        const nextIndex = (currentIndex + direction + tabs.length) % tabs.length
        setActivePanel(tabs[nextIndex].id)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activePanel])

  return (
    <main ref={pageRef} className={`app app-${activePanel}`}>
      <div className="pointer-glow" aria-hidden="true"></div>
      <header className="topbar">
        <a className="wordmark" href="#home" onClick={() => setActivePanel('home')}>SA<span>/</span>26</a>
        <nav className="tab-nav" aria-label="Main navigation">
          {tabs.map((tab, index) => (
            <button
              className={activePanel === tab.id ? 'active' : ''}
              key={tab.id}
              onClick={() => setActivePanel(tab.id)}
              type="button"
            >
              <span>0{index + 1}</span>{tab.label}
            </button>
          ))}
        </nav>
        <a className="availability" href="mailto:sugianand89@gmail.com"><i></i> Available / 2026</a>
      </header>

      <div className="panel-stage">
        <section className={`panel home-panel ${activePanel === 'home' ? 'panel-active' : ''}`} aria-hidden={activePanel !== 'home'}>
          <div className="hero-grid"></div>
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot"></span> Software + AI / Detroit, MI</p>
            <h1>Software with<br /><em>a point of view.</em></h1>
            <p className="hero-intro">I’m Suganeshwara Anand—a computer scientist and AI master's student building dependable systems, intelligent tools, and experiences with character.</p>
            <button className="button button-bright" onClick={() => setActivePanel('work')} type="button">Enter the work <span>-&gt;</span></button>
          </div>
          <div className="hero-signal" aria-label="Profile signal visualization">
            <div className="signal-orbit orbit-one"></div><div className="signal-orbit orbit-two"></div>
            <div className="signal-core"><span>SA</span></div>
            <img className="hero-object" src={heroObject} alt="" />
            <span className="signal-label label-top">AI / SYSTEMS</span><span className="signal-label label-right">3.97 GPA</span>
            <span className="signal-label label-bottom">BUILD / DEBUG / SHIP</span><span className="signal-label label-left">SCROLL? NO. CLICK.</span>
          </div>
          <span className="panel-number">01 <b>/</b> 04</span>
        </section>

        <section className={`panel work-panel ${activePanel === 'work' ? 'panel-active' : ''}`} aria-hidden={activePanel !== 'work'}>
          <div className="panel-heading"><p className="eyebrow">Selected output / 2023 - now</p><h2>Proof over<br /><em>promises.</em></h2></div>
          <div className="work-list">
            <article className="work-card feature-card"><div className="card-topline"><span>01 / EXPERIENCE</span><span>QA + EMBEDDED</span></div><div className="card-content"><p className="card-kicker">Accurate Technologies Inc.</p><h3>Trust is a<br /><em>testable</em> feature.</h3><p>Automated and manual test coverage for automotive diagnostic and ECU interfaces. Resolved 30+ defects through root-cause analysis and regression testing.</p></div><div className="card-footer"><span>May - Aug 2025</span><span>-&gt;</span></div></article>
            <article className="work-card dark-card"><div className="card-topline"><span>02 / PRODUCT</span><span>BACKEND + FULL STACK</span></div><div className="card-content"><p className="card-kicker">NeverEnding</p><h3>Make the<br /><em>invisible</em> work.</h3><p>Django, REST, Java, and React systems for secure, efficient financial data flows.</p></div><div className="card-footer"><span>May - Aug 2024</span><span>-&gt;</span></div></article>
            <article className="work-card orange-card"><div className="card-topline"><span>03 / PROJECT</span><span>JAVASCRIPT + GAME DEV</span></div><div className="card-content"><p className="card-kicker">The Frantic Run</p><h3>Fast loops.<br /><em>Real feel.</em></h3><p>An endless runner with responsive movement, collision detection, scoring, and optimized animation loops.</p></div><div className="card-footer"><a href="https://github.com/sugianand/Frantic_Run" target="_blank" rel="noreferrer">GitHub / 2024</a><span>-&gt;</span></div></article>
          </div>
        </section>

        <section className={`panel about-panel ${activePanel === 'about' ? 'panel-active' : ''}`} aria-hidden={activePanel !== 'about'}>
          <div className="about-copy"><p className="eyebrow">The short version</p><h2>Curious enough<br />to ask why.</h2><h2><em>Practical enough<br />to ship.</em></h2><p>I am Suganeshwara, a Wayne State computer scientist with a minor in mathematics and a master’s in Artificial Intelligence in progress. I like the hard middle of a problem: the edge cases, the architecture, the moment a rough idea becomes something real.</p></div>
          <div className="stack"><p className="eyebrow">Current stack</p><div className="stack-items">{['Python', 'Java', 'C++', 'TypeScript', 'React', 'Django', 'TensorFlow', 'PyTorch', 'Docker', 'SQL', 'Linux', 'Git'].map((skill) => <span key={skill}>{skill}</span>)}</div></div>
        </section>

        <section className={`panel contact-panel ${activePanel === 'contact' ? 'panel-active' : ''}`} aria-hidden={activePanel !== 'contact'}>
          <div><p className="eyebrow">Have a problem worth solving?</p><h2>Let’s make<br /><em>something real.</em></h2><a className="contact-email" href="mailto:sugianand89@gmail.com">sugianand89@gmail.com <span>-&gt;</span></a></div>
          <div className="contact-links"><a href="https://github.com/sugianand?tab=repositories" target="_blank" rel="noreferrer">GitHub repositories <span>↗</span></a><a href="https://www.linkedin.com/in/suganeshwara-anand-b86367219/" target="_blank" rel="noreferrer">LinkedIn profile <span>↗</span></a><a href="/resume.pdf" download="Suganeshwara-Anand-Resume.pdf">Resume PDF <span>↓</span></a><p>Open to software engineering, AI, and systems opportunities.</p></div>
        </section>
      </div>

      <footer className="footer"><span>© 2026 Suganeshwara Anand</span><span>Use ← → or click a tab</span></footer>
    </main>
  )
}

export default App
