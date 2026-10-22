import 'lenis/dist/lenis.css'
import '../../globals.css'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { notFound } from 'next/navigation'
import { SmoothScroll } from 'web-studio-kit'
import { defaultLocale, isLocale, locales } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { siteUrl } from '@/lib/site'

// Self-hosted, one small file per family, because the hero title is the page's LCP and every
// font byte fetched before it paints counts on a slow phone connection. Each file holds Basic
// Latin, Latin-1 and the Polish letters (see assets/fonts/README.md).
// Fraunces is the 144pt display cut with full softness at weight 600; Instrument Sans keeps
// its variable weight.
const display = localFont({
  src: '../../../../assets/fonts/Fraunces-144pt-Soft-SemiBold.woff2',
  variable: '--font-display',
  weight: '600',
  adjustFontFallback: 'Times New Roman',
})
const sans = localFont({
  src: '../../../../assets/fonts/InstrumentSans-wght.woff2',
  variable: '--font-sans',
  weight: '400 700',
})

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
    // The image itself comes from opengraph-image.tsx next to this layout.
    openGraph: {
      type: 'website',
      url: `/${lang}`,
      title: dict.meta.title,
      description: dict.meta.description,
      locale: lang === 'pl' ? 'pl_PL' : 'en_GB',
      alternateLocale: lang === 'pl' ? ['en_GB'] : ['pl_PL'],
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.meta.title,
      description: dict.meta.description,
    },
  }
}

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  // Unknown languages get a 404 (dynamicParams is not available with Cache Components).
  if (!isLocale(lang)) notFound()
  return (
    <html lang={lang} className={`${display.variable} ${sans.variable}`}>
      <body>
        {/* Lenis handles in-page anchor links; each section's scroll-margin-top clears the header. */}
        <SmoothScroll options={{ anchors: true }}>{children}</SmoothScroll>
      </body>
    </html>
  )
}
