import { hashPassword, verifyPassword } from './password'
import { createSessionToken, SESSION_TTL_SECONDS, verifySessionToken } from './token'

describe('password', () => {
  it('verifies the right password and rejects others', async () => {
    const hash = await hashPassword('miód-i-pszczoły')
    expect(hash.startsWith('scrypt.')).toBe(true)
    expect(await verifyPassword('miód-i-pszczoły', hash)).toBe(true)
    expect(await verifyPassword('miod-i-pszczoly', hash)).toBe(false)
  })

  it('salts every hash', async () => {
    expect(await hashPassword('same')).not.toBe(await hashPassword('same'))
  })

  it.each(['', 'plain', 'scrypt.1.2.3.salt.short', 'bcrypt.a.b.c.d.e'])(
    'never matches the malformed hash %j',
    async (stored) => {
      expect(await verifyPassword('x', stored)).toBe(false)
    },
  )
})

describe('session token', () => {
  const secret = 'test-secret-that-is-long-enough'
  const now = Date.UTC(2026, 9, 22)

  it('is valid until it expires', () => {
    const token = createSessionToken(secret, now)
    expect(verifySessionToken(token, secret, now)).toBe(true)
    expect(verifySessionToken(token, secret, now + (SESSION_TTL_SECONDS - 1) * 1000)).toBe(true)
    expect(verifySessionToken(token, secret, now + SESSION_TTL_SECONDS * 1000)).toBe(false)
  })

  it('rejects another secret, an edited expiry and garbage', () => {
    const token = createSessionToken(secret, now)
    expect(verifySessionToken(token, 'other-secret', now)).toBe(false)
    const [subject, expiry, signature] = token.split('.')
    expect(verifySessionToken(`${subject}.${Number(expiry) + 999}.${signature}`, secret, now)).toBe(
      false,
    )
    expect(verifySessionToken('nonsense', secret, now)).toBe(false)
    expect(verifySessionToken('', secret, now)).toBe(false)
  })
})
