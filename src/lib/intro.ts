type IntroContext = { reducedMotion: boolean; seen: boolean; hash: string }

/**
 * Whether the title card should play. It's skipped for reduced motion, once per session,
 * and on deep links (#recruiter, #project/<id>, #section) so a shared URL opens straight to its content.
 */
export const shouldPlayIntro = ({ reducedMotion, seen, hash }: IntroContext) =>
  !reducedMotion && !seen && hash.replace(/^#/, '') === ''
