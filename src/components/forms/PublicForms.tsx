'use client'

import { useActionState, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import type { DeliveryOption, Product } from '@/content/types'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries'
import { formatPrice } from '@/lib/money'
import type { PublicFormState } from '@/orders/actions'
import { calculateOrder, MAX_QUANTITY } from '@/orders/calculate'
import { HONEYPOT_FIELD } from '@/orders/honeypot'
import styles from './forms.module.css'

type FormsCopy = Dictionary['forms']
type Action = (state: PublicFormState, formData: FormData) => Promise<PublicFormState>

function useFieldHelpers(state: PublicFormState, copy: FormsCopy) {
  const values = state.values ?? {}
  return (name: string) => {
    const key = state.errors?.[name]
    return { name, defaultValue: values[name] ?? '', error: key ? copy.errors[key] : undefined }
  }
}

interface FieldProps {
  name: string
  label: string
  defaultValue: string
  error?: string
  hint?: string
  type?: string
  multiline?: boolean
  required?: boolean
  autoComplete?: string
}

function Field({ label, error, hint, multiline, type = 'text', ...input }: FieldProps) {
  const id = useId()
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ')
  const props = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy || undefined,
    ...input,
  }
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {multiline ? <textarea rows={4} {...props} /> : <input type={type} {...props} />}
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

/** Invisible to people (and to assistive tech); bots that fill every field give themselves away. */
function Honeypot({ label }: { label: string }) {
  return (
    <div className={styles.honeypot} aria-hidden="true">
      <label>
        {label}
        <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  )
}

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={styles.submit} disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel : label}
    </button>
  )
}

function Message({ state, copy }: { state: PublicFormState; copy: FormsCopy }) {
  if (!state.message) return null
  return (
    <p role="alert" className={styles.error}>
      {copy.messages[state.message]}
    </p>
  )
}

/** Moves focus to the confirmation so screen reader and keyboard users land on it. */
function Success({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => ref.current?.focus(), [])
  return (
    <div ref={ref} tabIndex={-1} role="status" className={styles.success}>
      {children}
    </div>
  )
}

export function OrderForm({
  lang,
  copy,
  products,
  deliveryOptions,
  action,
}: {
  lang: Locale
  copy: FormsCopy
  products: Product[]
  deliveryOptions: DeliveryOption[]
  action: Action
}) {
  const [state, formAction] = useActionState(action, {})
  const field = useFieldHelpers(state, copy)
  const values = state.values ?? {}
  // Quantities and delivery are controlled, so the total previews live and survives a failed submit.
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [deliveryId, setDeliveryId] = useState(
    values.deliveryOptionId ?? deliveryOptions[0]?.id ?? '',
  )

  if (state.status === 'ordered') {
    return (
      <Success>
        <p>
          {state.orderNumber
            ? copy.ordered.replace('{number}', String(state.orderNumber))
            : copy.orderedNoNumber}
        </p>
        {state.totalGrosze !== undefined && (
          <p>
            {copy.total}: <strong>{formatPrice(state.totalGrosze, lang)}</strong>
          </p>
        )}
        <p>{copy.orderedNext}</p>
      </Success>
    )
  }

  const available = products.filter((product) => product.available)
  const delivery = deliveryOptions.find((option) => option.id === deliveryId)
  const preview = calculateOrder(
    {
      items: Object.entries(quantities).map(([productId, quantity]) => ({ productId, quantity })),
      deliveryOptionId: deliveryId,
    },
    { products: available, deliveryOptions },
    lang,
  )
  const address = field('address')

  return (
    <form action={formAction} className={styles.form} noValidate>
      <Message state={state} copy={copy} />
      <fieldset className={styles.group}>
        <legend>{copy.products}</legend>
        <ul className={styles.items}>
          {available.map((product) => (
            <li key={product.id}>
              <label htmlFor={`qty-${product.id}`}>
                {product.name[lang]}
                {product.size && <span className={styles.muted}> · {product.size}</span>}
                <span className={styles.muted}> · {formatPrice(product.priceGrosze, lang)}</span>
              </label>
              <input
                id={`qty-${product.id}`}
                name={`qty.${product.id}`}
                type="number"
                inputMode="numeric"
                min={0}
                max={MAX_QUANTITY}
                value={quantities[product.id] ?? Number(values[`qty.${product.id}`] ?? 0)}
                onChange={(event) =>
                  setQuantities((current) => ({
                    ...current,
                    [product.id]: Math.max(
                      0,
                      Math.min(MAX_QUANTITY, Number(event.target.value) || 0),
                    ),
                  }))
                }
                aria-label={`${copy.quantity}: ${product.name[lang]}`}
              />
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset
        className={styles.group}
        aria-invalid={state.errors?.deliveryOptionId ? true : undefined}
      >
        <legend>{copy.delivery}</legend>
        {deliveryOptions.map((option) => (
          <label key={option.id} className={styles.choice}>
            <input
              type="radio"
              name="deliveryOptionId"
              value={option.id}
              checked={deliveryId === option.id}
              onChange={() => setDeliveryId(option.id)}
            />
            <span>
              {option.name[lang]} · {formatPrice(option.priceGrosze, lang)}
              <small className={styles.muted}>{option.description[lang]}</small>
            </span>
          </label>
        ))}
        {state.errors?.deliveryOptionId && (
          <small className={styles.fieldError}>{copy.errors[state.errors.deliveryOptionId]}</small>
        )}
      </fieldset>

      <div className={styles.row}>
        <Field {...field('name')} label={copy.name} autoComplete="name" required />
        <Field {...field('email')} type="email" label={copy.email} autoComplete="email" required />
        <Field {...field('phone')} type="tel" label={copy.phone} autoComplete="tel" required />
      </div>
      {/* Without JavaScript the field always shows; the server decides whether it is needed. */}
      {(delivery?.requiresAddress ?? true) && (
        <Field
          {...address}
          label={copy.address}
          hint={copy.addressHint}
          autoComplete="street-address"
          multiline
          required
        />
      )}
      <Field {...field('note')} label={copy.note} multiline />
      <Honeypot label={copy.honeypot} />

      <dl className={styles.summary} aria-live="polite">
        <div>
          <dt>{copy.subtotal}</dt>
          <dd>{formatPrice(preview.ok ? preview.subtotalGrosze : 0, lang)}</dd>
        </div>
        <div>
          <dt>{copy.deliveryCost}</dt>
          <dd>{formatPrice(delivery?.priceGrosze ?? 0, lang)}</dd>
        </div>
        <div className={styles.total}>
          <dt>{copy.total}</dt>
          <dd>{formatPrice(preview.ok ? preview.totalGrosze : 0, lang)}</dd>
        </div>
      </dl>
      <Submit label={copy.submitOrder} pendingLabel={copy.sending} />
    </form>
  )
}

export function ContactForm({ copy, action }: { copy: FormsCopy; action: Action }) {
  const [state, formAction] = useActionState(action, {})
  const field = useFieldHelpers(state, copy)
  if (state.status === 'sent') {
    return (
      <Success>
        <p>{copy.sent}</p>
      </Success>
    )
  }
  return (
    <form action={formAction} className={styles.form} noValidate>
      <Message state={state} copy={copy} />
      <div className={styles.row}>
        <Field {...field('name')} label={copy.name} autoComplete="name" required />
        <Field {...field('email')} type="email" label={copy.email} autoComplete="email" required />
      </div>
      <Field {...field('message')} label={copy.message} multiline required />
      <Honeypot label={copy.honeypot} />
      <Submit label={copy.submitContact} pendingLabel={copy.sending} />
    </form>
  )
}
