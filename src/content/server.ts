import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { getDb } from '@/db/client'
import { readSiteContent } from '@/db/repo'
import { placeholderSiteContent } from '.'
import type { SiteContent } from './types'

/** Tag on everything the public page reads from the CMS. Saving in /admin updates it. */
export const SITE_CONTENT_TAG = 'site-content'

/**
 * Everything the public page shows, cached until the CMS saves something. Without a database
 * (CI, a build with no secrets) the placeholders render instead.
 */
export async function getSiteContent(): Promise<SiteContent> {
  'use cache'
  cacheTag(SITE_CONTENT_TAG)
  cacheLife('max')
  const db = getDb()
  return db ? readSiteContent(db) : placeholderSiteContent()
}
