import { STILLS, stillSrcSet, stillUrl } from '@/lib/stills'
import styles from './Hero.module.css'

interface HeroProps {
  title: string
  tagline: string
  scrollHint: string
}

/**
 * Wide screens get the wide frame (subject right, title left); phones and portrait screens
 * the tall one (subject up top, title below). Hero.module.css switches layout on the same query.
 */
const WIDE_HERO_MEDIA = '(min-width: 48rem) and (min-aspect-ratio: 1/1)'

/**
 * The hero: a rendered still of the product line (blender/stills.py, `hero-wide` and
 * `hero-tall`) behind the apiary name.
 *
 * Plain HTML and CSS, no WebGL: the image is in the server HTML with high fetch priority, and
 * every motion (the reveal, the slow settle, the scroll parallax) animates only `transform`
 * and `opacity`, which the browser runs off the main thread. The title is visible from the
 * first frame; only its position eases in.
 */
export function Hero({ title, tagline, scrollHint }: HeroProps) {
  const [tallWidth, tallHeight] = STILLS['hero-tall'].render
  const tallWidths = STILLS['hero-tall'].widths
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.media} aria-hidden="true">
        <picture>
          <source
            media={WIDE_HERO_MEDIA}
            type="image/avif"
            srcSet={stillSrcSet('hero-wide', 'avif')}
            sizes="100vw"
          />
          <source
            media={WIDE_HERO_MEDIA}
            type="image/webp"
            srcSet={stillSrcSet('hero-wide', 'webp')}
            sizes="100vw"
          />
          <source type="image/avif" srcSet={stillSrcSet('hero-tall', 'avif')} sizes="100vw" />
          <source type="image/webp" srcSet={stillSrcSet('hero-tall', 'webp')} sizes="100vw" />
          {/* Pre-encoded per breakpoint by scripts/build-assets.mts, so not next/image. */}
          <img
            src={stillUrl('hero-tall', tallWidths[tallWidths.length - 1]!, 'webp')}
            alt=""
            width={tallWidth}
            height={tallHeight}
            fetchPriority="high"
          />
        </picture>
      </div>
      <div className={styles.content}>
        <h1 id="hero-title">{title}</h1>
        <p>{tagline}</p>
      </div>
      <a href="#about" className={styles.hint}>
        {scrollHint}
      </a>
    </section>
  )
}
