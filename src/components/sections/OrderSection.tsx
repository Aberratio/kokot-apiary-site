import type { Settings } from '@/content'
import type { Dictionary } from '@/i18n/dictionaries'
import { Section } from '../Section'
import styles from './sections.module.css'

interface OrderSectionProps {
  settings: Settings
  dict: Dictionary['order']
}

/**
 * Where the order form or the contact form goes, depending on `orderMode` (Phase 3). Until
 * then it says so and gives the direct contact details, so no visitor hits a dead form.
 */
export function OrderSection({ settings, dict }: OrderSectionProps) {
  return (
    <Section id="order" labelledBy="order-title" className={styles.section}>
      <h2 id="order-title">{dict.title}</h2>
      <p className={styles.lead}>{dict.soon}</p>
      <dl className={styles.details}>
        <dt>{dict.email}</dt>
        <dd>
          <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
        </dd>
        <dt>{dict.phone}</dt>
        <dd>
          <a href={`tel:${settings.contactPhone.replace(/\s/g, '')}`}>{settings.contactPhone}</a>
        </dd>
      </dl>
    </Section>
  )
}
