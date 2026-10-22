import type { MetadataRoute } from 'next'
import { defaultLocale, locales } from '@/i18n/config'
import { siteUrl } from '@/lib/site'

/** One page in two languages, each listing the other as its alternate. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  const url = (locale: string) => new URL(`/${locale}`, base).toString()
  const languages = Object.fromEntries(locales.map((locale) => [locale, url(locale)]))
  return locales.map((locale) => ({
    url: url(locale),
    changeFrequency: 'weekly',
    priority: locale === defaultLocale ? 1 : 0.8,
    alternates: { languages },
  }))
}
