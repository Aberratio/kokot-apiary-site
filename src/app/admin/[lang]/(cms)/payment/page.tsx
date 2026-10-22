import { Suspense } from 'react'
import { savePaymentAction } from '@/cms/actions'
import { adminContext, paymentToForm } from '@/cms/admin-context'
import { PaymentForm } from '@/components/admin/forms'
import { AdminLoading, DbMissing } from '@/components/admin/states'
import { getPaymentInfo } from '@/db/repo'

export default function PaymentPage({ params }: PageProps<'/admin/[lang]/payment'>) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Payment params={params} />
    </Suspense>
  )
}

async function Payment({ params }: { params: Promise<{ lang: string }> }) {
  const { lang, dict, db } = await adminContext(params)
  const row = db ? await getPaymentInfo(db) : null
  return (
    <>
      <h1>{dict.payment.title}</h1>
      {!db && <DbMissing dict={dict} />}
      <PaymentForm
        action={savePaymentAction.bind(null, lang)}
        initial={paymentToForm(row)}
        dict={dict}
      />
    </>
  )
}
