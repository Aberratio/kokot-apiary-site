'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { localizedPath, locales, type Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries'
import styles from './LanguageSwitch.module.css'

interface LanguageSwitchProps {
  current: Locale
  labels: Dictionary['languageSwitch']
  /**
   * A navigation landmark (default). The page shows the switch twice, header and footer; the
   * second is a plain group so screen readers do not list two identical landmarks.
   */
  landmark?: boolean
}

/** Links to the current page in every language. Each name is written in its own language. */
export function LanguageSwitch({ current, labels, landmark = true }: LanguageSwitchProps) {
  const pathname = usePathname() ?? '/'
  const Wrapper = landmark ? 'nav' : 'div'
  return (
    <Wrapper
      aria-label={labels.label}
      className={styles.switch}
      {...(!landmark && { role: 'group' })}
    >
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
    </Wrapper>
  )
}
