import { Suspense } from 'react'
import { saveDeliveryAction } from '@/cms/actions'
import { adminContext } from '@/cms/admin-context'
import { DeliveryForm } from '@/components/admin/forms'
import { AdminLoading, DbMissing } from '@/components/admin/states'

export default function NewDeliveryPage({ params }: PageProps<'/admin/[lang]/delivery/new'>) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <NewDelivery params={params} />
    </Suspense>
  )
}

async function NewDelivery({ params }: { params: Promise<{ lang: string }> }) {
  const { lang, dict, db } = await adminContext(params)
  return (
    <>
      <h1>{dict.delivery.new}</h1>
      {!db && <DbMissing dict={dict} />}
      <DeliveryForm
        action={saveDeliveryAction.bind(null, lang, null)}
        initial={{ enabled: 'on' }}
        dict={dict}
        cancelHref={`/admin/${lang}/delivery`}
      />
    </>
  )
}
