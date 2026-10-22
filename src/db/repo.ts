import { asc, eq, sql } from 'drizzle-orm'
import type {
  DeliveryOptionInput,
  PaymentInfoInput,
  ProductInput,
  SettingsInput,
} from '@/cms/validation'
import { placeholderContent } from '@/content/placeholder'
import type { DeliveryOption, PaymentInfo, Product, Settings, SiteContent } from '@/content/types'
import type { Db } from './client'
import { deliveryOptions, paymentInfo, products, settings } from './schema'

type ProductRow = typeof products.$inferSelect
type DeliveryRow = typeof deliveryOptions.$inferSelect
type PaymentRow = typeof paymentInfo.$inferSelect
type SettingsRow = typeof settings.$inferSelect

const SINGLETON = 1

// Rows to the content shapes the page renders.

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: { pl: row.namePl, en: row.nameEn },
    description: { pl: row.descriptionPl, en: row.descriptionEn },
    size: row.size,
    priceGrosze: row.priceGrosze,
    imageUrl: row.imageUrl,
    imageAlt: { pl: row.imageAltPl, en: row.imageAltEn },
    available: row.available,
    featured: row.featured,
    sortOrder: row.sortOrder,
  }
}

function toDeliveryOption(row: DeliveryRow): DeliveryOption {
  return {
    id: row.id,
    name: { pl: row.namePl, en: row.nameEn },
    description: { pl: row.descriptionPl, en: row.descriptionEn },
    priceGrosze: row.priceGrosze,
    requiresAddress: row.requiresAddress,
    enabled: row.enabled,
    sortOrder: row.sortOrder,
  }
}

function toPaymentInfo(row: PaymentRow): PaymentInfo {
  return {
    accountHolder: row.accountHolder,
    bankName: row.bankName,
    accountNumber: row.accountNumber,
    transferTitleHint: { pl: row.transferTitleHintPl, en: row.transferTitleHintEn },
  }
}

function toSettings(row: SettingsRow): Settings {
  return {
    apiaryName: row.apiaryName,
    orderMode: row.orderMode,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    socialLinks: row.socialLinks,
    heroTagline: { pl: row.heroTaglinePl, en: row.heroTaglineEn },
    aboutStory: { pl: row.aboutStoryPl, en: row.aboutStoryEn },
  }
}

/**
 * Everything the public page shows. Singletons not saved yet fall back to placeholders, so a
 * fresh database still renders a complete page.
 */
export async function readSiteContent(db: Db): Promise<SiteContent> {
  const [settingsRows, paymentRows, productRows, deliveryRows] = await Promise.all([
    db.select().from(settings).where(eq(settings.id, SINGLETON)),
    db.select().from(paymentInfo).where(eq(paymentInfo.id, SINGLETON)),
    listProducts(db),
    db
      .select()
      .from(deliveryOptions)
      .where(eq(deliveryOptions.enabled, true))
      .orderBy(asc(deliveryOptions.sortOrder), asc(deliveryOptions.namePl)),
  ])
  return {
    settings: settingsRows[0] ? toSettings(settingsRows[0]) : placeholderContent.settings,
    paymentInfo: paymentRows[0] ? toPaymentInfo(paymentRows[0]) : placeholderContent.paymentInfo,
    products: productRows.map(toProduct),
    deliveryOptions: deliveryRows.map(toDeliveryOption),
  }
}

// Products

export function listProducts(db: Db) {
  return db.select().from(products).orderBy(asc(products.sortOrder), asc(products.namePl))
}

export async function getProduct(db: Db, id: string) {
  const [row] = await db.select().from(products).where(eq(products.id, id))
  return row ?? null
}

/**
 * Creates a product (no id) or updates one. `imageUrl`: a string sets it, null removes it,
 * undefined keeps what is there. Returns the id, or null when the id does not exist.
 */
export async function saveProduct(
  db: Db,
  input: ProductInput,
  options: { id?: string; imageUrl?: string | null } = {},
): Promise<string | null> {
  const values = {
    ...input,
    ...(options.imageUrl !== undefined && { imageUrl: options.imageUrl }),
  }
  if (!options.id) {
    const [row] = await db.insert(products).values(values).returning({ id: products.id })
    return row!.id
  }
  const [row] = await db
    .update(products)
    .set(values)
    .where(eq(products.id, options.id))
    .returning({ id: products.id })
  return row?.id ?? null
}

export async function deleteProduct(db: Db, id: string) {
  await db.delete(products).where(eq(products.id, id))
}

