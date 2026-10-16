// Runs after `npm run build` (postbuild): fails the build, and so the deploy, if the initial
// JavaScript outgrows the size the site claims for itself in src/data.ts.
import { readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { projects } from '../src/data.ts'
import { budgetBytes, initialScripts } from './budget.ts'

const LABEL = 'initial JavaScript (gzip)'
const metric = projects.flatMap((p) => p.metrics ?? []).find((m) => m.label === LABEL)
if (!metric) throw new Error(`No "${LABEL}" metric in src/data.ts`)

const dist = new URL('../dist/', import.meta.url)
const scripts = initialScripts(readFileSync(new URL('index.html', dist), 'utf8'))
if (!scripts.length) throw new Error('No entry script found in dist/index.html')

const size = scripts.reduce((sum, src) => sum + gzipSync(readFileSync(new URL(src, dist))).length, 0)
const limit = budgetBytes(metric.value)
const kb = (n: number) => `${(n / 1000).toFixed(1)} kB`

if (size >= limit) {
  console.error(`✗ Initial JavaScript is ${kb(size)} gzip, over the "${metric.value}" the site claims. Trim it or update the metric.`)
  process.exit(1)
}
console.log(`✓ Initial JavaScript ${kb(size)} gzip, within the "${metric.value}" claim (${scripts.length} file${scripts.length > 1 ? 's' : ''}).`)
