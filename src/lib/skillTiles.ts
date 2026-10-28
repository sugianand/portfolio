// Two-letter symbols for skills without a brand logo (concepts, and marks Simple Icons doesn't carry).
const SYMBOLS: Record<string, string> = {
  Python: 'Py', TypeScript: 'Ts', JavaScript: 'Js', Java: 'Ja', 'C#': 'C#', 'C++': 'C+', SQL: 'Sq',
  'Computer vision (CLIP)': 'Cl', 'Recommendation & ranking': 'Rk', 'Rule-based NLU': 'Nl', 'Information retrieval (BM25)': 'Ir', 'LLM APIs': 'Ll',
  PyTorch: 'Pt', TensorFlow: 'Tf', NumPy: 'Np', MATLAB: 'Ml',
  FastAPI: 'Fa', 'Django / DRF': 'Dj', Express: 'Ex', 'Cloudflare Workers': 'Cf', 'REST API design': 'Ra',
  React: 'Re', 'Next.js': 'Nx', Blazor: 'Bz', 'WebGL / GLSL': 'Gl', Canvas: 'Cv',
  'PostgreSQL (Supabase)': 'Pg', MySQL: 'My', 'SQLite (D1)': 'Sl',
  Docker: 'Dk', 'GitHub Actions': 'Ga', Vercel: 'Vc', Render: 'Rn', Git: 'Gt', Linux: 'Lx', Jira: 'Ji',
  'Regression & root-cause analysis': 'Rc', 'Unit & integration tests': 'Ut', Miniflare: 'Mf',
}

/** Tile labels for skills whose full name would be cut off; the full name stays for screen readers. */
export const SHORT: Record<string, string> = {
  'Computer vision (CLIP)': 'Vision', 'Recommendation & ranking': 'Ranking', 'Information retrieval (BM25)': 'Retrieval', 'Rule-based NLU': 'NLU',
  'REST API design': 'REST APIs', 'PostgreSQL (Supabase)': 'Postgres', 'SQLite (D1)': 'SQLite',
  'Regression & root-cause analysis': 'Root cause', 'Unit & integration tests': 'Testing', 'Cloudflare Workers': 'Workers',
  'GitHub Actions': 'Actions', 'WebGL / GLSL': 'WebGL', 'Django / DRF': 'Django',
}

/** The longest label that fits a tile without an ellipsis at the narrowest tile width. */
export const TILE_NAME_MAX = 10

export const tileName = (name: string) => SHORT[name] ?? name
export const tileSymbol = (name: string) => SYMBOLS[name] ?? name.slice(0, 2)
