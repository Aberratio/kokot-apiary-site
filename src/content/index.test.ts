import { getSiteContent } from '.'
import { placeholderContent } from './placeholder'

describe('getSiteContent', () => {
  it('sorts products by their sort order', async () => {
    const { products } = await getSiteContent()
    const orders = products.map((p) => p.sortOrder)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })

  it('leaves out disabled delivery options', async () => {
    const original = placeholderContent.deliveryOptions
    placeholderContent.deliveryOptions = original.map((o, i) => ({ ...o, enabled: i !== 0 }))
    try {
      const { deliveryOptions } = await getSiteContent()
      expect(deliveryOptions.map((o) => o.id)).not.toContain(original[0]!.id)
    } finally {
      placeholderContent.deliveryOptions = original
    }
  })

  it('has every localized field in both languages', () => {
    const texts = [
      placeholderContent.settings.heroTagline,
      placeholderContent.settings.aboutStory,
      placeholderContent.paymentInfo.transferTitleHint,
      ...placeholderContent.products.flatMap((p) => [p.name, p.description, p.imageAlt]),
      ...placeholderContent.deliveryOptions.flatMap((o) => [o.name, o.description]),
    ]
    for (const text of texts) {
      expect(text.pl.trim()).not.toBe('')
      expect(text.en.trim()).not.toBe('')
    }
  })
})
