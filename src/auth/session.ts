import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import type { Locale } from '@/i18n/config'
import { hashPassword, verifyPassword } from './password'
import { createSessionToken, SESSION_TTL_SECONDS, verifySessionToken } from './token'

const COOKIE = 'admin_session'

/** Present only when both admin secrets are configured; /admin refuses to work otherwise. */
export function authConfig(): { passwordHash: string; secret: string } | null {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH
  const secret = process.env.SESSION_SECRET
  if (!passwordHash || !secret || secret.length < 32) return null
  return { passwordHash, secret }
}

export async function isAdmin(): Promise<boolean> {
  const config = authConfig()
  if (!config) return false
  const token = (await cookies()).get(COOKIE)?.value
  // The expiry check needs the current time, which only exists at request time; this stops
  // Next from evaluating it while prerendering a route shell.
  await connection()
  return token ? verifySessionToken(token, config.secret, Date.now()) : false
}

/**
 * The gate for every admin page and Server Action. Call it close to the data, not only in a
 * layout: a Server Action can be invoked directly, without rendering any page.
 */
export async function requireAdmin(locale: Locale): Promise<void> {
  if (!(await isAdmin())) redirect(`/admin/${locale}/login`)
}

// A hash of a random password, so a wrong login costs the same time with or without config.
const decoy = hashPassword(crypto.randomUUID())

/** Checks the password and starts a session. Returns false on a wrong password. */
export async function logIn(password: string): Promise<boolean> {
  const config = authConfig()
  const ok = await verifyPassword(password, config?.passwordHash ?? (await decoy))
  if (!ok || !config) {
    // Slows down guessing; there is a single account to protect.
    await new Promise((resolve) => setTimeout(resolve, 800))
    return false
  }
  ;(await cookies()).set(COOKIE, createSessionToken(config.secret, Date.now()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })
  return true
}

export async function logOut(): Promise<void> {
  ;(await cookies()).delete(COOKIE)
}
