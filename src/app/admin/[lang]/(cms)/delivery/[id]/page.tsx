import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { saveDeliveryAction } from '@/cms/actions'
import { adminContext, deliveryToForm } from '@/cms/admin-context'
import { DeliveryForm } from '@/components/admin/forms'
import { AdminLoading, DbMissing } from '@/components/admin/states'
import { getDeliveryOption } from '@/db/repo'

export default function EditDeliveryPage({ params }: PageProps<'/admin/[lang]/delivery/[id]'>) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <EditDelivery params={params} />
    </Suspense>
  )
}

async function EditDelivery({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, dict, db } = await adminContext(params)
  if (!db) return <DbMissing dict={dict} />
  const { id } = await params
  const row = await getDeliveryOption(db, id)
  if (!row) notFound()
  return (
    <>
      <h1>{dict.delivery.edit}</h1>
      <DeliveryForm
        action={saveDeliveryAction.bind(null, lang, row.id)}
        initial={deliveryToForm(row)}
        dict={dict}
        cancelHref={`/admin/${lang}/delivery`}
      />
    </>
  )
}
