import type { AdminDictionary } from '@/i18n/admin'
import styles from './admin.module.css'

export function DbMissing({ dict }: { dict: AdminDictionary }) {
  return (
    <p role="alert" className={styles.notice}>
      {dict.dbMissing}
    </p>
  )
}

export function Saved({ dict }: { dict: AdminDictionary }) {
  return (
    <p role="status" className={styles.success}>
      {dict.common.saved}
    </p>
  )
}

/** Shown while a page checks the session and loads. Copy in both languages: it renders before the language is known. */
export function AdminLoading() {
  return <p aria-busy="true">Ładowanie… / Loading…</p>
}
