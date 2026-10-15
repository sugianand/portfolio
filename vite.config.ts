import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { defineConfig } from 'vite'

const git = (command: string, fallback: string) => {
  try {
    return execSync(`git ${command}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || fallback
  } catch {
    return fallback
  }
}

const build = {
  hash: git('rev-parse --short HEAD', 'dev'),
  count: Number(git('rev-list --count HEAD', '0')),
  message: git('log -1 --format=%s', 'local build'),
  date: new Date().toISOString(),
}

// The title card is still in testing: it's on in dev and Vercel previews, off in production
// builds (GitHub Pages runs on Actions; Vercel sets VERCEL_ENV). `?intro` plays it anywhere.
const intro = process.env.VERCEL_ENV !== 'production' && process.env.GITHUB_ACTIONS !== 'true'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works on a custom domain and on a /repo/ subpath.
  base: './',
  plugins: [react()],
  define: {
    __BUILD__: JSON.stringify(build),
    __INTRO__: JSON.stringify(intro),
  },
})
