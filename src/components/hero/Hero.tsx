import { KineticText, QualityGate } from 'web-studio-kit'
import styles from './Hero.module.css'
import { HeroScene } from './HeroScene'

interface HeroProps {
  title: string
  tagline: string
  scrollHint: string
}

/**
 * The section's own CSS gradient is the light version. On capable devices the WebGL scene
 * mounts on top of it; everywhere else (reduced motion, no WebGL, weak device, server render)
 * the gradient is all there is, and the text is the same.
 *
 * The title is the page's Largest Contentful Paint, so it is visible from the first frame
 * and never split into letters (`appear="ripple"`), and the scene loads once the browser is idle.
 */
export function Hero({ title, tagline, scrollHint }: HeroProps) {
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <QualityGate className={styles.backdrop} fallback={null} lazy={false} idle>
        <HeroScene />
      </QualityGate>
      <div className={styles.content}>
        <KineticText as="h1" id="hero-title" trigger="mount" appear="ripple" distort>
          {title}
        </KineticText>
        <p>{tagline}</p>
      </div>
      <a href="#about" className={styles.hint}>
        {scrollHint}
      </a>
    </section>
  )
}
