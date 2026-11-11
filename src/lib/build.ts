export type Build = { hash: string; count: number; message: string; date: string }

// A shallow clone (Vercel's, or a CI checkout without full history) counts only the
// fetched commits, so a count of 0 means "unknown" and the footer leaves it out.
export function commitCount(revListCount: string, shallow: string) {
  const n = Number(revListCount)
  return shallow === 'true' || !Number.isInteger(n) || n < 1 ? 0 : n
}

export function buildLabel(build: Build, date: string) {
  return ['build ' + build.hash, build.count > 0 ? `commit #${build.count}` : '', date].filter(Boolean).join(' · ')
}
