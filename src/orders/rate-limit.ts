import { createHash } from 'node:crypto'
import { sql } from 'drizzle-orm'
import type { Db } from '@/db/client'
import { rateLimits } from '@/db/schema'

export interface Limit {
  /** Requests allowed per window. */
  max: number
  windowSeconds: number
}

export const LIMITS = {
  order: { max: 5, windowSeconds: 600 },
  contact: { max: 5, windowSeconds: 600 },
  login: { max: 10, windowSeconds: 900 },
} satisfies Record<string, Limit>

/** A stable key for a form and a client, without storing the client's IP. */
export function rateLimitKey(form: string, clientIp: string): string {
  return createHash('sha256').update(`${form}\n${clientIp}`).digest('base64url')
}

/**
 * Counts one request and says whether it is allowed. One atomic upsert per request: the window
 * restarts once it is older than `windowSeconds`. Works the same on every serverless instance,
 * because the count lives in Postgres.
 */
export async function consumeRateLimit(
  db: Db,
  key: string,
  limit: Limit,
  now: Date = new Date(),
): Promise<boolean> {
  const windowStartedBefore = new Date(now.getTime() - limit.windowSeconds * 1000)
  const expired = sql`${rateLimits.windowStart} < ${windowStartedBefore.toISOString()}::timestamptz`
  const [row] = await db
    .insert(rateLimits)
    .values({ key, count: 1, windowStart: now })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${expired} then 1 else ${rateLimits.count} + 1 end`,
        windowStart: sql`case when ${expired} then ${now.toISOString()}::timestamptz else ${rateLimits.windowStart} end`,
      },
    })
    .returning({ count: rateLimits.count })
  return (row?.count ?? 1) <= limit.max
}

/** The client IP as Vercel reports it, or a shared bucket when it is missing. */
export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || headers.get('x-real-ip') || 'unknown'
}
