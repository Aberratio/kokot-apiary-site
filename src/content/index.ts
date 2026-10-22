import { placeholderContent } from './placeholder'
import type { SiteContent } from './types'

/** The placeholder content in the shape the page renders: sorted, disabled options left out. */
export function placeholderSiteContent(): SiteContent {
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
