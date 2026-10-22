import { KineticText, QualityGate } from 'web-studio-kit'
import { AfterFirstPaint } from './AfterFirstPaint'
import styles from './Hero.module.css'
import { HeroIllustration } from './HeroIllustration'
import { HeroScene } from './HeroScene'

interface HeroProps {
  title: string
  tagline: string
  scrollHint: string
}

/**
 * The light version is the section's CSS background (a dark warm gradient with the sun glow)
 * plus a flat illustration of the honey dipper. On capable devices the WebGL dipper fades in
 * on top of them; everywhere else (reduced motion, no WebGL, weak device) the illustration is
 * all there is, and the text is the same.
 *
 * The title is the page's Largest Contentful Paint, so it is visible from the first frame
 * and never split into letters (`appear="ripple"`). The illustration joins right after the
 * first paint (painting it delayed the title by about 100 ms), and the scene once the browser
 * is idle.
 */
export function Hero({ title, tagline, scrollHint }: HeroProps) {
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <AfterFirstPaint>
        <HeroIllustration className={styles.illustration} />
      </AfterFirstPaint>
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
