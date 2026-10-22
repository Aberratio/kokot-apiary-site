import Link from 'next/link'
import { Suspense } from 'react'
import { deleteProductAction } from '@/cms/actions'
import { adminContext } from '@/cms/admin-context'
import styles from '@/components/admin/admin.module.css'
import { DeleteButton } from '@/components/admin/form'
import { AdminLoading, DbMissing, Saved } from '@/components/admin/states'
import { listProducts } from '@/db/repo'
import { formatPrice } from '@/lib/money'

export default function ProductsPage({
  params,
  searchParams,
}: PageProps<'/admin/[lang]/products'>) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Products params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function Products({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { lang, dict, db } = await adminContext(params)
  const { saved } = await searchParams
  const t = dict.products
  const rows = db ? await listProducts(db) : []
  return (
    <>
      <div className={styles.toolbar}>
        <h1>{t.title}</h1>
        {db && <Link href={`/admin/${lang}/products/new`}>{t.new}</Link>}
      </div>
      {!db && <DbMissing dict={dict} />}
      {saved && <Saved dict={dict} />}
      {rows.length === 0 ? (
        <p>{dict.common.empty}</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">{t.name}</th>
              <th scope="col">{t.size}</th>
              <th scope="col">{t.price}</th>
              <th scope="col">{t.available}</th>
              <th scope="col">{t.featured}</th>
              <th scope="col">
                <span className="visually-hidden">{dict.common.edit}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{lang === 'pl' ? row.namePl : row.nameEn}</td>
                <td>{row.size}</td>
                <td>{formatPrice(row.priceGrosze, lang)}</td>
                <td>{row.available ? dict.common.yes : dict.common.no}</td>
                <td>{row.featured ? dict.common.yes : dict.common.no}</td>
                <td>
                  <div className={styles.tableActions}>
                    <Link href={`/admin/${lang}/products/${row.id}`}>{dict.common.edit}</Link>
                    <DeleteButton
                      action={deleteProductAction.bind(null, lang, row.id)}
                      label={dict.common.delete}
                      confirm={dict.common.confirmDelete}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
