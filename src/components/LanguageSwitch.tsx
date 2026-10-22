'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { localizedPath, locales, type Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries'
import styles from './LanguageSwitch.module.css'

interface LanguageSwitchProps {
  current: Locale
  labels: Dictionary['languageSwitch']
}

/** Links to the current page in every language. Each name is written in its own language. */
export function LanguageSwitch({ current, labels }: LanguageSwitchProps) {
  const pathname = usePathname() ?? '/'
  return (
    <nav aria-label={labels.label} className={styles.switch}>
      <ul>
        {locales.map((locale) => (
          <li key={locale}>
            <Link
              href={localizedPath(pathname, locale)}
              hrefLang={locale}
              lang={locale}
              aria-current={locale === current ? 'page' : undefined}
              className={styles.link}
            >
              {labels[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
