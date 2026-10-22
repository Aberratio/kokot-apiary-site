import 'server-only'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/auth/session'
import { getDb } from '@/db/client'
import type { deliveryOptions, paymentInfo, products, settings } from '@/db/schema'
import { getAdminDictionary } from '@/i18n/admin'
import { isLocale } from '@/i18n/config'
import { formatGroszeForInput } from './validation'

/**
 * Everything a protected admin page needs: the language, its copy, a verified session and the
 * database (null when not configured). Call it inside the page's Suspense boundary, because
 * the session check reads the request's cookies.
 */
export async function adminContext(params: Promise<{ lang: string }>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  await requireAdmin(lang)
  return { lang, dict: getAdminDictionary(lang), db: getDb() }
}

const flag = (value: boolean) => (value ? 'on' : '')

// Stored rows to form values (strings, as the browser sends them back).

export function productToForm(row: typeof products.$inferSelect): Record<string, string> {
  return {
    namePl: row.namePl,
    nameEn: row.nameEn,
    descriptionPl: row.descriptionPl,
    descriptionEn: row.descriptionEn,
    size: row.size,
    priceGrosze: formatGroszeForInput(row.priceGrosze),
    imageAltPl: row.imageAltPl,
    imageAltEn: row.imageAltEn,
    available: flag(row.available),
    featured: flag(row.featured),
    sortOrder: String(row.sortOrder),
  }
}

export function deliveryToForm(row: typeof deliveryOptions.$inferSelect): Record<string, string> {
  return {
    namePl: row.namePl,
    nameEn: row.nameEn,
    descriptionPl: row.descriptionPl,
    descriptionEn: row.descriptionEn,
    priceGrosze: formatGroszeForInput(row.priceGrosze),
    requiresAddress: flag(row.requiresAddress),
    enabled: flag(row.enabled),
    sortOrder: String(row.sortOrder),
  }
}

export function paymentToForm(row: typeof paymentInfo.$inferSelect | null): Record<string, string> {
  return row
    ? {
        accountHolder: row.accountHolder,
        bankName: row.bankName,
        accountNumber: row.accountNumber,
        transferTitleHintPl: row.transferTitleHintPl,
        transferTitleHintEn: row.transferTitleHintEn,
      }
    : {}
}

export function settingsToForm(row: typeof settings.$inferSelect | null): Record<string, string> {
  if (!row) return { orderMode: 'contact' }
  return {
    apiaryName: row.apiaryName,
    orderMode: row.orderMode,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    socialLinks: row.socialLinks.map((link) => `${link.label} | ${link.url}`).join('\n'),
    heroTaglinePl: row.heroTaglinePl,
    heroTaglineEn: row.heroTaglineEn,
    aboutStoryPl: row.aboutStoryPl,
    aboutStoryEn: row.aboutStoryEn,
  }
}
