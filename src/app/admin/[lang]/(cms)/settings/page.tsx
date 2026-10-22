import { Suspense } from 'react'
import { saveSettingsAction } from '@/cms/actions'
import { adminContext, settingsToForm } from '@/cms/admin-context'
import { SettingsForm } from '@/components/admin/forms'
import { AdminLoading, DbMissing } from '@/components/admin/states'
import { getSettings } from '@/db/repo'

export default function SettingsPage({ params }: PageProps<'/admin/[lang]/settings'>) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <SettingsContent params={params} />
    </Suspense>
  )
}

async function SettingsContent({ params }: { params: Promise<{ lang: string }> }) {
  const { lang, dict, db } = await adminContext(params)
  const row = db ? await getSettings(db) : null
  return (
    <>
      <h1>{dict.settings.title}</h1>
      {!db && <DbMissing dict={dict} />}
      <SettingsForm
        action={saveSettingsAction.bind(null, lang)}
        initial={settingsToForm(row)}
        dict={dict}
      />
    </>
  )
}
