// Applies pending migrations from ./drizzle to DATABASE_URL. Skips when it is not set, so a
// build without a database (CI, a fork) still works.
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { migrate } from 'drizzle-orm/neon-http/migrator'

const url = process.env.DATABASE_URL
if (!url) {
  console.log('db:migrate: DATABASE_URL is not set, skipping')
  process.exit(0)
}
await migrate(drizzle(neon(url)), { migrationsFolder: './drizzle' })
console.log('db:migrate: up to date')
