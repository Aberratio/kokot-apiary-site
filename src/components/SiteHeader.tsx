import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries'
import { LanguageSwitch } from './LanguageSwitch'
import styles from './SiteHeader.module.css'

export const sectionIds = ['about', 'process', 'offer', 'how-to-order', 'order'] as const

interface SiteHeaderProps {
  locale: Locale
  apiaryName: string
  dict: Dictionary
}

export function SiteHeader({ locale, apiaryName, dict }: SiteHeaderProps) {
  const labels: Record<(typeof sectionIds)[number], string> = {
    about: dict.nav.about,
    process: dict.nav.process,
    offer: dict.nav.offer,
    'how-to-order': dict.nav.howToOrder,
    order: dict.nav.order,
  }
  return (
    <header className={styles.header}>
      <a href="#main" className={styles.skip}>
        {dict.nav.skipToContent}
      </a>
      <a href="#top" className={styles.brand}>
        {apiaryName}
      </a>
      <nav aria-label={dict.nav.label} className={styles.nav}>
        <ul>
          {sectionIds.map((id) => (
            <li key={id}>
              <a href={`#${id}`}>{labels[id]}</a>
            </li>
          ))}
        </ul>
      </nav>
      <LanguageSwitch current={locale} labels={dict.languageSwitch} />
    </header>
  )
}
