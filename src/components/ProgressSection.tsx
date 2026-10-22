'use client'

import { useRef, type ReactNode } from 'react'
import { useScrollProgress } from 'web-studio-kit'
import styles from './ProgressSection.module.css'

interface ProgressSectionProps {
  id: string
  title: string
  children: ReactNode
}

/**
 * A page section that exposes its scroll progress as `--scroll-progress` (0 to 1), so CSS can
 * drive effects from it. The bar is a visible example.
 */
export function ProgressSection({ id, title, children }: ProgressSectionProps) {
  const ref = useRef<HTMLElement>(null)
  useScrollProgress(ref)
  return (
    <section ref={ref} id={id} aria-labelledby={`${id}-title`} className={styles.section}>
      <h2 id={`${id}-title`}>{title}</h2>
      {children}
      <div className={styles.bar} aria-hidden="true" />
    </section>
  )
}
