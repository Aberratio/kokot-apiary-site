import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { saveProductAction } from '@/cms/actions'
import { adminContext, productToForm } from '@/cms/admin-context'
import { ProductForm } from '@/components/admin/forms'
import { AdminLoading, DbMissing } from '@/components/admin/states'
import { getProduct } from '@/db/repo'

export default function EditProductPage({ params }: PageProps<'/admin/[lang]/products/[id]'>) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <EditProduct params={params} />
    </Suspense>
  )
}

async function EditProduct({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, dict, db } = await adminContext(params)
  if (!db) return <DbMissing dict={dict} />
  const { id } = await params
  const row = await getProduct(db, id)
  if (!row) notFound()
  return (
    <>
      <h1>{dict.products.edit}</h1>
      <ProductForm
        action={saveProductAction.bind(null, lang, row.id)}
        initial={productToForm(row)}
        dict={dict}
        imageUrl={row.imageUrl}
        cancelHref={`/admin/${lang}/products`}
      />
    </>
  )
}
