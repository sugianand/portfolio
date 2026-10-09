export const profile = {
  name: 'Suganeshwara Anand',
  short: 'SA',
  role: 'Software + AI',
  location: 'Detroit, MI',
  timezone: 'America/Detroit',
  email: 'sugianand89@gmail.com',
  github: 'https://github.com/sugianand',
  linkedin: 'https://www.linkedin.com/in/suganeshwara-anand-b86367219/',
  resume: `${import.meta.env.BASE_URL}resume.pdf`,
  source: 'https://github.com/sugianand/portfolio',
}

export type Category = 'AI' | 'Full Stack' | 'Realtime' | 'Games'

export type Project = {
  id: string
  title: string
  year: string
  kind: string
  categories: Category[]
  tagline: string
  body: string
  stack: string[]
  links: { label: string; href: string }[]
  tone: 'orange' | 'cream' | 'green' | 'ink' | 'blue'
  role: string
  status: string
  overview: string
  why: string
  features: string[]
  challenges: string[]
}

// Case-study copy is drafted from each repo's README. The "why" sections are
// worth a personal pass: they read best in your own words.
export const projects: Project[] = [
  {
    id: 'cinedna',
    title: 'CineDNA',
    year: '2026',
    kind: 'AI / Recommendation',
    categories: ['AI', 'Full Stack'],
    tagline: 'Movies by how they feel, not by genre.',
    body: 'A movie discovery engine built on hand-curated "Movie DNA" profiles. Describe a vibe in plain language and it matches films on mood, pacing, and texture.',
    stack: ['Python', 'FastAPI', 'React', 'Vite', 'Docker', 'Render'],
    links: [{ label: 'Source', href: 'https://github.com/sugianand/CineDNA' }],
    tone: 'orange',
    role: 'Solo: design, backend, frontend, deployment',
    status: 'Working prototype, actively developed',
    overview: 'CineDNA recommends movies from a plain-language description of what you are in the mood for, like "slow-burn, rainy, a little lonely". Every film in the catalog has a hand-built Movie DNA profile covering mood, pacing, and tone. A FastAPI service turns the query into those same traits and ranks the closest matches. The React frontend and the API ship together in one Docker container.',
    why: 'Genre is a weak signal for what you actually want to watch. Two "thrillers" can feel nothing alike. I wanted to search by feel, and the project was also a chance to design a recommendation pipeline from scratch: data model, ranking, API, and UI.',
    features: [
      'Natural-language search: describe a vibe and get ranked recommendations',
      'Hand-curated Movie DNA profiles on mood, pacing, tone, and texture',
      'REST API with /health, /movies, and /search, plus interactive OpenAPI docs',
      'One multi-stage Docker image serves the site and the API on the same domain',
      'One-click deploys through a Render Blueprint, with API smoke tests',
    ],
    challenges: [
      'Making a rule-based interpreter feel smart. The query parser is deliberately simple today, so the profiles and the ranking carry the weight.',
      'Packaging a Python API and a Vite frontend as one deployable unit with no separate backend URL to configure.',
      'Next: LLM-based query understanding, semantic embeddings, poster art, and personalized results.',
    ],
  },
  {
    id: 'three-clues',
    title: 'Movie in Three Clues',
    year: '2026',
    kind: 'Multiplayer / Realtime',
    categories: ['Realtime', 'Full Stack', 'Games'],
    tagline: 'A party game with a shared clock.',
    body: 'A real-time guessing game for 2 to 8 players, with room codes, teams, server-synced timers, hidden answers, and five-round scoring.',
    stack: ['TypeScript', 'React', 'Cloudflare Workers', 'D1 (SQLite)'],
    links: [{ label: 'Source', href: 'https://github.com/sugianand/movie-in-three-clues' }],
    tone: 'cream',
    role: 'Solo: game design, backend, frontend, testing',
    status: 'Complete, playable locally and deployable',
    overview: 'Players join a room with a six-character code. Each round reveals up to three clues about a movie (story, cast, director, character), and the earlier you guess, the more points you score: 300, 200, or 100. The server owns the clock and the scoring, so every player sees the same game, and nobody can see other players\' answers until the reveal.',
    why: 'Most movie trivia sticks to one film industry. I wanted a game where Indian and American cinema fans could compete in the same room. It was also a chance to solve real multiplayer problems: shared time, hidden state, and players who drop and reconnect.',
    features: [
      '2 to 8 players, room codes, invite links, and individual or team modes',
      'Easy, Normal, and Hard timers, with server-controlled clue timing and scoring',
      'Typo-tolerant answer matching that still rejects the wrong sequel',
      '200 curated films across Indian and American cinema, filterable by era',
      'Reconnects on refresh, and host handoff when the host leaves',
    ],
    challenges: [
      'Keeping state consistent across clients. Room state lives in D1 with optimistic, versioned writes, and snapshot ordering stops late responses from hiding new clues.',
      'Fuzzy matching that forgives "Interstelar" but not "Toy Story 2" for "Toy Story".',
      'Tests cover the timer boundaries, scoring, team balancing, hidden totals, and a full five-round game on the compiled Worker.',
    ],
  },
  {
    id: '11planner',
    title: '11Planner',
    year: '2026',
    kind: 'Team Build / Scheduling',
    categories: ['Full Stack', 'AI'],
    tagline: 'Stop scrambling at 11:59.',
    body: 'You enter your courses and tasks, and it decides when you should work on each one, splits the work into chunks, and builds a schedule around the rest of your life.',
    stack: ['Next.js', 'React', 'FastAPI', 'Python', 'Supabase', 'TypeScript'],
    links: [
      { label: 'Source', href: 'https://github.com/sugianand/11planner' },
    ],
    tone: 'green',
    role: 'Team project',
    status: 'Complete; the hosted demo is currently offline',
    overview: '11Planner is a study planner that builds the schedule for you. You add your courses (or drop in a syllabus PDF and it extracts the details), add tasks with deadlines and time estimates, and the backend generates a week of focused study blocks. Those blocks work around your classes, respect a daily cap, and leave room for breaks.',
    why: 'We were tired of the same cycle: knowing a project was due, not knowing when to work on it, and doing it the night before. Most students aren\'t bad at school, they\'re bad at planning, so we built something that does the planning for them.',
    features: [
      'Schedule generator that ranks tasks by urgency, meaning deadline versus effort',
      'Syllabus PDF upload that auto-fills course name, code, professor, and meeting times',
      'Day, Week, Month, and Year calendar views with drag-to-reschedule blocks',
      'Focus dashboard with a Pomodoro timer, ambient video, and sounds',
      'Chrome extension that imports Canvas assignments, plus configurable reminders',
    ],
    challenges: [
      'Turning fuzzy human preferences (steady vs. crunch, morning vs. night) into scheduling constraints the algorithm can use.',
      'Avoiding conflicts between generated blocks, class times, and daily limits while keeping the result readable.',
      'Coordinating a multi-person codebase across a Next.js frontend and a FastAPI backend.',
    ],
  },
  {
    id: 'home-cleaning',
    title: 'Home Cleaning Platform',
    year: '2025',
    kind: 'Full Stack / CSC 4710',
    categories: ['Full Stack'],
    tagline: 'A real backend behind a real service.',
    body: 'A full-stack service platform with a split frontend and backend. The backend runs on Express 5 and MySQL with file uploads, and both halves are deployed independently.',
    stack: ['JavaScript', 'Express 5', 'MySQL', 'Multer', 'Vercel'],
    links: [
      { label: 'Live', href: 'https://csc4710-home-cleaning.vercel.app' },
      { label: 'Backend', href: 'https://github.com/sugianand/csc4710-homeCleaning-backend' },
    ],
    tone: 'ink',
    role: 'Course project (CSC 4710)',
    status: 'Complete and deployed',
    overview: 'A web platform for a home-cleaning service, built for CSC 4710. A JavaScript frontend talks to an Express 5 REST API backed by a MySQL database, and the API handles file uploads with Multer. The frontend and backend are separate deployments on Vercel.',
    why: 'I wanted the course project to feel like a real product, not a checklist. Wrapping the database in a real API and UI meant designing tables around actual user flows and dealing with the parts toy projects skip: CORS, environment config, and uploads.',
    features: [
      'REST API on Express 5 with a MySQL data layer',
      'File uploads through Multer',
      'Separate frontend and backend deployments on Vercel',
      'Environment-based configuration with dotenv',
    ],
    challenges: [
      'Designing a relational schema that maps cleanly to the service\'s real workflows.',
      'Getting a split deployment right: CORS, environment variables, and a database reachable from serverless functions.',
    ],
  },
  {
    id: 'frantic-run',
    title: 'The Frantic Run',
    year: '2024',
    kind: 'Game / JavaScript',
    categories: ['Games'],
    tagline: 'Fast loops. Real feel.',
    body: 'An endless runner with movement, collision detection, and scoring, plus tuned animation loops that hold a steady frame rate on any device.',
    stack: ['JavaScript', 'HTML Canvas', 'CSS'],
    links: [
      { label: 'Play the remake', href: '#arcade' },
      { label: 'Source', href: 'https://github.com/sugianand/Frantic_Run' },
    ],
    tone: 'blue',
    role: 'Solo',
    status: 'Complete; a remake is playable on this site',
    overview: 'A browser endless runner: dodge obstacles, survive as the speed climbs, and chase a high score. Everything runs on a hand-written game loop with no engine, covering movement physics, collision detection, scoring, and rendering.',
    why: 'Games are the fastest way to feel whether your code is good. If the loop stutters or a collision is off by a few pixels, you notice right away. I wanted to understand what an engine does by writing one myself.',
    features: [
      'Responsive jump and movement physics',
      'Axis-aligned collision detection with forgiving hitboxes',
      'Scoring and difficulty that ramps up with speed',
      'Optimized animation loop for steady frame rates across devices',
    ],
    challenges: [
      'Keeping the frame rate steady on slower machines by cutting per-frame allocation and redundant draws.',
      'Tuning "game feel": jump arcs, hitbox padding, and spawn pacing so that a loss feels fair.',
    ],
  },
]

