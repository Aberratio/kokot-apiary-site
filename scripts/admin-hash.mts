// Prints the ADMIN_PASSWORD_HASH value for a password, and a fresh SESSION_SECRET.
// Usage: npm run admin:hash -- '<password>'
import { randomBytes } from 'node:crypto'
import { hashPassword } from '../src/auth/password'

const password = process.argv[2]
if (!password || password.length < 12) {
  console.error('Give a password of at least 12 characters: npm run admin:hash -- "<password>"')
  process.exit(2)
}
console.log(`ADMIN_PASSWORD_HASH=${await hashPassword(password)}`)
console.log(`SESSION_SECRET=${randomBytes(32).toString('base64url')}`)
