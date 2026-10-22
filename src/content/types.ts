import type { Locale } from '@/i18n/config'

/** A text field the CMS keeps in every language. */
export type Localized = Record<Locale, string>

export interface Product {
  id: string
  name: Localized
  description: Localized
  /** Jar or pack size as shown to customers, e.g. "900 g". */
  size: string
  /** Price in grosze, so sums never hit floating-point rounding. */
  priceGrosze: number
  imageUrl: string | null
  imageAlt: Localized
  available: boolean
  featured: boolean
  sortOrder: number
}

export interface PaymentInfo {
  accountHolder: string
  bankName: string
  accountNumber: string
  transferTitleHint: Localized
}

export interface DeliveryOption {
  id: string
  name: Localized
  description: Localized
  priceGrosze: number
  requiresAddress: boolean
  enabled: boolean
  sortOrder: number
}

export type OrderMode = 'form' | 'contact'

export interface SocialLink {
  label: string
  url: string
}

export interface Settings {
  apiaryName: string
  orderMode: OrderMode
  contactEmail: string
  contactPhone: string
  socialLinks: SocialLink[]
  heroTagline: Localized
  aboutStory: Localized
}

export interface SiteContent {
  settings: Settings
  products: Product[]
  paymentInfo: PaymentInfo
  deliveryOptions: DeliveryOption[]
}

export function localize(text: Localized, locale: Locale): string {
  return text[locale]
}
