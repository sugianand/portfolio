// The portfolio case study claims "<100 KB initial JavaScript (gzip)". These helpers let the
// build check that claim against the real output instead of trusting it.

/** The JavaScript a first visit downloads: the entry module plus anything it modulepreloads. */
export const initialScripts = (html: string) => {
  const entry = [...html.matchAll(/<script\b[^>]*type="module"[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1])
  const preloads = [...html.matchAll(/<link\b[^>]*rel="modulepreload"[^>]*\bhref="([^"]+)"/g)].map((m) => m[1])
  return [...new Set([...entry, ...preloads])]
}

/** Parses a metric like "<100 KB" into a byte limit (kB as Vite reports them: 1000 bytes). */
export const budgetBytes = (value: string) => {
  const match = /^<\s*(\d+(?:\.\d+)?)\s*KB$/i.exec(value.trim())
  if (!match) throw new Error(`Not a size budget: "${value}"`)
  return Number(match[1]) * 1000
}
