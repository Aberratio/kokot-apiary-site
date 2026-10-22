import type { Locale } from '@/i18n/config'

const intlLocale: Record<Locale, string> = { pl: 'pl-PL', en: 'en-GB' }

/** Formats a price kept in grosze as złoty, in the page's language. */
export function formatPrice(grosze: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: 'currency',
    currency: 'PLN',
  }).format(grosze / 100)
}