export type Role = {
  hash: string
  date: string
  type: string
  title: string
  org: string
  place: string
  refs?: string
  diff: string[]
}

export const roles: Role[] = [
  {
    hash: 'a1f09e3',
    date: 'now',
    type: 'feat(ai)',
    title: "M.S. Artificial Intelligence",
    org: 'Wayne State University',
    place: 'Detroit, MI',
    refs: 'HEAD -> main',
    diff: ['B.S. Computer Science with a minor in Mathematics', '3.97 GPA', 'Now working on a master\'s in Artificial Intelligence'],
  },
  {
    hash: '7c3d2b8',
    date: 'May - Aug 2025',
    type: 'feat(qa)',
    title: 'QA Test Engineer Intern',
    org: 'Accurate Technologies Inc.',
    place: 'Novi, MI',
    diff: ['Automated and manual test cases for embedded automotive software across diagnostic and ECU interfaces', 'Found and resolved 30+ defects with debugging, regression testing, and root-cause analysis', 'Wrote test documentation and worked in Agile QA sprints supporting CI'],
  },
  {
    hash: '4e8b1d0',
    date: 'Jan 2025 - now',
    type: 'feat(mentor)',
    title: 'Peer Technical Mentor',
    org: 'Wayne State University',
    place: 'Detroit, MI',
    refs: 'origin/mentor',
    diff: ['One-on-one help for undergraduates on programming assignments and debugging', 'Coursework support in data structures, algorithms, and web development', 'Helped students write more readable, better-organized code'],
  },
  {
    hash: '9b2f6a4',
    date: 'Aug 2024 - now',
    type: 'feat(infra)',
    title: 'Student Assistant, C&IT',
    org: 'Wayne State University',
    place: 'Detroit, MI',
    refs: 'origin/cit',
    diff: ['Built a self-service portal in C# and Blazor and imaged 500+ devices', 'Assembled and repaired machines, managed hardware inventory, and supported classroom AV', 'Supported network maintenance and research work with the High-Performance Computing team'],
  },
  {
    hash: '2d7e5c1',
    date: 'Jun - Aug 2024',
    type: 'feat(teach)',
    title: 'Summer Technology Coach',
    org: 'Rocket Companies',
    place: 'Detroit, MI',
    diff: ['Taught students HTML, CSS, and JavaScript by building a working platformer game with them', 'Guided projects from start to finish, including responsive design and performance tuning', 'Debugged collision detection, animation, and scoring with students'],
  },
  {
    hash: '6f1a8e9',
    date: 'May - Aug 2024',
    type: 'feat(backend)',
    title: 'Backend Software Developer Intern',
    org: 'NeverEnding',
    place: 'Remote',
    diff: ['Built and optimized Django and DRF backends for financial applications', 'Shipped scalable Java backend features as part of a full website revamp', 'Integrated REST endpoints with React for secure frontend-backend communication'],
  },
  {
    hash: '0c4b7f2',
    date: 'Aug 2023 - Mar 2024',
    type: 'init',
    title: 'Math Tutor',
    org: 'Mathnasium',
    place: 'Rochester Hills, MI',
    diff: ['One-on-one instruction in algebra, calculus, and geometry', 'Built custom exam-prep plans that raised student performance'],
  },
]

export const skills = {
  languages: ['Python', 'Java', 'C++', 'C#', 'TypeScript', 'JavaScript', 'SQL'],
  frameworks: ['React', 'Next.js', 'Django', 'FastAPI', 'Express', 'Blazor'],
  ai: ['PyTorch', 'TensorFlow', 'NumPy', 'MATLAB'],
  tools: ['Docker', 'Linux', 'Git', 'Supabase', 'MySQL', 'Jira'],
}

export const stats = [
  { value: 30, suffix: '+', label: 'Defects resolved at ATI' },
  { value: 500, suffix: '+', label: 'Devices imaged at C&IT' },
  { value: 6, suffix: '', label: 'Roles since 2023' },
  { value: 3.97, suffix: '', label: 'GPA', decimals: 2 },
]
