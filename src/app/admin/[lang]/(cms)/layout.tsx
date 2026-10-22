import Link from 'next/link'
import { notFound } from 'next/navigation'
import { logoutAction } from '@/cms/actions'
import { AdminNav } from '@/components/admin/AdminNav'
import styles from '@/components/admin/admin.module.css'
import { getAdminDictionary } from '@/i18n/admin'
import { isLocale } from '@/i18n/config'

/**
 * The chrome around every protected admin page. It holds no data and no session read, so it
 * stays in the static shell; each page checks the session itself inside its Suspense boundary.
 */
export default async function CmsLayout({ children, params }: LayoutProps<'/admin/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const dict = getAdminDictionary(lang)
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href={`/admin/${lang}`} className={styles.brand}>
          {dict.title}
        </Link>
        <AdminNav lang={lang} dict={dict} />
        <Link href={`/${lang}`}>{dict.nav.viewSite}</Link>
        <form action={logoutAction.bind(null, lang)}>
          <button type="submit" className={styles.secondary}>
            {dict.nav.logout}
          </button>
        </form>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
