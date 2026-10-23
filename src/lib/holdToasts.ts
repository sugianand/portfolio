/**
 * Returns a `show` that defers items while `busy()` is true (say, a dialog is open) and
 * releases them in order once it isn't, checking again via `wait`. Idle calls show at once.
 */
export function holdWhileBusy<T>(busy: () => boolean, show: (item: T) => void, wait: (retry: () => void) => void) {
  const queue: T[] = []
  const flush = () => {
    if (busy()) return wait(flush)
    queue.splice(0).forEach(show)
  }
  return (item: T) => {
    if (queue.length === 0 && !busy()) return show(item)
    if (queue.push(item) === 1) wait(flush)
  }
}
