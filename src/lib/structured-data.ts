import { localize, type SiteContent } from '@/content'
import type { Locale } from '@/i18n/config'

/**
 * schema.org LocalBusiness for the page, with the honey on sale as an offer catalogue.
 * Only facts the CMS holds are included; there is no street address in the CMS yet.
 */
export function localBusinessJsonLd(content: SiteContent, locale: Locale, pageUrl: string) {
  const { settings, products } = content
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: settings.apiaryName,
    description: localize(settings.heroTagline, locale),
    url: pageUrl,
    email: settings.contactEmail,
    ...(settings.contactPhone && { telephone: settings.contactPhone }),
    ...(settings.socialLinks.length > 0 && { sameAs: settings.socialLinks.map((l) => l.url) }),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: settings.apiaryName,
      itemListElement: products.map((product) => ({
        '@type': 'Offer',
        price: (product.priceGrosze / 100).toFixed(2),
        priceCurrency: 'PLN',
        availability: product.available
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        itemOffered: {
          '@type': 'Product',
          name: localize(product.name, locale),
          description: localize(product.description, locale),
          ...(product.imageUrl && { image: product.imageUrl }),
        },
      })),
    },
  }
}

/** JSON for a `<script>` tag: `<` is escaped so CMS text can never close the tag early. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
