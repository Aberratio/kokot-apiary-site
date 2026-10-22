'use client'

import { useEffect, useState, type ReactNode } from 'react'

/**
 * Renders its children only after the browser has painted the page once. For decoration above
 * the fold that would otherwise hold back the first paint, and with it the page's LCP.
 */
export function AfterFirstPaint({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    // Two frames: the first runs before the next paint, the second after it.
    let second = 0
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setReady(true))
    })
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
    }
  }, [])
  return ready ? children : null
}
