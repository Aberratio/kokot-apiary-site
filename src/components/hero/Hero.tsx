import { Fragment, type CSSProperties } from 'react'
import { STILLS, stillSrcSet, stillUrl } from '@/lib/stills'
import styles from './Hero.module.css'
import { HeroLoop } from './HeroLoop'
import { HeroParallax } from './HeroParallax'
import { makeMotes, WIDE_HERO_MEDIA } from './media'

interface HeroProps {
  title: string
  tagline: string
  scrollHint: string
}

const MOTES = makeMotes(12)

/**
 * The hero: a rendered still of the product line (blender/stills.py, `hero-wide` and
 * `hero-tall`) behind the apiary name, brought to life without WebGL:
 *
 * - the honey drip runs as a short video loop laid over its part of the still (HeroLoop);
 * - the scene and a layer of soft motes shift with the pointer at different depths
 *   (HeroParallax), and a glint of light passes over the glass now and then;
 * - the title rises, a honey rule draws under it, the tagline arrives word by word, and
 *   scrolling away moves the text faster than the scene and dims it.
 *
 * Every animation moves only `transform` or `opacity`, so the compositor runs it off the main
 * thread. The still is in the server HTML with high fetch priority; the title is the LCP and
 * visible from the first frame (it only eases its position).
 */
export function Hero({ title, tagline, scrollHint }: HeroProps) {
  const [tallWidth, tallHeight] = STILLS['hero-tall'].render
  const tallWidths = STILLS['hero-tall'].widths
  const words = tagline.split(/\s+/).filter(Boolean)
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.media} aria-hidden="true">
        <div className={styles.stage} data-depth="0.5">
          <div className={styles.frame}>
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
            <HeroLoop className={styles.loop} />
            <div className={styles.glint} />
          </div>
        </div>
        <div className={styles.dim} />
        <div className={styles.motes} data-depth="1.6">
          {MOTES.map((mote, i) => (
            <span
              key={i}
              style={
                {
                  '--mx': `${mote.x}%`,
                  '--my': `${mote.y}%`,
                  '--ms': `${mote.size}rem`,
                  '--md': `${mote.duration}s`,
                  '--mdelay': `${mote.delay}s`,
                  '--mr': `${-mote.rise}rem`,
                  '--mo': mote.opacity,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </div>
      <div className={styles.content}>
        <h1 id="hero-title">{title}</h1>
        <span className={styles.rule} aria-hidden="true" />
        <p>
          {words.map((word, i) => (
            // The space sits between the spans: inside an inline-block it would collapse.
            <Fragment key={i}>
              <span style={{ '--i': i } as CSSProperties}>{word}</span>
              {i < words.length - 1 ? ' ' : null}
            </Fragment>
          ))}
        </p>
      </div>
      <a href="#about" className={styles.hint}>
        <span>{scrollHint}</span>
        <span className={styles.line} aria-hidden="true" />
      </a>
      <HeroParallax />
    </section>
  )
}
