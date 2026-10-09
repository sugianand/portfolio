import { profile } from '../data'
import { scrollToId } from '../lib/store'
import { Clock } from './effects'

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-meta mono">
        <span><i className="dot" /> Open to SWE + AI roles</span>
        <span>{profile.location} · <Clock timeZone={profile.timezone} /></span>
        <span className="hide-sm">42.33°N 83.05°W</span>
      </div>

      <h1 className="hero-name">
        <span>Suganeshwara</span>
        <span>Anand<em>.</em></span>
      </h1>

      <div className="hero-foot">
        <p className="hero-intro">
          Computer scientist and AI master&apos;s student. I build <em>dependable systems</em>, intelligent tools, and software that survives contact with real users.
        </p>
        <div className="hero-actions mono">
          <button type="button" className="chip chip-solid" onClick={() => scrollToId('work')} data-cursor="go">See the work ↓</button>
        </div>
      </div>
    </section>
  )
}
