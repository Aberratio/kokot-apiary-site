import type { ProductInput } from '@/cms/validation'
import { placeholderContent } from '@/content/placeholder'
import type { Db } from './client'
import {
  deleteProduct,
  getProduct,
  listDeliveryOptions,
  readSiteContent,
  saveDeliveryOption,
  savePaymentInfo,
  saveProduct,
  saveSettings,
  seedPlaceholders,
} from './repo'
import { createTestDb } from './test-db'

let db: Db
let close: () => Promise<void>

beforeEach(async () => {
  ;({ db, close } = await createTestDb())
})
afterEach(() => close())

const honey: ProductInput = {
  namePl: 'Miód gryczany',
  nameEn: 'Buckwheat honey',
  descriptionPl: 'Ciemny.',
  descriptionEn: 'Dark.',
  size: '900 g',
  priceGrosze: 6500,
  imageAltPl: '',
  imageAltEn: '',
  available: true,
  featured: false,
  sortOrder: 2,
}

describe('readSiteContent', () => {
  it('falls back to placeholder singletons on an empty database', async () => {
    const content = await readSiteContent(db)
    expect(content.settings).toEqual(placeholderContent.settings)
    expect(content.paymentInfo).toEqual(placeholderContent.paymentInfo)
    expect(content.products).toEqual([])
  })

  it('maps saved rows to localized content', async () => {
    await saveProduct(db, honey)
    await saveSettings(db, {
      apiaryName: 'Test',
      orderMode: 'form',
      contactEmail: 'a@b.pl',
      contactPhone: '',
      socialLinks: [{ label: 'FB', url: 'https://fb.com/x' }],
      heroTaglinePl: 'pl',
      heroTaglineEn: 'en',
      aboutStoryPl: '',
      aboutStoryEn: '',
    })
    const content = await readSiteContent(db)
    expect(content.products[0]?.name).toEqual({ pl: 'Miód gryczany', en: 'Buckwheat honey' })
    expect(content.settings.orderMode).toBe('form')
    expect(content.settings.socialLinks).toEqual([{ label: 'FB', url: 'https://fb.com/x' }])
  })

  it('orders products and leaves out disabled delivery options', async () => {
    await saveProduct(db, { ...honey, namePl: 'B', sortOrder: 2 })
    await saveProduct(db, { ...honey, namePl: 'A', sortOrder: 1 })
    await saveDeliveryOption(db, {
      namePl: 'Off',
      nameEn: 'Off',
      descriptionPl: '',
      descriptionEn: '',
      priceGrosze: 0,
      enabled: false,
      sortOrder: 0,
    })
    const content = await readSiteContent(db)
    expect(content.products.map((p) => p.name.pl)).toEqual(['A', 'B'])
    expect(content.deliveryOptions).toEqual([])
  })
})

describe('products', () => {
  it('creates, updates, keeps the image unless told otherwise, and deletes', async () => {
    const id = (await saveProduct(db, honey, { imageUrl: 'https://img/1.jpg' }))!
    await saveProduct(db, { ...honey, priceGrosze: 7000 }, { id })
    let row = await getProduct(db, id)
    expect(row?.priceGrosze).toBe(7000)
    expect(row?.imageUrl).toBe('https://img/1.jpg')

    await saveProduct(db, honey, { id, imageUrl: null })
    row = await getProduct(db, id)
    expect(row?.imageUrl).toBeNull()

    await deleteProduct(db, id)
    expect(await getProduct(db, id)).toBeNull()
  })

  it('reports an update of a missing product', async () => {
    expect(await saveProduct(db, honey, { id: 'missing' })).toBeNull()
  })
})

describe('singletons', () => {
  it('upserts payment info into one row', async () => {
    const input = {
      accountHolder: 'A',
      bankName: 'B',
      accountNumber: '1',
      transferTitleHintPl: '',
      transferTitleHintEn: '',
    }
    await savePaymentInfo(db, input)
    await savePaymentInfo(db, { ...input, accountNumber: '2' })
    expect((await readSiteContent(db)).paymentInfo.accountNumber).toBe('2')
  })
})

describe('seedPlaceholders', () => {
  it('fills an empty database once and never overwrites', async () => {
    expect(await seedPlaceholders(db)).toEqual([
      'settings',
      'payment info',
      'products',
      'delivery options',
    ])
    expect(await seedPlaceholders(db)).toEqual([])
    const content = await readSiteContent(db)
    expect(content.products).toHaveLength(placeholderContent.products.length)
    expect(await listDeliveryOptions(db)).toHaveLength(placeholderContent.deliveryOptions.length)
  })
})
