import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { profile, projects, roles, skills } from '../data'
import { accents, achievementList, copyEmail, emit, getState, scrollToId, setAccent, unlock, type AccentName } from '../lib/store'
import { SectionHead } from './Sections'

type Line = { id: number; kind: 'in' | 'out' | 'err' | 'dim' | 'ok'; body: ReactNode }

const PROMPT = 'visitor@sa-os:~$'

const COMMANDS = [
  'help', 'whoami', 'ls', 'cat', 'projects', 'experience', 'skills', 'contact', 'resume', 'open',
  'neofetch', 'theme', 'play', 'achievements', 'sudo', 'rm', 'clear', 'history', 'date', 'echo',
  'pwd', 'cd', 'git', 'exit', 'vim', 'coffee', 'ping',
]

const FILES = ['about.txt', 'experience.log', 'projects/', 'resume.pdf', 'secrets/']

const neofetchArt = String.raw`
   _____  ___
  / ___/ /   |
  \__ \ / /| |
 ___/ // ___ |
/____//_/  |_|
`

let lineId = 0
const line = (kind: Line['kind'], body: ReactNode): Line => ({ id: ++lineId, kind, body })

const external = (href: string) => window.open(href, '_blank', 'noopener,noreferrer')

type Context = {
  print: (...lines: Line[]) => void
  clear: () => void
  shake: () => void
  run: (cmd: string) => void
  history: string[]
}

