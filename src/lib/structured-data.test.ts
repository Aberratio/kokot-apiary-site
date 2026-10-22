import { placeholderSiteContent } from '@/content'
import { localBusinessJsonLd, serializeJsonLd } from './structured-data'

describe('localBusinessJsonLd', () => {
  it('describes the apiary and its honey in the page language', () => {
    const data = localBusinessJsonLd(placeholderSiteContent(), 'en', 'https://example.com/en')
    expect(data).toMatchObject({
      '@type': 'LocalBusiness',
      name: 'Pasieka Kokot',
      url: 'https://example.com/en',
    })
    const offers = data.hasOfferCatalog.itemListElement
    expect(offers[0]).toMatchObject({
      price: '60.00',
      priceCurrency: 'PLN',
      availability: 'https://schema.org/InStock',
      itemOffered: { name: 'Acacia honey' },
    })
    expect(offers.at(-1)?.availability).toBe('https://schema.org/OutOfStock')
  })
})

describe('serializeJsonLd', () => {
  it('cannot be broken out of with a closing script tag', () => {
    const json = serializeJsonLd({ name: '</script><script>alert(1)</script>' })
    expect(json).not.toContain('</script>')
    expect(JSON.parse(json).name).toBe('</script><script>alert(1)</script>')
  })
})
