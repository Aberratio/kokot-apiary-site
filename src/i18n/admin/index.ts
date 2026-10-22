import type { Locale } from '../config'
import { adminEn } from './en'
import { adminPl } from './pl'

export type AdminDictionary = typeof adminPl
export type AdminErrorKey = keyof AdminDictionary['errors']

const dictionaries: Record<Locale, AdminDictionary> = { pl: adminPl, en: adminEn }

export function getAdminDictionary(locale: Locale): AdminDictionary {
  return dictionaries[locale]
}
