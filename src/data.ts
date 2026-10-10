export const profile = {
  name: 'Suganeshwara Anand',
  short: 'SA',
  role: 'Software + AI',
  location: 'Detroit, MI',
  timezone: 'America/Detroit',
  email: 'sugianand89@gmail.com',
  github: 'https://github.com/sugianand',
  linkedin: 'https://www.linkedin.com/in/suganeshwara-anand-b86367219/',
  resume: `${import.meta.env?.BASE_URL ?? "./"}resume.pdf`,
  source: 'https://github.com/sugianand/portfolio',
  headline: 'Software Engineer + AI Builder',
  targets: ['AI Engineer', 'ML Engineer', 'Software Engineer', 'Backend', 'Full-Stack'],
  availability: 'New grad roles, internships, and co-ops',
  education: [
    { degree: 'M.S. Artificial Intelligence', school: 'Wayne State University', when: 'In progress' },
    { degree: 'B.S. Computer Science, minor in Mathematics', school: 'Wayne State University', when: 'Completed' },
  ],
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
    body: 'Describe a vibe in plain language; CineDNA ranks films across 14 weighted "DNA" dimensions.',
    stack: ['Python', 'FastAPI', 'React', 'Vite', 'TMDB API', 'Docker', 'GitHub Actions'],
    links: [{ label: 'Source', href: 'https://github.com/sugianand/CineDNA' }],
    tone: 'orange',
    role: 'Solo: design, backend, ranking engine, frontend, deployment',
    status: 'Working prototype, actively developed',
    problem: 'Genre filters can\'t express "slow-burn, a little dark, no romance."',
    overview: 'CineDNA turns a sentence into a target profile across 14 dimensions, then ranks films by weighted distance to it. It handles negation, themes, and reference titles like "like Interstellar."',
    why: 'Two "thrillers" can feel nothing alike. I wanted to search by feel, and to build a ranking pipeline end to end.',
    built: [
      'Intent parser: 14 dimensions, negation, reference titles',
      'Weighted-RMSE ranking blended with theme matching',
      'TMDB client that infers DNA for live titles',
      'FastAPI service, React UI, Docker, CI',
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
    hardest: 'Compound requests. "Dark, without romance, like Interstellar" needs negation, excluded themes, and a seed film resolved before ranking, without one exclusion zeroing out every result.',
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
    body: 'Real-time movie guessing for 2–8 players on Cloudflare Workers and D1.',
    stack: ['TypeScript', 'React', 'Cloudflare Workers', 'D1 (SQLite)', 'Drizzle', 'Miniflare'],
    links: [{ label: 'Source', href: 'https://github.com/sugianand/movie-in-three-clues' }],
    tone: 'cream',
    role: 'Solo: game design, backend, frontend, testing',
    status: 'Complete, playable locally and deployable',
    problem: 'Multiplayer breaks when clocks drift, answers leak, or a refresh drops a player.',
    overview: 'Up to three clues per round; earlier guesses score more. The server owns the clock and scoring, and versioned writes keep concurrent guesses safe.',
    why: 'Most movie trivia covers one film industry. I wanted Indian and American cinema fans in the same room.',
    built: [
      'Game engine: rounds, timing, scoring, teams',
      'Worker API with versioned D1 writes',
      'Typo-tolerant matching that rejects wrong sequels',
      'Unit and Miniflare integration tests',
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
    hardest: 'Consistency without WebSockets. Versioned writes, a server-owned clock, and snapshot ordering keep every screen in sync, and integration tests replay full games to prove it.',
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
    body: 'Hand-written WebGL, a live CineDNA demo, and an in-browser retrieval assistant.',
    stack: ['React 19', 'TypeScript', 'WebGL (GLSL)', 'Canvas 2D', 'Vite', 'GitHub Actions'],
    links: [{ label: 'Source', href: 'https://github.com/sugianand/portfolio' }],
    tone: 'ink',
    role: 'Solo',
    status: 'Live and continuously deployed',
    problem: 'A portfolio has seconds to prove its owner can build.',
    overview: 'A GLSL shader draws the background, the name is a particle simulation, and the assistant runs BM25 retrieval over this site\'s own data. Every push deploys through CI.',
    why: 'If I claim I build polished, fast software, the site saying it should prove it.',
    built: [
      'GLSL terrain shader with pointer interaction',
      'Fixed-timestep particle name',
      'BM25 assistant with citations and tests',
      'Code-split, accessible, reduced-motion aware',
    ],
    metrics: [
      { value: '0', label: 'runtime deps besides React' },
      { value: '0', label: 'axe accessibility violations' },
      { value: '<100 KB', label: 'initial JavaScript (gzip)' },
    ],
    architecture: {
      nodes: [
        { id: 'data', label: 'data.ts', tech: 'single source of truth', tier: 0, detail: 'Projects, roles, skills, and facts. The UI, the recruiter view, and the assistant all read from it.' },
        { id: 'react', label: 'React UI', tech: 'React 19 + TS', tier: 1, detail: 'Sections, case studies, and overlays. Heavy parts (case studies, previews, the assistant) load as separate chunks on demand.' },
        { id: 'gl', label: 'Render layer', tech: 'WebGL + Canvas 2D', tier: 1, detail: 'A GLSL terrain shader and a particle system, both driven by requestAnimationFrame and paused when not visible.' },
        { id: 'rag', label: 'Assistant', tech: 'BM25 in the browser', tier: 2, detail: 'Chunks the site data into passages, builds an inverted index, ranks passages with BM25 plus an intent-aware rerank, and quotes the best sentences with citations. No server, no API key, and it refuses questions the data cannot answer.' },
        { id: 'ci', label: 'CI/CD', tech: 'GitHub Actions → Pages', tier: 2, detail: 'Every push to main is linted, built, and deployed. The build injects the commit hash and count shown in the footer.' },
      ],
      edges: [['data', 'react'], ['data', 'rag', 'indexed'], ['react', 'gl'], ['react', 'ci', 'push']],
    },
    hardest: 'Doing a lot while staying fast: a half-resolution shader that pauses when hidden, fixed-timestep physics, and code-splitting for everything below the fold.',
    features: [
      'WebGL terrain that bends around the pointer and follows the theme color',
      'Particle-text name that scatters and reforms',
      'Retrieval assistant, recruiter view, ⌘K palette, and achievements',
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
    body: 'A team-built study planner that turns deadlines into a weekly schedule.',
    stack: ['Next.js', 'React', 'FastAPI', 'Python', 'Supabase', 'OpenAI API'],
    links: [
      { label: 'Live', href: 'https://my11planner.vercel.app' },
      { label: 'Source', href: 'https://github.com/sugianand/11planner' },
    ],
    tone: 'green',
    role: 'Team project (three contributors)',
    status: 'Live at my11planner.vercel.app',
    problem: 'Students know what\'s due but not when to work on it.',
    overview: 'Courses and tasks go in, or a syllabus PDF; a FastAPI backend estimates hours, ranks by urgency, and schedules study blocks around classes.',
    why: 'We were tired of doing everything the night before, so we built something that plans for you.',
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
    body: 'A split frontend and Express + MySQL backend, deployed independently.',
    stack: ['JavaScript', 'Express 5', 'MySQL', 'Multer', 'Vercel'],
    links: [
      { label: 'Live', href: 'https://csc4710-home-cleaning.vercel.app' },
      { label: 'Backend', href: 'https://github.com/sugianand/csc4710-homeCleaning-backend' },
    ],
    tone: 'blue',
    role: 'Course project (CSC 4710)',
    status: 'Complete and deployed',
    problem: 'Course database projects usually stop at queries in a terminal.',
    overview: 'A service platform with an Express 5 REST API, MySQL, and file uploads, with frontend and backend deployed separately on Vercel.',
    why: 'I wanted the course project to behave like a real product, CORS and uploads included.',
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
    body: 'An endless runner on a hand-written game loop.',
    stack: ['JavaScript', 'HTML Canvas', 'SCSS'],
    links: [
      { label: 'Source', href: 'https://github.com/sugianand/Frantic_Run' },
    ],
    tone: 'blue',
    role: 'Solo',
    status: 'Complete',
    problem: 'Game feel lives in milliseconds.',
    overview: 'Dodge obstacles as speed climbs. Physics, collisions, scoring, and rendering all run on my own loop, no engine.',
    why: 'Writing the loop myself was the fastest way to learn what an engine actually does.',
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

/** Where a skill shows up. Keys are project ids or the role keys below. */
export const evidenceLabels: Record<string, string> = {
  neverending: 'NeverEnding (internship)',
  ati: 'Accurate Technologies (internship)',
  cit: 'WSU C&IT portal',
  rocket: 'Rocket Companies (teaching)',
  chatui: 'Simple Chat UI (resume project)',
}

export type SkillGroup = { key: string; label: string; items: { name: string; evidence?: string[] }[] }

// Evidence lists only places the skill is verifiably used: project repos on
// this site or roles on the resume. Skills without public evidence carry none.
export const skillGroups: SkillGroup[] = [
  { key: 'languages', label: 'Languages', items: [
    { name: 'Python', evidence: ['cinedna', '11planner', 'neverending'] },
    { name: 'TypeScript', evidence: ['three-clues', 'portfolio'] },
    { name: 'JavaScript', evidence: ['home-cleaning', 'frantic-run', 'rocket'] },
    { name: 'Java', evidence: ['neverending'] },
    { name: 'C#', evidence: ['cit'] },
    { name: 'C++', evidence: ['chatui'] },
    { name: 'SQL', evidence: ['home-cleaning', 'three-clues', '11planner'] },
  ] },
  { key: 'ai_ml', label: 'AI / ML', items: [
    { name: 'Recommendation & ranking', evidence: ['cinedna'] },
    { name: 'Rule-based NLU', evidence: ['cinedna'] },
    { name: 'Information retrieval (BM25)', evidence: ['portfolio'] },
    { name: 'LLM APIs', evidence: ['11planner'] },
    { name: 'PyTorch' },
    { name: 'TensorFlow' },
    { name: 'NumPy' },
    { name: 'MATLAB', evidence: ['chatui'] },
  ] },
  { key: 'backend', label: 'Backend', items: [
    { name: 'FastAPI', evidence: ['cinedna', '11planner'] },
    { name: 'Django / DRF', evidence: ['neverending'] },
    { name: 'Express', evidence: ['home-cleaning'] },
    { name: 'Cloudflare Workers', evidence: ['three-clues'] },
    { name: 'REST API design', evidence: ['cinedna', 'home-cleaning', 'neverending'] },
  ] },
  { key: 'frontend', label: 'Frontend', items: [
    { name: 'React', evidence: ['cinedna', 'three-clues', 'portfolio', 'neverending'] },
    { name: 'Next.js', evidence: ['11planner'] },
    { name: 'Blazor', evidence: ['cit'] },
    { name: 'WebGL / GLSL', evidence: ['portfolio'] },
    { name: 'Canvas', evidence: ['portfolio', 'frantic-run'] },
  ] },
  { key: 'data', label: 'Databases', items: [
    { name: 'PostgreSQL (Supabase)', evidence: ['11planner'] },
    { name: 'MySQL', evidence: ['home-cleaning'] },
    { name: 'SQLite (D1)', evidence: ['three-clues'] },
  ] },
  { key: 'infra', label: 'Infra & tools', items: [
    { name: 'Docker', evidence: ['cinedna'] },
    { name: 'GitHub Actions', evidence: ['cinedna', 'portfolio'] },
    { name: 'Vercel', evidence: ['home-cleaning', '11planner'] },
    { name: 'Render', evidence: ['cinedna'] },
    { name: 'Git' },
    { name: 'Linux' },
    { name: 'Jira', evidence: ['neverending'] },
  ] },
  { key: 'testing', label: 'Testing & QA', items: [
    { name: 'Regression & root-cause analysis', evidence: ['ati'] },
    { name: 'Unit & integration tests', evidence: ['three-clues', 'cinedna', 'portfolio'] },
    { name: 'Miniflare', evidence: ['three-clues'] },
  ] },
]

/** Flat view of skill names by group. */
export const skills: Record<string, string[]> = Object.fromEntries(skillGroups.map((g) => [g.key, g.items.map((i) => i.name)]))

export const stats = [
  { value: 30, suffix: '+', label: 'Defects resolved at ATI' },
  { value: 500, suffix: '+', label: 'Devices imaged at C&IT' },
  { value: 6, suffix: '', label: 'Roles since 2023' },
  { value: 3.97, suffix: '', label: 'GPA', decimals: 2 },
]
