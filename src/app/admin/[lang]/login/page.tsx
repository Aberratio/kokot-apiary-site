import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { isAdmin } from '@/auth/session'
import { loginAction } from '@/cms/actions'
import styles from '@/components/admin/admin.module.css'
import { LoginForm } from '@/components/admin/forms'
import { getAdminDictionary } from '@/i18n/admin'
import { isLocale } from '@/i18n/config'

export default function LoginPage({ params }: PageProps<'/admin/[lang]/login'>) {
  return (
    <main className={styles.login}>
      <Suspense>
        <Login params={params} />
      </Suspense>
    </main>
  )
}

async function Login({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : 'pl'
  // Already logged in: nothing to do here.
  if (await isAdmin()) redirect(`/admin/${locale}`)
  const dict = getAdminDictionary(locale)
  return (
    <>
      <h1>{dict.login.title}</h1>
      <LoginForm action={loginAction.bind(null, locale)} dict={dict} />
    </>
  )
}
