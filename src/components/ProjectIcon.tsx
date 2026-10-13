import type { ReactNode } from 'react'

// Hand-drawn marks that stand in for each project's logo. They are symbols of
// what the project does, not official logos.
const ICONS: Record<string, ReactNode> = {
  // A double helix: movie "DNA".
  cinedna: (
    <>
      <path d="M7 2.5c0 4.6 10 4.9 10 9.5s-10 4.9-10 9.5" />
      <path d="M17 2.5c0 4.6-10 4.9-10 9.5s10 4.9 10 9.5" />
      <path d="M9 5.2h6M10 8.3h4M10 15.7h4M9 18.8h6" />
    </>
  ),
  // Three fanned clue cards, the front one asking the question.
  'three-clues': (
    <>
      <rect x="3.5" y="5" width="9" height="13" rx="1.6" transform="rotate(-14 8 11.5)" />
      <rect x="7.5" y="4" width="9" height="13" rx="1.6" transform="rotate(-2 12 10.5)" />
      <rect x="11.5" y="5.5" width="9" height="13" rx="1.6" transform="rotate(12 16 12)" />
      <path d="M14.6 10.2a1.6 1.6 0 1 1 2.2 1.5c-.5.2-.8.6-.8 1.1v.4M16 15.4h.01" transform="rotate(12 16 12)" />
    </>
  ),
  // Topographic contour rings, like this site's background.
  portfolio: (
    <>
      <ellipse cx="12" cy="12" rx="9.5" ry="6.5" transform="rotate(-20 12 12)" />
      <ellipse cx="12.4" cy="11.8" rx="6.2" ry="4" transform="rotate(-20 12 12)" />
      <ellipse cx="12.8" cy="11.6" rx="2.6" ry="1.6" transform="rotate(-20 12 12)" />
    </>
  ),
  // A calendar page marked 11.
  '11planner': (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9.5h18M8 3v4M16 3v4" />
      <path d="M9.5 13.2l1-1v6M13.5 13.2l1-1v6" />
    </>
  ),
  // A house with a sparkle: a cleaning service.
  'home-cleaning': (
    <>
      <path d="M3.5 11 12 4.2l8.5 6.8V20a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z" />
      <path d="M12 11.6l.9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9z" />
    </>
  ),
  // A runner with speed lines.
  'frantic-run': (
    <>
      <circle cx="15.5" cy="4.6" r="1.8" />
      <path d="M14.4 7.6 11.6 12l3 2.6V20M12.6 9.4l-3 .9M14.6 8.4l3 2.2M11.6 12l-3.4 4.4" />
      <path d="M2.5 9.5h4M2 13h3.5M3 16.5h2.5" />
    </>
  ),
}

export function ProjectIcon({ id, className = '' }: { id: string; className?: string }) {
  const icon = ICONS[id]
  if (!icon) return null
  return (
    <span className={`picon ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {icon}
      </svg>
    </span>
  )
}
