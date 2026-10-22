// Fills an empty database with the placeholder content. Never overwrites existing rows.
// Usage: npm run db:seed  (reads DATABASE_URL)
import { getDb } from '../src/db/client'
import { seedPlaceholders } from '../src/db/repo'

const db = getDb()
if (!db) {
  console.error('db:seed: DATABASE_URL is not set')
  process.exit(2)
}
const seeded = await seedPlaceholders(db)
console.log(seeded.length ? `db:seed: seeded ${seeded.join(', ')}` : 'db:seed: nothing to seed')
