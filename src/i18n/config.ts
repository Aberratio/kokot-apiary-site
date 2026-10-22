export const locales = ['pl', 'en'] as const
export type Locale = (typeof locales)[number]

/** Polish first: `/` redirects here, and it is the language search engines see as default. */
export const defaultLocale: Locale = 'pl'

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** The same page in another language: swaps the first path segment, or adds one. */
export function localizedPath(pathname: string, locale: Locale): string {
  const segments = pathname.split('/').filter(Boolean)
  const tail = segments[0] && isLocale(segments[0]) ? segments.slice(1) : segments
  return '/' + [locale, ...tail].join('/')
}
