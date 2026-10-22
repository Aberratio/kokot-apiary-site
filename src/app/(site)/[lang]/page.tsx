import { notFound } from 'next/navigation'
import { Hero } from '@/components/hero/Hero'
import { About } from '@/components/sections/About'
import { HowToOrder } from '@/components/sections/HowToOrder'
import { Offer } from '@/components/sections/Offer'
import { OrderSection } from '@/components/sections/OrderSection'
import { Process } from '@/components/sections/Process'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { localize } from '@/content'
import { getSiteContent } from '@/content/server'
import { isLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { siteUrl } from '@/lib/site'
import { localBusinessJsonLd, serializeJsonLd } from '@/lib/structured-data'

export default async function Page({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const dict = getDictionary(lang)
  const content = await getSiteContent()
  const { settings, products, paymentInfo, deliveryOptions } = content

  const jsonLd = localBusinessJsonLd(content, lang, new URL(`/${lang}`, siteUrl()).toString())

  return (
    <>
      <script
        type="application/ld+json"
        // Serialised with `<` escaped, so CMS text cannot end the script early.
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <SiteHeader locale={lang} apiaryName={settings.apiaryName} dict={dict} />
      <main id="main">
        <Hero
          title={settings.apiaryName}
          tagline={localize(settings.heroTagline, lang)}
          scrollHint={dict.hero.scrollHint}
        />
        <About story={localize(settings.aboutStory, lang)} dict={dict.about} />
        <Process dict={dict.process} />
        <Offer locale={lang} products={products} dict={dict.offer} />
        <HowToOrder
          locale={lang}
          payment={paymentInfo}
          delivery={deliveryOptions}
          dict={dict.howToOrder}
        />
        <OrderSection locale={lang} content={content} dict={dict} />
      </main>
      <SiteFooter locale={lang} settings={settings} dict={dict} />
    </>
  )
}
