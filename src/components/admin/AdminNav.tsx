'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { locales, type Locale } from '@/i18n/config'
import type { AdminDictionary } from '@/i18n/admin'
import styles from './admin.module.css'

const sections = ['', 'products', 'delivery', 'payment', 'settings'] as const

interface AdminNavProps {
  lang: Locale
  dict: AdminDictionary
}

/**
 * The admin's section links and its language switch, which keeps the current page. The path
 * is only known at request time, so until it streams in the links render without the
 * current-page mark.
 */
export function AdminNav(props: AdminNavProps) {
  return (
    <Suspense fallback={<NavLinks {...props} pathname="" />}>
      <CurrentNav {...props} />
    </Suspense>
  )
}

function CurrentNav(props: AdminNavProps) {
  return <NavLinks {...props} pathname={usePathname() ?? ''} />
}

function NavLinks({ lang, dict, pathname }: AdminNavProps & { pathname: string }) {
  const labels = {
    '': dict.nav.dashboard,
    products: dict.nav.products,
    delivery: dict.nav.delivery,
    payment: dict.nav.payment,
    settings: dict.nav.settings,
  }
  const rest = pathname.split('/').slice(3).join('/')
  return (
    <>
      <nav aria-label={dict.nav.label} className={styles.nav}>
        <ul>
          {sections.map((section) => {
            const href = `/admin/${lang}${section ? `/${section}` : ''}`
            const current = section ? pathname.startsWith(href) : pathname === href
            return (
              <li key={section}>
                <Link href={href} aria-current={current ? 'page' : undefined}>
                  {labels[section]}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <nav aria-label={dict.languageLabel} className={styles.nav}>
        <ul>
          {locales.map((locale) => (
            <li key={locale}>
              <Link
                href={`/admin/${locale}${rest ? `/${rest}` : ''}`}
                hrefLang={locale}
                lang={locale}
                aria-current={locale === lang ? 'page' : undefined}
              >
                {locale.toUpperCase()}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
