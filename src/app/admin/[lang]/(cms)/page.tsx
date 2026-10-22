import Link from 'next/link'
import { Suspense } from 'react'
import { adminContext } from '@/cms/admin-context'
import styles from '@/components/admin/admin.module.css'
import { AdminLoading, DbMissing } from '@/components/admin/states'
import { listDeliveryOptions, listProducts } from '@/db/repo'

export default function DashboardPage({ params }: PageProps<'/admin/[lang]'>) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Dashboard params={params} />
    </Suspense>
  )
}

async function Dashboard({ params }: { params: Promise<{ lang: string }> }) {
  const { lang, dict, db } = await adminContext(params)
  const [products, delivery] = db
    ? await Promise.all([listProducts(db), listDeliveryOptions(db)])
    : [[], []]
  return (
    <>
      <h1>{dict.title}</h1>
      {!db && <DbMissing dict={dict} />}
      <p>{dict.dashboard.intro}</p>
      <ul className={styles.cards}>
        <li>
          <Link href={`/admin/${lang}/products`}>
            <strong>{products.length}</strong>
            {dict.dashboard.products}
          </Link>
        </li>
        <li>
          <Link href={`/admin/${lang}/delivery`}>
            <strong>{delivery.length}</strong>
            {dict.dashboard.delivery}
          </Link>
        </li>
        <li>
          <Link href={`/admin/${lang}/payment`}>{dict.nav.payment}</Link>
        </li>
        <li>
          <Link href={`/admin/${lang}/settings`}>{dict.nav.settings}</Link>
        </li>
      </ul>
    </>
  )
}
