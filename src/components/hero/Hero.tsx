import { QualityGate } from 'web-studio-kit'
import styles from './Hero.module.css'
import { HeroScene } from './HeroScene'

interface HeroProps {
  title: string
  subtitle: string
}

/**
 * The section's own CSS gradient is the light version. On capable devices the WebGL scene
 * mounts on top of it; everywhere else (reduced motion, no WebGL, weak device, server render)
 * the gradient is all there is, and the text is the same.
 */
export function Hero({ title, subtitle }: HeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <QualityGate className={styles.backdrop} fallback={null} lazy={false}>
        <HeroScene />
      </QualityGate>
      <div className={styles.content}>
        <h1 id="hero-title">{title}</h1>
        <p>{subtitle}</p>
      </div>
    </section>
  )
}
