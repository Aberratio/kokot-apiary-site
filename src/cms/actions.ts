'use server'

import { updateTag } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { clientIpFrom, consumeRateLimit, LIMITS, rateLimitKey } from '@/orders/rate-limit'
import { ORDER_STATUSES, updateOrderStatus, type OrderStatus } from '@/orders/repo'
import { logIn, logOut, requireAdmin } from '@/auth/session'
import { SITE_CONTENT_TAG } from '@/content/server'
import { getDb } from '@/db/client'
import {
  deleteDeliveryOption,
  deleteProduct,
  saveDeliveryOption,
  savePaymentInfo,
  saveProduct,
  saveSettings,
} from '@/db/repo'
import type { AdminErrorKey } from '@/i18n/admin'
import { isLocale, type Locale } from '@/i18n/config'
import { uploadProductImage } from './images'
import {
  deliveryOptionSchema,
  parseForm,
  paymentInfoSchema,
  productSchema,
  settingsSchema,
} from './validation'

export interface FormState {
  errors?: Partial<Record<string, AdminErrorKey>>
  message?: 'fixErrors' | 'notFound' | 'dbMissing' | 'wrongPassword' | 'notConfigured' | 'tooMany'
  saved?: boolean
  /** What was submitted, so a form that failed validation keeps the user's input. */
  values?: Record<string, string>
}

// Bound arguments come back from the browser, so they are checked like any other input.
function locale(value: unknown): Locale {
  return typeof value === 'string' && isLocale(value) ? value : 'pl'
}

function submitted(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') values[key] = value
  }
  return values
}

/** Every write starts here: a valid session and a configured database. */
async function guard(lang: Locale) {
  await requireAdmin(lang)
  return getDb()
}

function invalid(formData: FormData, errors: FormState['errors']): FormState {
  return { errors, message: 'fixErrors', values: submitted(formData) }
}

// Session

export async function loginAction(
  lang: string,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = formData.get('password')
  if (!process.env.ADMIN_PASSWORD_HASH || !process.env.SESSION_SECRET) {
    return { message: 'notConfigured' }
  }
  const db = getDb()
  if (db) {
    const key = rateLimitKey('login', clientIpFrom(await headers()))
    if (!(await consumeRateLimit(db, key, LIMITS.login))) return { message: 'tooMany' }
  }
  if (typeof password !== 'string' || !(await logIn(password))) {
    return { message: 'wrongPassword' }
  }
  redirect(`/admin/${locale(lang)}`)
}

export async function logoutAction(lang: string): Promise<void> {
  await logOut()
  redirect(`/admin/${locale(lang)}/login`)
}

// Orders

export async function updateOrderStatusAction(
  lang: string,
  id: string,
  formData: FormData,
): Promise<void> {
  const l = locale(lang)
  const db = await guard(l)
  const status = formData.get('status')
  if (db && ORDER_STATUSES.includes(status as OrderStatus)) {
    await updateOrderStatus(db, id, status as OrderStatus)
  }
  redirect(`/admin/${l}/orders?saved=1`)
}

// Products

export async function saveProductAction(
  lang: string,
  id: string | null,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const l = locale(lang)
  const db = await guard(l)
  if (!db) return { message: 'dbMissing', values: submitted(formData) }

  const parsed = parseForm(productSchema, formData)
  if (!parsed.ok) return invalid(formData, parsed.errors)

  let imageUrl: string | null | undefined
  const photo = formData.get('photo')
  if (photo instanceof File && photo.size > 0) {
    const upload = await uploadProductImage(photo)
    if ('error' in upload) return invalid(formData, { photo: upload.error })
    imageUrl = upload.url
  } else if (formData.get('removePhoto') === 'on') {
    imageUrl = null
  }

  const savedId = await saveProduct(db, parsed.data, { id: id ?? undefined, imageUrl })
  if (!savedId) return { message: 'notFound' }
  updateTag(SITE_CONTENT_TAG)
  redirect(`/admin/${l}/products?saved=1`)
}

export async function deleteProductAction(lang: string, id: string): Promise<void> {
  const l = locale(lang)
  const db = await guard(l)
  if (db) {
    await deleteProduct(db, id)
    updateTag(SITE_CONTENT_TAG)
  }
  redirect(`/admin/${l}/products`)
}

// Delivery options

export async function saveDeliveryAction(
  lang: string,
  id: string | null,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const l = locale(lang)
  const db = await guard(l)
  if (!db) return { message: 'dbMissing', values: submitted(formData) }
  const parsed = parseForm(deliveryOptionSchema, formData)
  if (!parsed.ok) return invalid(formData, parsed.errors)
  const savedId = await saveDeliveryOption(db, parsed.data, id ?? undefined)
  if (!savedId) return { message: 'notFound' }
  updateTag(SITE_CONTENT_TAG)
  redirect(`/admin/${l}/delivery?saved=1`)
}

export async function deleteDeliveryAction(lang: string, id: string): Promise<void> {
  const l = locale(lang)
  const db = await guard(l)
  if (db) {
    await deleteDeliveryOption(db, id)
    updateTag(SITE_CONTENT_TAG)
  }
  redirect(`/admin/${l}/delivery`)
}

// Singletons: they stay on their page and say "saved".

export async function savePaymentAction(
  lang: string,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const db = await guard(locale(lang))
  if (!db) return { message: 'dbMissing', values: submitted(formData) }
  const parsed = parseForm(paymentInfoSchema, formData)
  if (!parsed.ok) return invalid(formData, parsed.errors)
  await savePaymentInfo(db, parsed.data)
  updateTag(SITE_CONTENT_TAG)
  return { saved: true, values: submitted(formData) }
}

export async function saveSettingsAction(
  lang: string,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const db = await guard(locale(lang))
  if (!db) return { message: 'dbMissing', values: submitted(formData) }
  const parsed = parseForm(settingsSchema, formData)
  if (!parsed.ok) return invalid(formData, parsed.errors)
  await saveSettings(db, parsed.data)
  updateTag(SITE_CONTENT_TAG)
  return { saved: true, values: submitted(formData) }
}
