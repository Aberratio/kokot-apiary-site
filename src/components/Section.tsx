'use client'

import { useRef, type ReactNode } from 'react'
import { useScrollProgress } from 'web-studio-kit'

interface SectionProps {
  id: string
  /** Id of the heading that names this section. */
  labelledBy: string
  className?: string
  /**
   * Which side the section's low sun stands on. Sections alternate, so the light seems to
   * move across the page. Default `right`, like the hero.
   */
  light?: 'left' | 'right'
  children: ReactNode
}

/**
 * A page section that writes its scroll progress (0 to 1) to `--scroll-progress`, so CSS and
 * later the 3D scenes can follow it. Without JavaScript the variable is unset, and styles fall
 * back to the finished state.
 */
export function Section({ id, labelledBy, className, light = 'right', children }: SectionProps) {
  const ref = useRef<HTMLElement>(null)
  useScrollProgress(ref)
  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={labelledBy}
      className={className}
      data-light={light}
    >
      {children}
    </section>
  )
}
