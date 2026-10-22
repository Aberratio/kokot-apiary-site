import { placeholderSiteContent } from '@/content'
import type { Db } from '@/db/client'
import { createTestDb } from '@/db/test-db'
import { calculateOrder, itemsFromForm, MAX_QUANTITY } from './calculate'
import { consumeRateLimit, clientIpFrom, rateLimitKey } from './rate-limit'
import { createOrder, listOrders, updateOrderStatus } from './repo'
import { contactSchema, isBot, orderCustomerSchema, parsePublicForm } from './validation'

const catalogue = placeholderSiteContent()
// Placeholders: acacia 60 zł (available), linden 55 zł (available), wildflower (unavailable).
// Delivery: pickup 0 zł (no address), parcel locker 18 zł, courier 22 zł.

function form(values: Record<string, string>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(values)) data.set(key, value)
  return data
}

describe('calculateOrder', () => {
  it('prices lines and delivery from the catalogue', () => {
    const result = calculateOrder(
      {
        items: [
          { productId: 'acacia', quantity: 2 },
          { productId: 'linden', quantity: 1 },
          { productId: 'courier', quantity: 0 },
        ],
        deliveryOptionId: 'parcel-locker',
      },
      catalogue,
      'en',
    )
    expect(result).toMatchObject({
      ok: true,
      subtotalGrosze: 2 * 6000 + 5500,
      totalGrosze: 2 * 6000 + 5500 + 1800,
      lines: [
        { productId: 'acacia', name: 'Acacia honey', unitPriceGrosze: 6000, quantity: 2 },
        { productId: 'linden', name: 'Linden honey', quantity: 1 },
      ],
    })
  })

  it.each([
    [[], 'pickup', 'emptyOrder'],
    [[{ productId: 'acacia', quantity: 0 }], 'pickup', 'emptyOrder'],
    [[{ productId: 'multiflower', quantity: 1 }], 'pickup', 'unavailableProduct'],
    [[{ productId: 'made-up', quantity: 1 }], 'pickup', 'unavailableProduct'],
    [[{ productId: 'acacia', quantity: MAX_QUANTITY + 1 }], 'pickup', 'tooMany'],
    [[{ productId: 'acacia', quantity: 1.5 }], 'pickup', 'tooMany'],
    [[{ productId: 'acacia', quantity: 1 }], 'teleport', 'unknownDelivery'],
  ])('rejects items %j with delivery %s as %s', (items, deliveryOptionId, problem) => {
    expect(calculateOrder({ items, deliveryOptionId }, catalogue, 'pl')).toEqual({
      ok: false,
      problem,
    })
  })
})

describe('itemsFromForm', () => {
  it('reads qty.<id> fields and treats junk as zero', () => {
    expect(
      itemsFromForm(form({ 'qty.acacia': '2', 'qty.linden': '', 'qty.x': 'abc', name: 'Jan' })),
    ).toEqual([
      { productId: 'acacia', quantity: 2 },
      { productId: 'linden', quantity: 0 },
      { productId: 'x', quantity: 0 },
    ])
  })
})

describe('public form validation', () => {
  const customer = {
    name: 'Jan Kowalski',
    email: 'jan@example.com',
    phone: '+48 600 000 000',
    deliveryOptionId: 'pickup',
  }

  it('accepts a complete order form', () => {
    const result = parsePublicForm(orderCustomerSchema, form(customer))
    expect(result.ok && result.data).toMatchObject({ ...customer, address: '', note: '' })
  })

  it('names bad fields with dictionary keys', () => {
    const result = parsePublicForm(
      orderCustomerSchema,
      form({ ...customer, name: '', email: 'jan@', phone: 'call me' }),
    )
    expect(!result.ok && result.errors).toEqual({
      name: 'required',
      email: 'invalidEmail',
      phone: 'invalidPhone',
    })
  })

  it('requires every contact field', () => {
    const result = parsePublicForm(contactSchema, form({ name: 'Jan', email: 'jan@example.com' }))
    expect(!result.ok && result.errors).toEqual({ message: 'required' })
  })

  it('spots a filled honeypot', () => {
    expect(isBot(form({ website: 'http://spam' }))).toBe(true)
    expect(isBot(form({ website: '' }))).toBe(false)
    expect(isBot(form({}))).toBe(false)
  })
})

describe('with a database', () => {
  let db: Db
  let close: () => Promise<void>
  beforeEach(async () => {
    ;({ db, close } = await createTestDb())
  })
  afterEach(() => close())

  it('rate-limits per key and restarts after the window', async () => {
    const limit = { max: 2, windowSeconds: 60 }
    const key = rateLimitKey('order', '203.0.113.7')
    const t0 = new Date('2026-10-22T10:00:00Z')
    expect(await consumeRateLimit(db, key, limit, t0)).toBe(true)
    expect(await consumeRateLimit(db, key, limit, t0)).toBe(true)
    expect(await consumeRateLimit(db, key, limit, t0)).toBe(false)
    // Another client is counted separately.
    expect(await consumeRateLimit(db, rateLimitKey('order', '203.0.113.8'), limit, t0)).toBe(true)
    // A minute later the window restarts.
    expect(await consumeRateLimit(db, key, limit, new Date(t0.getTime() + 61_000))).toBe(true)
  })

  it('numbers orders from 1001 and changes their status', async () => {
    const order = {
      customerName: 'Jan',
      email: 'jan@example.com',
      phone: '600000000',
      address: '',
      note: '',
      deliveryOptionId: 'pickup',
      deliveryName: 'Odbiór osobisty',
      deliveryPriceGrosze: 0,
      items: [
        { productId: 'acacia', name: 'Miód', size: '900 g', unitPriceGrosze: 6000, quantity: 1 },
      ],
      totalGrosze: 6000,
      locale: 'pl' as const,
    }
    const first = await createOrder(db, order)
    const second = await createOrder(db, order)
    expect([first.number, second.number]).toEqual([1001, 1002])

    expect(await updateOrderStatus(db, first.id, 'paid')).toBe(true)
    expect(await updateOrderStatus(db, 'missing', 'paid')).toBe(false)
    const rows = await listOrders(db)
    expect(rows.find((row) => row.id === first.id)?.status).toBe('paid')
    expect(rows[0]?.items[0]?.unitPriceGrosze).toBe(6000)
  })
})

describe('clientIpFrom', () => {
  it('takes the first forwarded address, then x-real-ip', () => {
    expect(clientIpFrom(new Headers({ 'x-forwarded-for': '1.1.1.1, 10.0.0.1' }))).toBe('1.1.1.1')
    expect(clientIpFrom(new Headers({ 'x-real-ip': '2.2.2.2' }))).toBe('2.2.2.2')
    expect(clientIpFrom(new Headers())).toBe('unknown')
  })
})
