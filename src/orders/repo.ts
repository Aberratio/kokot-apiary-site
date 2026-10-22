import { desc, eq } from 'drizzle-orm'
import type { Db } from '@/db/client'
import { orders } from '@/db/schema'
import type { Locale } from '@/i18n/config'
import type { OrderLine } from './calculate'

export type OrderStatus = (typeof orders.$inferSelect)['status']
export const ORDER_STATUSES: OrderStatus[] = ['new', 'paid', 'shipped']

export interface NewOrder {
  customerName: string
  email: string
  phone: string
  address: string
  note: string
  deliveryOptionId: string
  deliveryName: string
  deliveryPriceGrosze: number
  items: OrderLine[]
  totalGrosze: number
  locale: Locale
}

/** Stores an order and returns its id and the human-facing number used in the transfer title. */
export async function createOrder(
  db: Db,
  order: NewOrder,
): Promise<{ id: string; number: number }> {
  const [row] = await db
    .insert(orders)
    .values(order)
    .returning({ id: orders.id, number: orders.number })
  return row!
}

export function listOrders(db: Db) {
  return db.select().from(orders).orderBy(desc(orders.createdAt), desc(orders.number))
}

export async function updateOrderStatus(db: Db, id: string, status: OrderStatus): Promise<boolean> {
  const rows = await db
    .update(orders)
    .set({ status })
    .where(eq(orders.id, id))
    .returning({ id: orders.id })
  return rows.length > 0
}
