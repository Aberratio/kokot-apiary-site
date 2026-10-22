import { boolean, integer, jsonb, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())

export const orderModeEnum = pgEnum('order_mode', ['form', 'contact'])
export const orderStatusEnum = pgEnum('order_status', ['new', 'paid', 'shipped'])

export const products = pgTable('products', {
  id: id(),
  namePl: text('name_pl').notNull(),
  nameEn: text('name_en').notNull(),
  descriptionPl: text('description_pl').notNull().default(''),
  descriptionEn: text('description_en').notNull().default(''),
  size: text('size').notNull().default(''),
  priceGrosze: integer('price_grosze').notNull(),
  imageUrl: text('image_url'),
  imageAltPl: text('image_alt_pl').notNull().default(''),
  imageAltEn: text('image_alt_en').notNull().default(''),
  available: boolean('available').notNull().default(true),
  featured: boolean('featured').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: updatedAt(),
})

/** A single row (id 1): there is one bank account. */
export const paymentInfo = pgTable('payment_info', {
  id: integer('id').primaryKey().default(1),
  accountHolder: text('account_holder').notNull(),
  bankName: text('bank_name').notNull(),
  accountNumber: text('account_number').notNull(),
  transferTitleHintPl: text('transfer_title_hint_pl').notNull().default(''),
  transferTitleHintEn: text('transfer_title_hint_en').notNull().default(''),
  updatedAt: updatedAt(),
})

export const deliveryOptions = pgTable('delivery_options', {
  id: id(),
  namePl: text('name_pl').notNull(),
  nameEn: text('name_en').notNull(),
  descriptionPl: text('description_pl').notNull().default(''),
  descriptionEn: text('description_en').notNull().default(''),
  priceGrosze: integer('price_grosze').notNull().default(0),
  /** Shipping needs an address; pickup does not. */
  requiresAddress: boolean('requires_address').notNull().default(true),
  enabled: boolean('enabled').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: updatedAt(),
})

export interface SocialLinkValue {
  label: string
  url: string
}

/** A single row (id 1): site-wide settings and section copy. */
export const settings = pgTable('settings', {
  id: integer('id').primaryKey().default(1),
  apiaryName: text('apiary_name').notNull(),
  orderMode: orderModeEnum('order_mode').notNull().default('contact'),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone').notNull().default(''),
  socialLinks: jsonb('social_links').$type<SocialLinkValue[]>().notNull().default([]),
  heroTaglinePl: text('hero_tagline_pl').notNull().default(''),
  heroTaglineEn: text('hero_tagline_en').notNull().default(''),
  aboutStoryPl: text('about_story_pl').notNull().default(''),
  aboutStoryEn: text('about_story_en').notNull().default(''),
  updatedAt: updatedAt(),
})

export interface OrderItemValue {
  productId: string
  name: string
  size: string
  unitPriceGrosze: number
  quantity: number
}

/** Orders keep a snapshot of names and prices, so later price edits never change them. */
export const orders = pgTable('orders', {
  id: id(),
  number: integer('number').generatedAlwaysAsIdentity({ startWith: 1001 }).notNull().unique(),
  customerName: text('customer_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull().default(''),
  deliveryOptionId: text('delivery_option_id'),
  deliveryName: text('delivery_name').notNull(),
  deliveryPriceGrosze: integer('delivery_price_grosze').notNull(),
  items: jsonb('items').$type<OrderItemValue[]>().notNull(),
  totalGrosze: integer('total_grosze').notNull(),
  locale: text('locale').notNull().default('pl'),
  note: text('note').notNull().default(''),
  status: orderStatusEnum('status').notNull().default('new'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: updatedAt(),
})

/**
 * Fixed-window counters for rate limiting public forms and the admin login. The key is a hash
 * of the form name and the client IP, so no raw IP is stored.
 */
export const rateLimits = pgTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull(),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
})
