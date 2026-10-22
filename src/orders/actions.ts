'use server'

import { headers } from 'next/headers'
import { getDb } from '@/db/client'
import { readSiteContent } from '@/db/repo'
import { contactEmail, orderConfirmationEmail, orderNotificationEmail } from '@/email/templates'
import { sendEmail } from '@/email/send'
import { placeholderSiteContent } from '@/content'
import { isLocale, type Locale } from '@/i18n/config'
import { calculateOrder, itemsFromForm } from './calculate'
import { clientIpFrom, consumeRateLimit, LIMITS, rateLimitKey } from './rate-limit'
import { createOrder } from './repo'
import {
  contactSchema,
  isBot,
  orderCustomerSchema,
  parsePublicForm,
  type PublicErrorKey,
} from './validation'

export type PublicFormMessage =
  | 'fixErrors'
  | 'tooMany'
  | 'unavailable'
  | 'sendFailed'
  | 'emptyOrder'
  | 'unavailableProduct'
  | 'tooManyItems'

export interface PublicFormState {
  status?: 'ordered' | 'sent'
  orderNumber?: number
  totalGrosze?: number
  errors?: Partial<Record<string, PublicErrorKey>>
  message?: PublicFormMessage
  /** What was submitted, so a failed form keeps the visitor's input. */
  values?: Record<string, string>
}

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

async function allowed(form: keyof typeof LIMITS): Promise<boolean> {
  const db = getDb()
  // No database, no shared counter: the honeypot is the only guard then.
  if (!db) return true
  const key = rateLimitKey(form, clientIpFrom(await headers()))
  return consumeRateLimit(db, key, LIMITS[form])
}

export async function submitOrderAction(
  lang: string,
  _state: PublicFormState,
  formData: FormData,
): Promise<PublicFormState> {
  const l = locale(lang)
  const values = submitted(formData)
  // Bots get a quiet "thanks" so they learn nothing; nothing is stored or sent.
  if (isBot(formData)) return { status: 'ordered' }

  const db = getDb()
  if (!db) return { message: 'unavailable', values }
  if (!(await allowed('order'))) return { message: 'tooMany', values }

  const content = await readSiteContent(db)
  if (content.settings.orderMode !== 'form') return { message: 'unavailable', values }

  const customer = parsePublicForm(orderCustomerSchema, formData)
  const calculation = calculateOrder(
    { items: itemsFromForm(formData), deliveryOptionId: values.deliveryOptionId ?? '' },
    content,
    l,
  )
  const errors = customer.ok ? {} : { ...customer.errors }
  if (calculation.ok && calculation.delivery.requiresAddress && !values.address?.trim()) {
    errors.address = 'required'
  }
  if (!calculation.ok && calculation.problem === 'unknownDelivery') {
    errors.deliveryOptionId = 'required'
  }
  if (!calculation.ok && calculation.problem !== 'unknownDelivery') {
    const message = calculation.problem === 'tooMany' ? 'tooManyItems' : calculation.problem
    return { message, errors, values }
  }
  if (!customer.ok || !calculation.ok || Object.keys(errors).length > 0) {
    return { message: 'fixErrors', errors, values }
  }

  const delivery = calculation.delivery
  const order = {
    customerName: customer.data.name,
    email: customer.data.email,
    phone: customer.data.phone,
    address: delivery.requiresAddress ? customer.data.address : '',
    note: customer.data.note,
    deliveryOptionId: delivery.id,
    deliveryName: delivery.name.pl,
    deliveryPriceGrosze: delivery.priceGrosze,
    items: calculation.lines,
    totalGrosze: calculation.totalGrosze,
    locale: l,
  }
  // The order is stored first: a failed email must never lose it.
  const { number } = await createOrder(db, order)
  const placed = { ...order, number, lines: calculation.lines }
  // Franciszek reads Polish; the customer reads the language they ordered in.
  await Promise.allSettled([
    sendEmail(orderNotificationEmail(placed, content.settings.contactEmail)),
    sendEmail(
      orderConfirmationEmail({ ...placed, deliveryName: delivery.name[l] }, content.paymentInfo),
    ),
  ])
  return { status: 'ordered', orderNumber: number, totalGrosze: calculation.totalGrosze }
}

export async function submitContactAction(
  lang: string,
  _state: PublicFormState,
  formData: FormData,
): Promise<PublicFormState> {
  const l = locale(lang)
  const values = submitted(formData)
  if (isBot(formData)) return { status: 'sent' }
  if (!(await allowed('contact'))) return { message: 'tooMany', values }

  const parsed = parsePublicForm(contactSchema, formData)
  if (!parsed.ok) return { message: 'fixErrors', errors: parsed.errors, values }

  const db = getDb()
  const { settings } = db ? await readSiteContent(db) : placeholderSiteContent()
  const result = await sendEmail(contactEmail({ ...parsed.data, locale: l }, settings.contactEmail))
  // A contact message exists only as the email, so a failed send has to be visible.
  if (result !== 'sent') return { message: 'sendFailed', values }
  return { status: 'sent' }
}
