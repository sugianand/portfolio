const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Where Tab should land inside a modal with `count` focusable items, given the index of the
 * focused one (-1 when focus sits on the dialog itself or outside it). Returns null when the
 * browser's own Tab order already stays inside, so only the edges wrap.
 */
export function wrapFocus(current: number, count: number, back: boolean): number | null {
  if (count === 0) return null
  if (current === -1) return back ? count - 1 : 0
  if (!back && current === count - 1) return 0
  if (back && current === 0) return count - 1
  return null
}

/** Keeps Tab and Shift+Tab inside `root` while a modal dialog is open. */
export function trapTab(e: KeyboardEvent, root: HTMLElement | null) {
  if (e.key !== 'Tab' || !root) return
  const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.getClientRects().length > 0 && !el.closest('[inert]'))
  if (items.length === 0) {
    e.preventDefault()
    root.focus({ preventScroll: true })
    return
  }
  const next = wrapFocus(items.indexOf(document.activeElement as HTMLElement), items.length, e.shiftKey)
  if (next === null) return
  e.preventDefault()
  items[next].focus()
}
