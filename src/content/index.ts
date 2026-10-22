import { placeholderContent } from './placeholder'
import type { SiteContent } from './types'

/**
 * Everything the public page shows. Reads placeholders for now; Phase 2 swaps this for the
 * database without changing the callers.
 */
export async function getSiteContent(): Promise<SiteContent> {
  const content = placeholderContent
  return {
    ...content,
    products: [...content.products].sort((a, b) => a.sortOrder - b.sortOrder),
    deliveryOptions: content.deliveryOptions
      .filter((option) => option.enabled)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }
}

export type * from './types'
export { localize } from './types'
