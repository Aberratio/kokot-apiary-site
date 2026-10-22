import 'lenis/dist/lenis.css'
import '../../globals.css'
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { notFound } from 'next/navigation'
import { SmoothScroll } from 'web-studio-kit'
import { defaultLocale, isLocale, locales } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { siteUrl } from '@/lib/site'

// latin-ext carries the Polish letters.
const sans = Geist({ variable: '--font-sans', subsets: ['latin', 'latin-ext'] })

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = getDictionary(lang)
  return {
    metadataBase: siteUrl(),
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: {
        ...Object.fromEntries(locales.map((locale) => [locale, `/${locale}`])),
        'x-default': `/${defaultLocale}`,
      },
    },
  }
}

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  // Unknown languages get a 404 (dynamicParams is not available with Cache Components).
  if (!isLocale(lang)) notFound()
  return (
    <html lang={lang} className={sans.variable}>
      <body>
        {/* Lenis handles in-page anchor links; each section's scroll-margin-top clears the header. */}
        <SmoothScroll options={{ anchors: true }}>{children}</SmoothScroll>
      </body>
    </html>
  )
}
