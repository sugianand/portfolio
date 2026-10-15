type IntroContext = { enabled: boolean; forced: boolean; reducedMotion: boolean; seen: boolean; hash: string }

/**
 * Whether the title card should play. `forced` (the `?intro` URL param) always plays it, for testing.
 * Otherwise it needs a build that enables it, and it's skipped for reduced motion, once per session,
 * and on deep links (#recruiter, #project/<id>, #section) so a shared URL opens straight to its content.
 */
export const shouldPlayIntro = ({ enabled, forced, reducedMotion, seen, hash }: IntroContext) =>
  forced || (enabled && !reducedMotion && !seen && hash.replace(/^#/, '') === '')
