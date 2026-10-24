/**
 * Calls `callback` after the page's load event, once the main thread is idle. For assets that
 * must not compete with the hero title, the page's Largest Contentful Paint. Returns a cancel.
 */
export function afterLoad(callback: () => void): () => void {
  // Idle callbacks and timeouts number their ids separately; cancel with the matching call.
  let cancel = () => {}
  const schedule = () => {
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(callback, { timeout: 1500 })
      cancel = () => cancelIdleCallback(id)
    } else {
      const id = window.setTimeout(callback, 200)
      cancel = () => clearTimeout(id)
    }
  }
  if (document.readyState === 'complete') schedule()
  else window.addEventListener('load', schedule, { once: true })
  return () => {
    window.removeEventListener('load', schedule)
    cancel()
  }
}
