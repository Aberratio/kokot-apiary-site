import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { localize } from '@/content'
import { getSiteContent } from '@/content/server'
import { isLocale, locales } from '@/i18n/config'

export const alt = 'Pasieka Kokot'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// The image renderer needs a static TTF, not the site's WOFF2: the same soft 144pt cut of
// Fraunces at weight 600, with the full character set (see assets/fonts/README.md).
const fraunces = readFile(join(process.cwd(), 'assets/fonts/Fraunces-144pt-Soft-SemiBold.ttf'))

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

/** The link preview: the apiary name and tagline in the hero's warm dark, in the page's language. */
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
          'radial-gradient(circle at 88% 0%, #ffcd7d 0%, #c27416 22%, #4a1f05 52%, #0c0703 100%)',
      }}
    >
      <div style={{ fontFamily: 'Fraunces', fontSize: 116, lineHeight: 1 }}>
        {settings.apiaryName}
      </div>
      <div style={{ fontSize: 44, marginTop: 24, opacity: 0.9 }}>
        {localize(settings.heroTagline, locale)}
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: 'Fraunces', data: await fraunces, weight: 600, style: 'normal' }],
    },
  )
}
