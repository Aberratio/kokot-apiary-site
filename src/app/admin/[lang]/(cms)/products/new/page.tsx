import { Suspense } from 'react'
import { saveProductAction } from '@/cms/actions'
import { adminContext } from '@/cms/admin-context'
import { ProductForm } from '@/components/admin/forms'
import { AdminLoading, DbMissing } from '@/components/admin/states'

export default function NewProductPage({ params }: PageProps<'/admin/[lang]/products/new'>) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <NewProduct params={params} />
    </Suspense>
  )
}

async function NewProduct({ params }: { params: Promise<{ lang: string }> }) {
  const { lang, dict, db } = await adminContext(params)
  return (
    <>
      <h1>{dict.products.new}</h1>
      {!db && <DbMissing dict={dict} />}
      <ProductForm
        action={saveProductAction.bind(null, lang, null)}
        initial={{ available: 'on' }}
        dict={dict}
        imageUrl={null}
        cancelHref={`/admin/${lang}/products`}
      />
    </>
  )
}