function respond(cmd: string, ctx: Context) {
  const [name, ...args] = cmd.split(/\s+/)
  const arg = args.join(' ')

  switch (name.toLowerCase()) {
    case 'help':
      return ctx.print(line('out', (
        <div className="help-grid">
          {[
            ['whoami', 'the short bio'],
            ['ls / cat <file>', 'poke around the filesystem'],
            ['projects', 'things I have shipped'],
            ['experience', 'the career git log'],
            ['skills', 'languages, frameworks, tools'],
            ['open <name>', 'github, linkedin, resume, or a project'],
            ['contact', 'copy my email'],
            ['neofetch', 'system specs'],
            ['theme <color>', Object.keys(accents).join(' | ')],
            ['play', 'go to the arcade'],
            ['achievements', 'secrets found so far'],
            ['clear', 'wipe the screen'],
          ].map(([c, d]) => <span key={c}><b>{c}</b><i>{d}</i></span>)}
          <span className="help-foot">There are a few commands not listed here.</span>
        </div>
      )))
    case 'whoami':
      return ctx.print(line('out', `${profile.name}. Computer scientist (Wayne State, minor in Math) now doing an M.S. in Artificial Intelligence. I like the hard middle of a problem: the edge cases, the architecture, and the moment a rough idea becomes something real.`))
    case 'ls':
      if (arg.startsWith('projects')) return ctx.print(...projects.map((p) => line('out', <><b>{p.id}/</b> <i>{p.tagline}</i></>)))
      if (arg.startsWith('secrets')) return ctx.print(line('err', 'ls: cannot open directory \'secrets/\': Permission denied (try sudo?)'))
      return ctx.print(line('out', <div className="ls">{FILES.map((f) => <span key={f} className={f.endsWith('/') ? 'dir' : ''}>{f}</span>)}</div>))
    case 'cat': {
      if (!arg) return ctx.print(line('err', 'cat: missing file operand'))
      if (arg === 'about.txt') return ctx.run('whoami')
      if (arg === 'experience.log') return ctx.run('experience')
      if (arg === 'resume.pdf') return ctx.print(line('err', 'cat: resume.pdf: binary file. Try `resume` or `open resume`.'))
      if (arg.startsWith('secrets')) return ctx.print(line('err', `cat: ${arg}: Permission denied`))
      if (arg.startsWith('projects')) return ctx.print(line('err', `cat: ${arg}: Is a directory`))
      return ctx.print(line('err', `cat: ${arg}: No such file or directory`))
    }
    case 'projects':
      return ctx.print(...projects.map((p) => line('out', <><b>{p.title.padEnd(24, ' ')}</b><i>{p.stack.join(' · ')}</i></>)), line('dim', 'tip: open <name>, e.g. `open cinedna`'))
    case 'experience':
      return ctx.print(...roles.map((r) => line('out', <><span className="t-hash">{r.hash}</span> <span className="t-type">{r.type}:</span> {r.title} <i>@ {r.org}</i></>)))
    case 'skills':
      return ctx.print(...Object.entries(skills).map(([k, v]) => line('out', <><b>{k.padEnd(11, ' ')}</b>{v.join(', ')}</>)))
    case 'contact':
    case 'email':
      copyEmail(profile.email)
      return ctx.print(line('ok', `${profile.email}  (copied to clipboard)`))
    case 'resume':
      external(profile.resume)
      return ctx.print(line('ok', 'opening resume.pdf in a new tab...'))
    case 'open': {
      const target = arg.toLowerCase()
      const map: Record<string, string> = { github: profile.github, linkedin: profile.linkedin, resume: profile.resume, source: profile.source }
      const project = projects.find((p) => p.id === target || p.title.toLowerCase() === target)
      const href = map[target] ?? project?.links.find((l) => !l.href.startsWith('#'))?.href
      if (!href) return ctx.print(line('err', `open: unknown target '${arg}'. Try github, linkedin, resume, or ${projects.map((p) => p.id).join(', ')}`))
      external(href)
      return ctx.print(line('ok', `opening ${href}`))
    }
    case 'neofetch': {
      unlock('neofetch')
      const rows: [string, string][] = [
        ['OS', 'SA-OS 26.10 LTS x86_64'],
        ['Host', 'Wayne State University'],
        ['Kernel', 'curiosity-6.9-ai'],
        ['Uptime', `${new Date().getFullYear() - 2023}+ years shipping`],
        ['Packages', `${Object.values(skills).flat().length} (skills)`],
        ['Shell', 'sa-sh 1.0'],
        ['Resolution', `${window.innerWidth}x${window.innerHeight}`],
        ['Theme', `${getState().accent} [dark]`],
        ['CPU', 'Coffee @ 4.2 cups/day'],
        ['Memory', 'Remembers every edge case'],
      ]
      return ctx.print(line('out', (
        <div className="neofetch">
          <pre>{neofetchArt}</pre>
          <div>
            <p><b>visitor</b>@<b>sa-os</b></p>
            <p className="rule">-----------</p>
            {rows.map(([k, v]) => <p key={k}><b>{k}</b>: {v}</p>)}
            <p className="swatches">{Object.values(accents).map((c) => <i key={c} style={{ background: c }} />)}</p>
          </div>
        </div>
      )))
    }
    case 'theme': {
      const name = arg.toLowerCase() as AccentName
      if (!arg) return ctx.print(line('out', `current: ${getState().accent}. available: ${Object.keys(accents).join(', ')}`))
      if (!(name in accents)) return ctx.print(line('err', `theme: unknown color '${arg}'`))
      setAccent(name)
      return ctx.print(line('ok', `accent set to ${name}`))
    }
    case 'play':
    case 'game':
      scrollToId('arcade')
      return ctx.print(line('ok', 'launching frantic_run...'))
    case 'achievements': {
      const got = getState().unlocked
      return ctx.print(...achievementList.map((a) => line(got.includes(a.id) ? 'ok' : 'dim', `${got.includes(a.id) ? '[x]' : '[ ]'} ${got.includes(a.id) ? a.name : '???'}  ${got.includes(a.id) ? '' : `· ${a.hint}`}`)))
    }
    case 'sudo': {
      if (arg === 'hire-me' || arg === 'hire me' || arg === 'hire suganeshwara') {
        unlock('sudo')
        emit('confetti')
        ctx.print(line('dim', '[sudo] password for visitor: ********'), line('ok', 'Access granted. Excellent decision.'), line('out', <>Drafting an email to <b>{profile.email}</b>...</>))
        window.setTimeout(() => { window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent("Let's talk")}` }, 1400)
        return
      }
      if (arg.startsWith('ls secrets') || arg.startsWith('cat secrets')) {
        return ctx.print(line('dim', '[sudo] password for visitor: ********'), ...achievementList.map((a) => line('out', `- ${a.hint}`)))
      }
      if (arg.startsWith('rm')) return ctx.run(arg)
      return ctx.print(line('err', 'visitor is not in the sudoers file. This incident will be reported.'), line('dim', 'hint: there is exactly one thing sudo will let you do here.'))
    }
    case 'rm':
      if (/-[a-z]*r[a-z]*f|-[a-z]*f[a-z]*r/i.test(arg)) {
        unlock('rmrf')
        ctx.shake()
        ctx.print(...['/bin', '/usr/lib/curiosity', '/home/suganeshwara/projects', '/etc/coffee.conf'].map((p) => line('err', `removing ${p}...`)))
        window.setTimeout(() => ctx.print(line('ok', 'Just kidding. Everything is version-controlled. Nice try, though.')), 900)
        return
      }
      return ctx.print(line('err', `rm: cannot remove '${arg || ''}': Operation not permitted`))
    case 'clear':
      return ctx.clear()
    case 'history':
      return ctx.print(...[...ctx.history, cmd].map((h, i) => line('out', `${String(i + 1).padStart(4, ' ')}  ${h}`)))
    case 'date':
      return ctx.print(line('out', new Date().toString()))
    case 'echo':
      return ctx.print(line('out', arg))
    case 'pwd':
      return ctx.print(line('out', '/home/visitor'))
    case 'cd':
      return ctx.print(line('out', 'There is nowhere else to go. This is home.'))
    case 'git':
      if (args[0] === 'log') {
        scrollToId('log')
        return ctx.print(line('ok', 'scrolling to the career log...'))
      }
      return ctx.print(line('out', 'usage: git log'))
    case 'vim':
    case 'vi':
    case 'nano':
      return ctx.print(line('err', 'Opened vim. You are now trapped forever. (Type :q! … just kidding, there is no vim.)'))
    case ':q':
    case ':q!':
    case ':wq':
      return ctx.print(line('ok', 'Freed. Congratulations, you escaped vim.'))
    case 'exit':
      return ctx.print(line('out', 'You can check out any time you like, but you can never leave.'))
    case 'coffee':
      return ctx.print(line('out', '  ( (\n   ) )\n ........\n |      |]\n \\      /\n  `----\'   brewing... done. ☕'))
    case 'ping':
      return ctx.print(line('out', `PONG from ${profile.location} · ${(Math.random() * 20 + 8).toFixed(1)}ms`))
    default:
      return ctx.print(line('err', `command not found: ${name}. Type 'help'.`))
  }
}

export function Terminal() {
  const [lines, setLines] = useState<Line[]>(() => [
    line('dim', `SA-OS 26.10 LTS · build ${__BUILD__.hash} · ${new Date().toDateString()}`),
    line('out', <>Welcome. This shell is real. Type <b>help</b> to see what it can do, or tap a suggestion below.</>),
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [cursor, setCursor] = useState(-1)
  const [shaking, setShakeOn] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const print = (...next: Line[]) => setLines((prev) => [...prev, ...next].slice(-200))
  const shake = () => {
    setShakeOn(true)
    window.setTimeout(() => setShakeOn(false), 700)
  }

  const run = (raw: string) => {
    const cmd = raw.trim()
    print(line('in', cmd))
    if (!cmd) return
    setHistory((h) => [...h.filter((x) => x !== cmd), cmd])
    setCursor(-1)
    unlock('hello')

    respond(cmd, { print, clear: () => setLines([]), shake, run, history })
  }

  const complete = () => {
    const parts = input.split(' ')
    if (parts.length === 1) {
      const matches = COMMANDS.filter((c) => c.startsWith(parts[0]))
      if (matches.length === 1) setInput(`${matches[0]} `)
      else if (matches.length > 1) print(line('in', input), line('dim', matches.join('  ')))
      return
    }
    const last = parts[parts.length - 1]
    const pool = parts[0] === 'theme' ? Object.keys(accents) : parts[0] === 'open' ? ['github', 'linkedin', 'resume', ...projects.map((p) => p.id)] : FILES
    const matches = pool.filter((c) => c.startsWith(last))
    if (matches.length === 1) setInput([...parts.slice(0, -1), matches[0]].join(' '))
    else if (matches.length > 1) print(line('in', input), line('dim', matches.join('  ')))
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input)
      setInput('')
    } else if (e.key === 'Tab') {
      e.preventDefault()
      complete()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!history.length) return
      const next = cursor < 0 ? history.length - 1 : Math.max(0, cursor - 1)
      setCursor(next)
      setInput(history[next])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (cursor < 0) return
      const next = cursor + 1
      if (next >= history.length) {
        setCursor(-1)
        setInput('')
      } else {
        setCursor(next)
        setInput(history[next])
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }

  const suggest = (cmd: string) => {
    run(cmd)
    inputRef.current?.focus({ preventScroll: true })
  }

  return (
    <section className="section shell" id="shell">
      <SectionHead index="03" kicker="Interactive" title="Talk to" accent="the machine." note="A working shell. Tab completes, arrow keys walk history, and yes, sudo exists." />
      <div className={`terminal-frame term ${shaking ? 'term-shake' : ''}`} onClick={() => inputRef.current?.focus({ preventScroll: true })}>
        <div className="frame-bar mono">
          <span className="lights"><i /><i /><i /></span>
          <span>visitor@sa-os — sa-sh — 80×24</span>
          <span>tty1</span>
        </div>
        <div className="term-body mono" ref={scrollRef}>
          {lines.map((l) => (
            <div key={l.id} className={`term-line term-${l.kind}`}>
              {l.kind === 'in' && <span className="term-prompt">{PROMPT}</span>}
              {l.body}
            </div>
          ))}
          <label className="term-input">
            <span className="term-prompt">{PROMPT}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              aria-label="Terminal input"
            />
          </label>
        </div>
      </div>
      <div className="term-suggest mono">
        {['help', 'neofetch', 'projects', 'theme green', 'sudo hire-me', 'rm -rf /'].map((c) => (
          <button key={c} type="button" onClick={() => suggest(c)} className="chip">{c}</button>
        ))}
      </div>
    </section>
  )
}
