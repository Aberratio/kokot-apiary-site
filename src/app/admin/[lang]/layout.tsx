import '../admin.css'
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { notFound } from 'next/navigation'
import { isLocale, locales } from '@/i18n/config'
import { getAdminDictionary } from '@/i18n/admin'

const sans = Geist({ variable: '--font-sans', subsets: ['latin', 'latin-ext'] })

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: LayoutProps<'/admin/[lang]'>): Promise<Metadata> {
  const { lang } = await params
  return {
    title: isLocale(lang) ? getAdminDictionary(lang).title : undefined,
    robots: { index: false, follow: false },
  }
}

/** The admin's own root layout: no smooth scroll, no 3D, light theme. */
export default async function AdminRootLayout({ children, params }: LayoutProps<'/admin/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  return (
    <html lang={lang} className={sans.variable}>
      <body>{children}</body>
    </html>
  )
}
