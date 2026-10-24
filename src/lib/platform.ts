/** The palette's modifier key as the visitor's keyboard labels it: ⌘ on Apple devices, Ctrl elsewhere. */
export function modKey(platform: string): '⌘' | 'Ctrl' {
  return /mac|iphone|ipad|ipod/i.test(platform) ? '⌘' : 'Ctrl'
}

type NavigatorUAData = { userAgentData?: { platform?: string } }

export const MOD = typeof navigator === 'undefined'
  ? '⌘'
  : modKey((navigator as Navigator & NavigatorUAData).userAgentData?.platform || navigator.platform || navigator.userAgent)
