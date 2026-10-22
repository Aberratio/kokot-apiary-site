import type { Dictionary } from '@/i18n/dictionaries'
import { Section } from '../Section'
import styles from './sections.module.css'

interface AboutProps {
  story: string
  dict: Dictionary['about']
}

export function About({ story, dict }: AboutProps) {
  return (
    <Section id="about" labelledBy="about-title" className={styles.section}>
      <h2 id="about-title">{dict.title}</h2>
      <p className={styles.lead}>{story}</p>
      {/* Placeholders until Franciszek uploads photos through the CMS. */}
      <div className={styles.photos}>
        {[1, 2, 3].map((n) => (
          <div key={n} className={styles.photo} role="img" aria-label={dict.photoPlaceholder} />
        ))}
      </div>
    </Section>
  )
}
