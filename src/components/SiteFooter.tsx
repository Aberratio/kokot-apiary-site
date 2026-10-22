import type { Settings } from '@/content'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries'
import { LanguageSwitch } from './LanguageSwitch'
import styles from './SiteFooter.module.css'

interface SiteFooterProps {
  locale: Locale
  settings: Settings
  dict: Dictionary
}

export function SiteFooter({ locale, settings, dict }: SiteFooterProps) {
  return (
    <footer className={styles.footer}>
      <div>
        <h2>{dict.footer.contactTitle}</h2>
        <p>
          <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
          <br />
          <a href={`tel:${settings.contactPhone.replace(/\s/g, '')}`}>{settings.contactPhone}</a>
        </p>
      </div>
      <div>
        <h2>{dict.footer.socialTitle}</h2>
        <ul>
          {settings.socialLinks.map((link) => (
            <li key={link.url}>
              <a href={link.url} rel="noopener noreferrer" target="_blank">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <LanguageSwitch current={locale} labels={dict.languageSwitch} landmark={false} />
      </div>
      <p className={styles.legal}>
        © {settings.apiaryName}. {dict.footer.rights}
      </p>
    </footer>
  )
}
