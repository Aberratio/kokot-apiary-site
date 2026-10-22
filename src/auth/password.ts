import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto'

// scrypt from Node's standard library: no dependency, memory-hard, and fine for one account.
const KEY_LENGTH = 64
const COST = { N: 16384, r: 8, p: 1 } satisfies ScryptOptions

function derive(password: string, salt: Buffer, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, options, (error, key) =>
      error ? reject(error) : resolve(key),
    )
  })
}

/**
 * Hash for `ADMIN_PASSWORD_HASH`: `scrypt.N.r.p.<salt>.<hash>`, base64url parts. Dots, not
 * dollar signs: Next expands `$name` inside .env files and would mangle the value.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await derive(password, salt, COST)
  return [
    'scrypt',
    COST.N,
    COST.r,
    COST.p,
    salt.toString('base64url'),
    key.toString('base64url'),
  ].join('.')
}

/** Checks a password against a stored hash in constant time. A malformed hash never matches. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, salt, hash] = stored.split('.')
  if (scheme !== 'scrypt' || !salt || !hash) return false
  const expected = Buffer.from(hash, 'base64url')
  if (expected.length !== KEY_LENGTH) return false
  const options = { N: Number(n), r: Number(r), p: Number(p) }
  if (![options.N, options.r, options.p].every(Number.isInteger)) return false
  const actual = await derive(password, Buffer.from(salt, 'base64url'), options)
  return timingSafeEqual(actual, expected)
}
