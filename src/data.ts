export const profile = {
  name: 'Suganeshwara Anand',
  short: 'SA',
  role: 'Software + AI',
  location: 'Detroit, MI',
  timezone: 'America/Detroit',
  email: 'sugianand89@gmail.com',
  github: 'https://github.com/sugianand',
  linkedin: 'https://www.linkedin.com/in/suganeshwara-anand-b86367219/',
  resume: '/resume.pdf',
  source: 'https://github.com/sugianand/sugianand.github.io',
}

export type Project = {
  id: string
  title: string
  year: string
  kind: string
  tagline: string
  body: string
  stack: string[]
  links: { label: string; href: string }[]
  tone: 'orange' | 'cream' | 'green' | 'ink' | 'blue'
}

export const projects: Project[] = [
  {
    id: 'cinedna',
    title: 'CineDNA',
    year: '2026',
    kind: 'AI / Recommendation',
    tagline: 'Movies by how they feel, not by genre.',
    body: 'A movie discovery engine built on hand-curated "Movie DNA" profiles. Describe a vibe in plain language and it matches films on mood, pacing, and texture. One Docker container serves the React site and FastAPI API.',
    stack: ['Python', 'FastAPI', 'React', 'Docker'],
    links: [{ label: 'Source', href: 'https://github.com/sugianand/CineDNA' }],
    tone: 'orange',
  },
  {
    id: 'three-clues',
    title: 'Movie in Three Clues',
    year: '2026',
    kind: 'Multiplayer / Realtime',
    tagline: 'A party game with a shared clock.',
    body: 'A real-time guessing game for 2 to 8 players, with room codes, teams, server-synced timers, hidden answers, and five-round scoring. It ships with Indian and American movie collections.',
    stack: ['TypeScript', 'Realtime', 'SQL'],
    links: [{ label: 'Source', href: 'https://github.com/sugianand/movie-in-three-clues' }],
    tone: 'cream',
  },
  {
    id: '11planner',
    title: '11Planner',
    year: '2026',
    kind: 'Team Build / Scheduling',
    tagline: 'Stop scrambling at 11:59.',
    body: 'You enter your courses and tasks, and it decides when you should work on each one, splits the work into chunks, and builds a schedule around the rest of your life. Built as a team.',
    stack: ['Next.js', 'FastAPI', 'Supabase', 'TypeScript'],
    links: [
      { label: 'Live', href: 'https://11planner.vercel.app' },
      { label: 'Source', href: 'https://github.com/sugianand/11planner' },
    ],
    tone: 'green',
  },
  {
    id: 'home-cleaning',
    title: 'Home Cleaning Platform',
    year: '2025',
    kind: 'Full Stack / CSC 4710',
    tagline: 'A real backend behind a real service.',
    body: 'A full-stack service platform with a split frontend and backend. The backend runs on Express 5 and MySQL with file uploads, and both halves are deployed independently.',
    stack: ['Express', 'MySQL', 'JavaScript', 'Vercel'],
    links: [
      { label: 'Live', href: 'https://csc4710-home-cleaning.vercel.app' },
      { label: 'Backend', href: 'https://github.com/sugianand/csc4710-homeCleaning-backend' },
    ],
    tone: 'ink',
  },
  {
    id: 'frantic-run',
    title: 'The Frantic Run',
    year: '2024',
    kind: 'Game / JavaScript',
    tagline: 'Fast loops. Real feel.',
    body: 'An endless runner with movement, collision detection, and scoring, plus tuned animation loops that hold a steady frame rate on any device. A remake is playable in the arcade below.',
    stack: ['JavaScript', 'Canvas', 'Game Loop'],
    links: [
      { label: 'Play it', href: '#arcade' },
      { label: 'Source', href: 'https://github.com/sugianand/Frantic_Run' },
    ],
    tone: 'blue',
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
