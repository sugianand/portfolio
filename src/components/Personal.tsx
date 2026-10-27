import { Reveal } from './effects'
import { SectionHead } from './Sections'

const hobbies = [
  ['Sports', 'Pickup games whenever I can get them. Basketball first, everything else after.'],
  ['Movies', 'Watching everything from the big releases to the deep cuts, then arguing about them.'],
  ['Food', 'Always trying somewhere new, and I review every spot I go to.'],
]

const favorites = [
  ['All-time movie', 'Avengers: Infinity War'],
  ['Sport', 'Basketball'],
  ['Current food spot', "Dave's Hot Chicken"],
]

// Placeholder frames until the real photos are in. Swap `src` in for each one.
const frames: { caption: string; src?: string }[] = [
  { caption: 'On the court' },
  { caption: 'The crew' },
  { caption: 'Game day' },
  { caption: 'Out with friends' },
  { caption: 'Mid-jumper' },
]

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

      <Reveal className="reel">
        {frames.map((f, n) => (
          <figure key={f.caption} className="frame">
            {f.src
              ? <img src={f.src} alt={f.caption} loading="lazy" />
              : <div className="frame-empty mono" aria-hidden="true">Photo soon</div>}
            <figcaption className="mono"><span>{String(n + 1).padStart(2, '0')}</span> {f.caption}</figcaption>
          </figure>
        ))}
      </Reveal>
    </section>
  )
}
