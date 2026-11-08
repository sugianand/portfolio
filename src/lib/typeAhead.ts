type Key = Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'altKey'>

/**
 * Keys typed while the assistant panel is still loading belong in its input, not to the
 * page's one-key shortcuts ("r", "?", "/"). Returns the draft with `e` applied, or null when
 * the key isn't text (Escape, Tab, arrows, shortcuts with a modifier) and should pass through.
 */
export function typeAhead(draft: string, e: Key, max = 200): string | null {
  if (e.metaKey || e.ctrlKey || e.altKey) return null
  if (e.key === 'Backspace') return draft.slice(0, -1)
  if (e.key.length !== 1) return null
  return (draft + e.key).slice(0, max)
}
