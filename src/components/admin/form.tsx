'use client'

import { useActionState, useId, type ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import type { FormState } from '@/cms/actions'
import type { AdminDictionary } from '@/i18n/admin'
import styles from './admin.module.css'

export type FormAction = (state: FormState, formData: FormData) => Promise<FormState>

export interface FieldState {
  name: string
  defaultValue: string
  error?: string
}

/**
 * Runs a Server Action and hands each field its value and error. After a failed submit the
 * fields show what was submitted, not the stored values, so nothing typed is lost.
 */
export function useCmsForm(
  action: FormAction,
  initial: Record<string, string>,
  dict: AdminDictionary,
) {
  const [state, formAction, pending] = useActionState(action, {})
  const values = state.values ?? initial
  const field = (name: string): FieldState => {
    const key = state.errors?.[name]
    return { name, defaultValue: values[name] ?? '', error: key ? dict.errors[key] : undefined }
  }
  return { state, formAction, pending, field }
}

export function FormMessage({ state, dict }: { state: FormState; dict: AdminDictionary }) {
  if (state.saved) {
    return (
      <p role="status" className={styles.success}>
        {dict.common.saved}
      </p>
    )
  }
  const message =
    state.message === 'fixErrors'
      ? dict.common.fixErrors
      : state.message === 'notFound'
        ? dict.common.notFound
        : state.message === 'dbMissing'
          ? dict.dbMissing
          : state.message === 'wrongPassword'
            ? dict.login.wrongPassword
            : state.message === 'notConfigured'
              ? dict.login.notConfigured
              : null
  return message ? (
    <p role="alert" className={styles.error}>
      {message}
    </p>
  ) : null
}

interface FieldProps extends FieldState {
  label: string
  hint?: string
  type?: 'text' | 'email' | 'tel' | 'password' | 'number'
  multiline?: boolean
  required?: boolean
  lang?: string
  autoComplete?: string
}

export function Field({ label, hint, error, multiline, type = 'text', ...input }: FieldProps) {
  const id = useId()
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ')
  const common = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy || undefined,
    ...input,
  }
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {multiline ? <textarea rows={5} {...common} /> : <input type={type} {...common} />}
      {hint && (
        <small id={`${id}-hint`} className={styles.hint}>
          {hint}
        </small>
      )}
      {error && (
        <small id={`${id}-error`} className={styles.fieldError}>
          {error}
        </small>
      )}
    </div>
  )
}

/** Two fields for one text, Polish and English, side by side. */
export function LocalizedField({
  base,
  label,
  field,
  dict,
  multiline,
  required,
}: {
  base: string
  label: string
  field: (name: string) => FieldState
  dict: AdminDictionary
  multiline?: boolean
  required?: boolean
}) {
  return (
    <fieldset className={styles.pair}>
      <legend>{label}</legend>
      <Field
        {...field(`${base}Pl`)}
        label={dict.common.polish}
        lang="pl"
        multiline={multiline}
        required={required}
      />
      <Field
        {...field(`${base}En`)}
        label={dict.common.english}
        lang="en"
        multiline={multiline}
        required={required}
      />
    </fieldset>
  )
}

export function Checkbox({ name, defaultValue, label }: FieldState & { label: string }) {
  return (
    <label className={styles.checkbox}>
      <input type="checkbox" name={name} defaultChecked={defaultValue === 'on'} />
      {label}
    </label>
  )
}

export function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={styles.primary} disabled={pending} aria-busy={pending}>
      {children}
    </button>
  )
}

/** A delete button that asks first. The action is a bound Server Action. */
export function DeleteButton({
  action,
  label,
  confirm,
}: {
  action: () => Promise<void>
  label: string
  confirm: string
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirm)) event.preventDefault()
      }}
    >
      <button type="submit" className={styles.danger}>
        {label}
      </button>
    </form>
  )
}
