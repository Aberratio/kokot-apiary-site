import { notFound } from 'next/navigation'
import { Hero } from '@/components/hero/Hero'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { ProgressSection } from '@/components/ProgressSection'
import { isLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'

export default async function Page({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const dict = getDictionary(lang)

  return (
    <>
      <header className="site-header">
        <LanguageSwitch current={lang} labels={dict.languageSwitch} />
      </header>
      <main>
        <Hero title={dict.hero.title} subtitle={dict.hero.subtitle} />
        <ProgressSection id="first" title={dict.sections.first.title}>
          <p>{dict.sections.first.body}</p>
        </ProgressSection>
        <ProgressSection id="second" title={dict.sections.second.title}>
          <p>{dict.sections.second.body}</p>
        </ProgressSection>
      </main>
    </>
  )
}
