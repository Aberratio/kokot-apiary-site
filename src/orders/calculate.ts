import type { DeliveryOption, Product } from '@/content/types'
import type { Locale } from '@/i18n/config'

export const MAX_QUANTITY = 20

export interface RequestedItem {
  productId: string
  quantity: number
}

export interface OrderLine {
  productId: string
  name: string
  size: string
  unitPriceGrosze: number
  quantity: number
}

export type OrderProblem = 'emptyOrder' | 'unavailableProduct' | 'unknownDelivery' | 'tooMany'

export type OrderCalculation =
  | {
      ok: true
      lines: OrderLine[]
      delivery: DeliveryOption
      subtotalGrosze: number
      totalGrosze: number
    }
  | { ok: false; problem: OrderProblem }

/**
 * Prices an order from the catalogue, never from what the browser sent. Used on the server to
 * store the order, and in the browser only to preview the total.
 */
export function calculateOrder(
  request: { items: RequestedItem[]; deliveryOptionId: string },
  catalogue: { products: Product[]; deliveryOptions: DeliveryOption[] },
  locale: Locale,
): OrderCalculation {
  const items = request.items.filter((item) => item.quantity > 0)
  if (items.length === 0) return { ok: false, problem: 'emptyOrder' }

  const lines: OrderLine[] = []
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity > MAX_QUANTITY) {
      return { ok: false, problem: 'tooMany' }
    }
    const product = catalogue.products.find((p) => p.id === item.productId)
    if (!product || !product.available) return { ok: false, problem: 'unavailableProduct' }
    lines.push({
      productId: product.id,
      name: product.name[locale],
      size: product.size,
      unitPriceGrosze: product.priceGrosze,
      quantity: item.quantity,
    })
  }

  const delivery = catalogue.deliveryOptions.find(
    (option) => option.id === request.deliveryOptionId && option.enabled,
  )
  if (!delivery) return { ok: false, problem: 'unknownDelivery' }

  const subtotalGrosze = lines.reduce((sum, line) => sum + line.unitPriceGrosze * line.quantity, 0)
  return {
    ok: true,
    lines,
    delivery,
    subtotalGrosze,
    totalGrosze: subtotalGrosze + delivery.priceGrosze,
  }
}

/** Reads `qty.<productId>` fields from the order form. Junk counts as zero. */
export function itemsFromForm(formData: FormData): RequestedItem[] {
  const items: RequestedItem[] = []
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('qty.') || typeof value !== 'string') continue
    const quantity = Number(value.trim() || '0')
    items.push({ productId: key.slice(4), quantity: Number.isFinite(quantity) ? quantity : 0 })
  }
  return items
}