// Delivery options

export function listDeliveryOptions(db: Db) {
  return db
    .select()
    .from(deliveryOptions)
    .orderBy(asc(deliveryOptions.sortOrder), asc(deliveryOptions.namePl))
}

export async function getDeliveryOption(db: Db, id: string) {
  const [row] = await db.select().from(deliveryOptions).where(eq(deliveryOptions.id, id))
  return row ?? null
}

export async function saveDeliveryOption(
  db: Db,
  input: DeliveryOptionInput,
  id?: string,
): Promise<string | null> {
  if (!id) {
    const [row] = await db
      .insert(deliveryOptions)
      .values(input)
      .returning({ id: deliveryOptions.id })
    return row!.id
  }
  const [row] = await db
    .update(deliveryOptions)
    .set(input)
    .where(eq(deliveryOptions.id, id))
    .returning({ id: deliveryOptions.id })
  return row?.id ?? null
}

export async function deleteDeliveryOption(db: Db, id: string) {
  await db.delete(deliveryOptions).where(eq(deliveryOptions.id, id))
}

// Singletons

export async function getPaymentInfo(db: Db) {
  const [row] = await db.select().from(paymentInfo).where(eq(paymentInfo.id, SINGLETON))
  return row ?? null
}

export async function savePaymentInfo(db: Db, input: PaymentInfoInput) {
  await db
    .insert(paymentInfo)
    .values({ id: SINGLETON, ...input })
    .onConflictDoUpdate({ target: paymentInfo.id, set: { ...input, updatedAt: new Date() } })
}

export async function getSettings(db: Db) {
  const [row] = await db.select().from(settings).where(eq(settings.id, SINGLETON))
  return row ?? null
}

export async function saveSettings(db: Db, input: SettingsInput) {
  await db
    .insert(settings)
    .values({ id: SINGLETON, ...input })
    .onConflictDoUpdate({ target: settings.id, set: { ...input, updatedAt: new Date() } })
}

// Seed

/**
 * Fills an empty database with the placeholder content. Tables that already have rows are left
 * alone, so running it twice, or after Franciszek edited something, changes nothing.
 */
export async function seedPlaceholders(db: Db): Promise<string[]> {
  const seeded: string[] = []
  const count = async (table: typeof products | typeof deliveryOptions) =>
    Number((await db.select({ n: sql<number>`count(*)` }).from(table))[0]?.n ?? 0)
  const p = placeholderContent

  if ((await getSettings(db)) === null) {
    const s = p.settings
    await saveSettings(db, {
      apiaryName: s.apiaryName,
      orderMode: s.orderMode,
      contactEmail: s.contactEmail,
      contactPhone: s.contactPhone,
      socialLinks: s.socialLinks,
      heroTaglinePl: s.heroTagline.pl,
      heroTaglineEn: s.heroTagline.en,
      aboutStoryPl: s.aboutStory.pl,
      aboutStoryEn: s.aboutStory.en,
    })
    seeded.push('settings')
  }
  if ((await getPaymentInfo(db)) === null) {
    const pay = p.paymentInfo
    await savePaymentInfo(db, {
      accountHolder: pay.accountHolder,
      bankName: pay.bankName,
      accountNumber: pay.accountNumber,
      transferTitleHintPl: pay.transferTitleHint.pl,
      transferTitleHintEn: pay.transferTitleHint.en,
    })
    seeded.push('payment info')
  }
  if ((await count(products)) === 0) {
    await db.insert(products).values(
      p.products.map((product) => ({
        namePl: product.name.pl,
        nameEn: product.name.en,
        descriptionPl: product.description.pl,
        descriptionEn: product.description.en,
        size: product.size,
        priceGrosze: product.priceGrosze,
        imageUrl: product.imageUrl,
        imageAltPl: product.imageAlt.pl,
        imageAltEn: product.imageAlt.en,
        available: product.available,
        featured: product.featured,
        sortOrder: product.sortOrder,
      })),
    )
    seeded.push('products')
  }
  if ((await count(deliveryOptions)) === 0) {
    await db.insert(deliveryOptions).values(
      p.deliveryOptions.map((option) => ({
        namePl: option.name.pl,
        nameEn: option.name.en,
        descriptionPl: option.description.pl,
        descriptionEn: option.description.en,
        priceGrosze: option.priceGrosze,
        requiresAddress: option.requiresAddress,
        enabled: option.enabled,
        sortOrder: option.sortOrder,
      })),
    )
    seeded.push('delivery options')
  }
  return seeded
}
