import { createHmac, timingSafeEqual } from 'node:crypto'

/** Admin sessions last a week; logging out clears the cookie sooner. */
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

/**
 * A session token: `admin.<expiry seconds>.<HMAC>`. There is one admin, so the token only
 * needs to prove it was issued by this server and has not expired.
 */
export function createSessionToken(secret: string, nowMs: number): string {
  const payload = `admin.${Math.floor(nowMs / 1000) + SESSION_TTL_SECONDS}`
  return `${payload}.${sign(payload, secret)}`
}

export function verifySessionToken(token: string, secret: string, nowMs: number): boolean {
  const lastDot = token.lastIndexOf('.')
  if (lastDot < 0) return false
  const payload = token.slice(0, lastDot)
  const signature = Buffer.from(token.slice(lastDot + 1))
  const expected = Buffer.from(sign(payload, secret))
  if (signature.length !== expected.length || !timingSafeEqual(signature, expected)) return false
  const [subject, expiry] = payload.split('.')
  return subject === 'admin' && Number(expiry) * 1000 > nowMs
}
