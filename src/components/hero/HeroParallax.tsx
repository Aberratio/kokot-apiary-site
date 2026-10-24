'use client'

import { useEffect, useRef } from 'react'

/** The largest shift, in px, of a layer with `data-depth="1"`. */
const RANGE = 18

/**
 * Pointer parallax for the hero: every element inside it with a `data-depth` attribute shifts
 * against the pointer by `depth` times RANGE, so near layers move more than far ones. Only
 * `transform` changes, eased in one animation frame loop that stops once it has settled.
 * Off for touch screens and under reduced motion. Renders nothing itself.
 */
export function HeroParallax() {
  const marker = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const hero = marker.current?.parentElement
    if (!hero) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const layers = [...hero.querySelectorAll<HTMLElement>('[data-depth]')].map((element) => ({
      element,
      depth: Number(element.dataset.depth) || 0,
    }))
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let frame = 0

    const step = () => {
      current.x += (target.x - current.x) * 0.06
      current.y += (target.y - current.y) * 0.06
      for (const { element, depth } of layers) {
        const x = (-current.x * depth * RANGE).toFixed(2)
        const y = (-current.y * depth * RANGE).toFixed(2)
        element.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }
      const settled =
        Math.abs(target.x - current.x) < 0.001 && Math.abs(target.y - current.y) < 0.001
      frame = settled ? 0 : requestAnimationFrame(step)
    }
    const onMove = (event: PointerEvent) => {
      target.x = event.clientX / window.innerWidth - 0.5
      target.y = event.clientY / window.innerHeight - 0.5
      if (!frame) frame = requestAnimationFrame(step)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
      for (const { element } of layers) element.style.transform = ''
    }
  }, [])

  return <span ref={marker} hidden />
}
