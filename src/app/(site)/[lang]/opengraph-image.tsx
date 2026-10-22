import { ImageResponse } from 'next/og'
import { localize } from '@/content'
import { getSiteContent } from '@/content/server'
import { isLocale, locales } from '@/i18n/config'

export const alt = 'Pasieka Kokot'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

/** The link preview: the apiary name and tagline on honey, in the page's language. */
export default async function OpenGraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : 'pl'
  const { settings } = await getSiteContent()
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 80,
        color: '#fbf3e6',
        background:
          'radial-gradient(circle at 30% 30%, #e7a224 0%, #b9771e 30%, #5a3510 65%, #120c06 100%)',
      }}
    >
      <div style={{ fontSize: 108, fontWeight: 700, lineHeight: 1 }}>{settings.apiaryName}</div>
      <div style={{ fontSize: 44, marginTop: 24, opacity: 0.9 }}>
        {localize(settings.heroTagline, locale)}
      </div>
    </div>,
    size,
  )
}
