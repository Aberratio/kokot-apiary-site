import { KineticText } from 'web-studio-kit'
import type { Dictionary } from '@/i18n/dictionaries'
import type { StillName } from '@/lib/stills'
import { Section } from '../Section'
import { LazyStill } from '../stills/LazyStill'
import styles from './sections.module.css'

interface AboutProps {
  story: string
  dict: Dictionary['about']
}

/** Rendered stills (blender/stills.py) stand in until Franciszek's own photos arrive. */
const PHOTOS: { still: StillName; alt: keyof Dictionary['about']['photos'] }[] = [
  { still: 'about-comb', alt: 'comb' },
  { still: 'about-dipper', alt: 'dipper' },
  { still: 'about-hive', alt: 'hive' },
]

export function About({ story, dict }: AboutProps) {
  return (
    <Section id="about" labelledBy="about-title" className={styles.section} light="left">
      <KineticText as="h2" id="about-title">
        {dict.title}
      </KineticText>
      <p className={styles.lead}>{story}</p>
      <div className={styles.photos}>
        {PHOTOS.map(({ still, alt }) => (
          <LazyStill
            key={still}
            name={still}
            alt={dict.photos[alt]}
            className={styles.photo}
            sizes="(min-width: 68rem) 21rem, (min-width: 48rem) 30vw, calc(100vw - 2rem)"
          />
        ))}
      </div>
    </Section>
  )
}
