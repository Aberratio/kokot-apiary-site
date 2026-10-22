import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'
import * as schema from './schema'

/** Any Postgres-backed Drizzle database with this schema: Neon in the app, PGlite in tests. */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>

let cached: Db | null | undefined

/**
 * The app's database, or null when `DATABASE_URL` is not set (CI, a build without secrets).
 * Callers decide what null means: the public page falls back to placeholders, /admin says
 * the database is not configured.
 */
export function getDb(): Db | null {
  if (cached === undefined) {
    const url = process.env.DATABASE_URL
    cached = url ? (drizzle(neon(url), { schema }) as unknown as Db) : null
  }
  return cached
}
