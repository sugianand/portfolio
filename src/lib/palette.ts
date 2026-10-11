// Accent colors for each theme. Kept free of DOM code so tests can check contrast.

export const accents = {
  orange: '#fa6945',
  green: '#8ee19c',
  blue: '#7aa7ff',
  pink: '#ff6bcb',
  yellow: '#f5d547',
} as const

export type AccentName = keyof typeof accents

// Darker twins of each accent that keep 4.5:1 contrast on the light theme's paper.
export const lightAccents: Record<AccentName, string> = {
  orange: '#b23c1c',
  green: '#1d6b2c',
  blue: '#2a56b0',
  pink: '#a8287f',
  yellow: '#7a5a00',
}

export type Theme = 'dark' | 'light'

export const accentHex = (accent: AccentName, theme: Theme) => (theme === 'light' ? lightAccents : accents)[accent]
