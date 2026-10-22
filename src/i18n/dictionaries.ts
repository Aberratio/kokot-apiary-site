import type { Locale } from './config'
import { en } from './dictionaries/en'
import { pl } from './dictionaries/pl'

export type Dictionary = typeof pl

const dictionaries: Record<Locale, Dictionary> = { pl, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
