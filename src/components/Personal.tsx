import { favorites, hobbies } from '../data'
import { Reveal } from './effects'
import { SectionHead } from './Sections'

// Add a photo by setting `src` (e.g. '/broll/court.jpg' in public/). Frames without one stay
// hidden, and the whole reel waits until at least one photo is in, so nothing looks unfinished.
const frames: { caption: string; src?: string }[] = [
  { caption: 'On the court' },
  { caption: 'The crew' },
  { caption: 'Game day' },
  { caption: 'Out with friends' },
  { caption: 'Mid-jumper' },
]

const shots = frames.filter((f): f is { caption: string; src: string } => Boolean(f.src))

export function Personal() {
  return (
    <section className="section personal" id="personal">
      <SectionHead index="05" kicker="B-Roll" title="Off the" accent="clock." note="The footage between the work: what I do when I'm not shipping code." />
      <div className="personal-grid">
        <Reveal className="hobbies">
          {hobbies.map(([name, text], n) => (
            <div key={name} className="hobby">
              <span className="mono">{String(n + 1).padStart(2, '0')}</span>
              <h3>{name}</h3>
              <p>{text}</p>
            </div>
          ))}
        </Reveal>
        <Reveal className="facts" delay={120}>
          <dl>
            {favorites.map(([k, v]) => (
              <div key={k}>
                <dt className="mono">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      {shots.length > 0 && (
        <Reveal className="reel">
          {shots.map((f, n) => (
            <figure key={f.caption} className="frame">
              <img src={f.src} alt={f.caption} loading="lazy" />
              <figcaption className="mono"><span>{String(n + 1).padStart(2, '0')}</span> {f.caption}</figcaption>
            </figure>
          ))}
        </Reveal>
      )}
    </section>
  )
}
