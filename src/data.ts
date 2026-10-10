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

export type Category = 'AI' | 'Full Stack' | 'Realtime' | 'Backend' | 'Games'

export type ArchNode = {
  id: string
  label: string
  /** Short tech name shown under the label. */
  tech: string
  /** One or two sentences shown when the node is focused. */
  detail: string
  /** Column in the diagram, left to right. */
  tier: number
}

export type Project = {
  id: string
  title: string
  year: string
  kind: string
  categories: Category[]
  /** Shown in the featured row with a live product preview. */
  featured?: boolean
  tagline: string
  body: string
  stack: string[]
  links: { label: string; href: string }[]
  tone: 'orange' | 'cream' | 'green' | 'ink' | 'blue'
  role: string
  status: string
  problem: string
  overview: string
  why: string
  /** What Sugi personally built; omitted where it is not verified. */
  built?: string[]
  /** Only numbers that can be checked in the repo or README. */
  metrics?: { value: string; label: string }[]
  architecture?: { nodes: ArchNode[]; edges: [string, string, string?][] }
  hardest?: string
  features: string[]
  challenges: string[]
  next?: string[]
}

// Every technical claim below is taken from the project's repository (code,
// tests, or README). The "why" sections are drafts worth a personal pass.
export const projects: Project[] = [
  {
    id: 'cinedna',
    title: 'CineDNA',
    year: '2026',
    kind: 'AI / Recommendation',
    categories: ['AI', 'Full Stack', 'Backend'],
    featured: true,
    tagline: 'Movies by how they feel, not by genre.',
    body: 'Describe a vibe in plain language and CineDNA ranks films across 14 weighted "DNA" dimensions such as pacing, darkness, and plot twists, with live TMDB lookups.',
    stack: ['Python', 'FastAPI', 'React', 'Vite', 'TMDB API', 'Docker', 'GitHub Actions'],
    links: [{ label: 'Source', href: 'https://github.com/sugianand/CineDNA' }],
    tone: 'orange',
    role: 'Solo: design, backend, ranking engine, frontend, deployment',
    status: 'Working prototype, actively developed',
    problem: 'Genre filters cannot express what people actually want to watch. "Slow-burn, a little dark, no romance, something like Interstellar" has no checkbox.',
    overview: 'CineDNA turns a plain-language request into a target profile across 14 "Movie DNA" dimensions, then ranks films by weighted distance to that profile. The query parser handles negation ("without romance"), pacing words, themes, and reference titles ("like Interstellar"). When a TMDB token is configured, it also pulls live titles and infers their DNA from genres, overview text, and rating.',
    why: 'Genre is a weak signal for what you actually want to watch. Two "thrillers" can feel nothing alike. I wanted to search by feel, and the project was also a chance to design a recommendation pipeline from scratch: data model, ranking, API, and UI.',
    built: [
      'The intent parser: 14 dimension rule sets, theme vocabulary, negation handling, and reference-movie detection',
      'The scoring engine: weighted RMSE across DNA dimensions, combined with theme include and exclude scores',
      'A TMDB client that maps genres, overview text, and ratings onto DNA dimensions, including Indian-language titles',
      'The FastAPI service, the React UI, a multi-stage Docker image, a Render blueprint, and CI',
    ],
    metrics: [
      { value: '14', label: 'weighted DNA dimensions' },
      { value: '3', label: 'backend test suites, run in CI' },
      { value: '1', label: 'container serving the UI and API' },
    ],
    architecture: {
      nodes: [
        { id: 'ui', label: 'React UI', tech: 'Vite', tier: 0, detail: 'A search box and result cards. In development, Vite proxies /api to the backend; in production, both share one origin.' },
        { id: 'api', label: 'FastAPI', tech: 'POST /api/search', tier: 1, detail: 'Validates the query with Pydantic models and orchestrates parsing, retrieval, and ranking. Also serves /api/health and /api/movies.' },
        { id: 'intent', label: 'Intent parser', tech: 'services/ai.py', tier: 2, detail: 'Rule-based NLU: maps phrases onto 14 dimensions, extracts included and excluded themes, and spots reference titles. Deliberately not an LLM yet.' },
        { id: 'score', label: 'Ranking engine', tech: 'services/scoring.py', tier: 2, detail: 'Weighted RMSE between each film and the target profile, blended with theme overlap. Excluded themes push matches down.' },
        { id: 'catalog', label: 'Movie DNA catalog', tech: 'hand-curated', tier: 3, detail: 'Starter films with hand-scored dimensions, themes, and genres. These are the ground truth the ranker learns its scale from.' },
        { id: 'tmdb', label: 'TMDB API', tech: 'services/tmdb.py', tier: 3, detail: 'Optional live catalog. Dimensions are inferred from TMDB genres, overview keywords, and rating, and only used when a token is set.' },
      ],
      edges: [['ui', 'api', 'query'], ['api', 'intent'], ['intent', 'score', 'target profile'], ['score', 'catalog'], ['score', 'tmdb']],
    },
    hardest: 'Making a rule-based parser understand compound requests. "Dark but not bleak, without romance, like Interstellar" needs negation scopes, excluded themes, and a reference film that seeds the target profile, all before ranking. The scorer then has to balance dimension distance against theme matches so one excluded theme sinks a film without zeroing everything else.',
    features: [
      'Natural-language search: describe a vibe and get ranked recommendations',
      'Negation ("without romance") and reference titles ("like Interstellar")',
      'Live TMDB catalog when configured, with Indian-language titles',
      'REST API with interactive OpenAPI docs',
      'One multi-stage Docker image, a Render blueprint, and tests in CI',
    ],
    challenges: [
      'A rule-based interpreter has to feel smart. The profiles and ranking carry the weight, and the parser stays transparent and testable.',
      'Inferring DNA for live TMDB titles from sparse metadata without drowning out the hand-curated catalog.',
      'Packaging a Python API and a Vite frontend as one deployable unit with no separate backend URL.',
    ],
    next: ['LLM-based query understanding', 'Semantic embeddings for retrieval', 'Poster art and personalized results'],
  },
  {
    id: 'three-clues',
    title: 'Movie in Three Clues',
    year: '2026',
    kind: 'Realtime / Multiplayer',
    categories: ['Realtime', 'Full Stack', 'Backend', 'Games'],
    featured: true,
    tagline: 'A party game with a server-owned clock.',
    body: 'Real-time guessing for 2 to 8 players: room codes, teams, three difficulty timers, hidden answers, and five-round scoring, on Cloudflare Workers with D1.',
    stack: ['TypeScript', 'React', 'Cloudflare Workers', 'D1 (SQLite)', 'Drizzle', 'Miniflare'],
    links: [{ label: 'Source', href: 'https://github.com/sugianand/movie-in-three-clues' }],
    tone: 'cream',
    role: 'Solo: game design, backend, frontend, testing',
    status: 'Complete, playable locally and deployable',
    problem: 'A party game falls apart if players see different clocks, peek at each other\'s answers, or lose their seat on a refresh. All of that has to hold without a dedicated game server.',
    overview: 'Players join with a six-character code. Each round reveals up to three clues about a movie, and earlier guesses score more: 300, 200, or 100 points. The Worker owns the clock, scoring, and answer checking; clients poll room snapshots and render. Room state lives in D1 with optimistic, versioned writes, so concurrent guesses never clobber each other.',
    why: 'Most movie trivia sticks to one film industry. I wanted a game where Indian and American cinema fans could compete in the same room. It was also a chance to solve real multiplayer problems: shared time, hidden state, and players who drop and reconnect.',
    built: [
      'The game engine: rounds, clue timing, scoring, team balancing, and host handoff',
      'The Worker API with D1 persistence and optimistic, versioned room writes',
      'Typo-tolerant answer matching that still rejects the wrong sequel',
      'A curated 200-film playable deck, plus 1,000 sourced records with a source URL for every entry',
      'Unit tests plus integration tests against the compiled Worker in Miniflare',
    ],
    metrics: [
      { value: '2–8', label: 'players per room' },
      { value: '800 ms', label: 'client sync interval' },
      { value: '200', label: 'curated films in play' },
      { value: '11', label: 'test files' },
    ],
    architecture: {
      nodes: [
        { id: 'client', label: 'React client', tech: 'TypeScript', tier: 0, detail: 'Renders the lobby, clue cards, timer, and standings. It never decides the outcome; it shows the latest server snapshot.' },
        { id: 'poll', label: 'Snapshot sync', tech: 'poll every 800 ms', tier: 1, detail: 'Clients fetch versioned room snapshots. Ordering checks stop a slow, stale response from hiding a newly revealed clue.' },
        { id: 'worker', label: 'Game Worker', tech: 'Cloudflare Workers', tier: 2, detail: 'Owns the clock, clue reveals, scoring, guess validation, and host permissions, so no client can cheat or drift.' },
        { id: 'd1', label: 'Room state', tech: 'D1 (SQLite)', tier: 3, detail: 'Rooms, players, guesses, and history. Writes carry a version number and fail on conflict, so concurrent guesses are safe.' },
        { id: 'deck', label: 'Movie deck', tech: '200 active films', tier: 3, detail: 'Story, cast, director, and character clues. Decks avoid repeats across games until the pool is exhausted.' },
      ],
      edges: [['client', 'poll'], ['poll', 'worker', 'snapshot'], ['worker', 'd1', 'versioned writes'], ['worker', 'deck']],
    },
    hardest: 'Consistency without WebSockets. Two players can guess in the same instant while a clue timer fires. Versioned writes that fail on conflict, a server-owned clock, and snapshot ordering on the client keep every screen in agreement, and the integration tests replay full five-round games against the compiled Worker to prove it.',
    features: [
      '2 to 8 players with room codes, invite links, and individual or team modes',
      'Easy, Normal, and Hard timers with server-controlled clue timing',
      'Answers and other players\' scores stay hidden until the reveal',
      'Reconnects on refresh, and host handoff when the host leaves',
      'Indian and American collections, filterable by era',
    ],
    challenges: [
      'Fuzzy matching that forgives "Interstelar" but not "Toy Story 2" for "Toy Story".',
      'Equal-team enforcement and team selection permissions across joins and replays.',
      'Rotating 40 games through one room before any title repeats.',
    ],
  },
  {
    id: 'portfolio',
    title: 'This Portfolio',
    year: '2026',
    kind: 'Frontend / Graphics / AI',
    categories: ['AI', 'Full Stack'],
    featured: true,
    tagline: 'The site you are on is a project too.',
    body: 'Hand-written WebGL and Canvas, a working terminal, and a game, on React with no other runtime dependencies.',
    stack: ['React 19', 'TypeScript', 'WebGL (GLSL)', 'Canvas 2D', 'Vite', 'GitHub Actions'],
    links: [{ label: 'Source', href: 'https://github.com/sugianand/portfolio' }],
    tone: 'ink',
    role: 'Solo',
    status: 'Live and continuously deployed',
    problem: 'A portfolio has a few seconds to prove its owner can build. A template proves nothing.',
    overview: 'Everything visual is drawn by hand. A GLSL fragment shader renders the topographic background, and the hero name is a particle simulation sampled from rendered text. Each push builds and deploys through GitHub Actions, and the footer shows the exact commit that is live.',
    why: 'If I say I can build polished, fast, accessible software, the site that says it should be the proof.',
    built: [
      'A fragment shader with domain-warped noise and pointer interaction, paused when hidden',
      'A fixed-timestep particle system so the name forms equally fast on slow devices',
      'A terminal with tab completion and history, a canvas game, and an achievements system',
      'Lazy-loaded chunks, reduced-motion support, and zero axe accessibility violations',
    ],
    metrics: [
      { value: '0', label: 'runtime deps besides React' },
      { value: '0', label: 'axe accessibility violations' },
      { value: '<100 KB', label: 'initial JavaScript (gzip)' },
    ],
    architecture: {
      nodes: [
        { id: 'data', label: 'data.ts', tech: 'single source of truth', tier: 0, detail: 'Projects, roles, skills, and facts. The UI and the terminal both read from it.' },
        { id: 'react', label: 'React UI', tech: 'React 19 + TS', tier: 1, detail: 'Sections, case studies, and overlays. Heavy parts (terminal, game, case studies) load as separate chunks on demand.' },
        { id: 'gl', label: 'Render layer', tech: 'WebGL + Canvas 2D', tier: 1, detail: 'A GLSL terrain shader and a particle system, both driven by requestAnimationFrame and paused when not visible.' },
        { id: 'ci', label: 'CI/CD', tech: 'GitHub Actions → Pages', tier: 2, detail: 'Every push to main is linted, built, and deployed. The build injects the commit hash and count shown in the footer.' },
      ],
      edges: [['data', 'react'], ['react', 'gl'], ['react', 'ci', 'push']],
    },
    hardest: 'Keeping it fast while it does a lot. The shader renders at half resolution and pauses in hidden tabs, the particle physics runs on a fixed timestep instead of per-frame, and everything below the fold is code-split, so the first paint stays cheap even on phones.',
    features: [
      'WebGL terrain that bends around the pointer and follows the theme color',
      'Particle-text name that scatters and reforms',
      'Terminal, arcade, ⌘K palette, and achievements',
      'Case studies with interactive architecture diagrams',
    ],
    challenges: [
      'Frame-rate-independent animation so slow devices see the same experience.',
      'Two layers: a 60-second path for recruiters, and depth for engineers.',
    ],
  },
  {
    id: '11planner',
    title: '11Planner',
    year: '2026',
    kind: 'Team Build / Scheduling',
    categories: ['Full Stack', 'AI'],
    tagline: 'Stop scrambling at 11:59.',
    body: 'A study planner that turns courses and deadlines into a weekly schedule, with syllabus PDF parsing and LLM-assisted time estimates. Built by a three-person team.',
    stack: ['Next.js', 'React', 'FastAPI', 'Python', 'Supabase', 'OpenAI API'],
    links: [{ label: 'Source', href: 'https://github.com/sugianand/11planner' }],
    tone: 'green',
    role: 'Team project (three contributors)',
    status: 'Complete; the hosted demo is currently offline',
    problem: 'Students know what is due but not when to work on it, so everything happens the night before.',
    overview: 'Students add courses (or drop in a syllabus PDF) and tasks with deadlines. A FastAPI backend estimates hours per task, ranks work by urgency, and generates study blocks that avoid class times and respect a daily cap. A Chrome extension imports Canvas assignments.',
    why: 'We were tired of the same cycle: knowing a project was due, not knowing when to work on it, and doing it the night before. Most students aren\'t bad at school, they\'re bad at planning, so we built something that does the planning for them.',
    architecture: {
      nodes: [
        { id: 'next', label: 'Next.js app', tech: 'React + TS', tier: 0, detail: 'Dashboard, tasks, courses, and four calendar views, plus a focus mode with a Pomodoro timer.' },
        { id: 'ext', label: 'Canvas extension', tech: 'Chrome MV3', tier: 0, detail: 'Reads assignments from Canvas and imports them as tasks.' },
        { id: 'api', label: 'FastAPI', tech: 'Python', tier: 1, detail: 'Hosts the schedule generator, the syllabus parser, and the task estimator.' },
        { id: 'est', label: 'Task estimator', tech: 'OpenAI + heuristic', tier: 2, detail: 'Asks an LLM for an hour estimate, caches it by task signature, and falls back to a deterministic heuristic when the model is unavailable.' },
        { id: 'sched', label: 'Schedule generator', tech: 'urgency scoring', tier: 2, detail: 'Ranks tasks by deadline versus effort and fills the week with blocks around classes and daily limits. Covered by unit tests.' },
        { id: 'db', label: 'Supabase', tech: 'PostgreSQL + auth', tier: 3, detail: 'Users, courses, tasks, preferences, and generated blocks.' },
      ],
      edges: [['next', 'api'], ['ext', 'api', 'assignments'], ['api', 'est'], ['api', 'sched'], ['sched', 'db'], ['next', 'db']],
    },
    features: [
      'Schedule generator that ranks tasks by urgency, meaning deadline versus effort',
      'Syllabus PDF upload that auto-fills course details',
      'LLM time estimates with caching and a heuristic fallback',
      'Day, Week, Month, and Year calendar views',
      'Chrome extension that imports Canvas assignments',
    ],
    challenges: [
      'Turning fuzzy preferences (steady vs. crunch, morning vs. night) into scheduling constraints.',
      'Keeping LLM estimates stable and the app usable when the model is unavailable.',
    ],
  },
  {
    id: 'home-cleaning',
    title: 'Home Cleaning Platform',
    year: '2025',
    kind: 'Full Stack / CSC 4710',
    categories: ['Full Stack', 'Backend'],
    tagline: 'A real backend behind a real service.',
    body: 'A full-stack service platform with a split frontend and backend: Express 5 and MySQL with file uploads, deployed independently.',
    stack: ['JavaScript', 'Express 5', 'MySQL', 'Multer', 'Vercel'],
    links: [
      { label: 'Live', href: 'https://csc4710-home-cleaning.vercel.app' },
      { label: 'Backend', href: 'https://github.com/sugianand/csc4710-homeCleaning-backend' },
    ],
    tone: 'blue',
    role: 'Course project (CSC 4710)',
    status: 'Complete and deployed',
    problem: 'A course database project usually ends at queries in a terminal. This one had to serve real user flows.',
    overview: 'A web platform for a home-cleaning service. A JavaScript frontend talks to an Express 5 REST API backed by MySQL, with file uploads through Multer. The frontend and backend deploy separately on Vercel.',
    why: 'I wanted the course project to feel like a real product, not a checklist. Wrapping the database in a real API and UI meant designing tables around actual user flows and dealing with the parts toy projects skip: CORS, environment config, and uploads.',
    architecture: {
      nodes: [
        { id: 'fe', label: 'Frontend', tech: 'JavaScript · Vercel', tier: 0, detail: 'The customer-facing site, deployed on its own.' },
        { id: 'api', label: 'REST API', tech: 'Express 5 · Vercel', tier: 1, detail: 'Routes for the service\'s data, CORS configured for the separate frontend origin, and env-based config.' },
        { id: 'up', label: 'Uploads', tech: 'Multer', tier: 2, detail: 'Handles multipart file uploads on the API.' },
        { id: 'db', label: 'Database', tech: 'MySQL', tier: 2, detail: 'A relational schema designed around the service\'s workflows.' },
      ],
      edges: [['fe', 'api', 'HTTPS + CORS'], ['api', 'up'], ['api', 'db', 'mysql2']],
    },
    features: ['REST API on Express 5 with a MySQL data layer', 'File uploads through Multer', 'Separate frontend and backend deployments'],
    challenges: ['A split deployment: CORS, environment variables, and a database reachable from serverless functions.'],
  },
  {
    id: 'frantic-run',
    title: 'The Frantic Run',
    year: '2024',
    kind: 'Game / JavaScript',
    categories: ['Games'],
    tagline: 'Fast loops. Real feel.',
    body: 'A browser endless runner on a hand-written game loop: movement physics, collision detection, scoring, and steady frame rates.',
    stack: ['JavaScript', 'HTML Canvas', 'SCSS'],
    links: [
      { label: 'Play the remake', href: '#arcade' },
      { label: 'Source', href: 'https://github.com/sugianand/Frantic_Run' },
    ],
    tone: 'blue',
    role: 'Solo',
    status: 'Complete; a remake is playable on this site',
    problem: 'Game feel lives in milliseconds: a stuttering loop or a hitbox off by a few pixels ruins it.',
    overview: 'Dodge obstacles, survive as the speed climbs, and chase a high score. Everything runs on a hand-written loop with no engine: physics, collisions, scoring, and rendering.',
    why: 'Games are the fastest way to feel whether your code is good. If the loop stutters or a collision is off by a few pixels, you notice right away. I wanted to understand what an engine does by writing one myself.',
    features: ['Responsive jump and movement physics', 'Collision detection with forgiving hitboxes', 'Difficulty that ramps with speed', 'An optimized animation loop'],
    challenges: ['Steady frame rates on slower machines by cutting per-frame allocation.', 'Tuning jump arcs, hitbox padding, and spawn pacing so a loss feels fair.'],
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
