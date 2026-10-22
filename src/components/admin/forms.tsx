'use client'

/* eslint-disable @next/next/no-img-element -- admin previews of uploaded photos, not page content */
import Link from 'next/link'
import type { AdminDictionary } from '@/i18n/admin'
import styles from './admin.module.css'
import {
  Checkbox,
  Field,
  FormMessage,
  LocalizedField,
  SubmitButton,
  useCmsForm,
  type FormAction,
} from './form'

interface FormProps {
  action: FormAction
  initial: Record<string, string>
  dict: AdminDictionary
}

export function LoginForm({ action, dict }: Omit<FormProps, 'initial'>) {
  const { state, formAction, field } = useCmsForm(action, {}, dict)
  return (
    <form action={formAction} className={styles.form}>
      <FormMessage state={state} dict={dict} />
      <Field
        {...field('password')}
        type="password"
        label={dict.login.password}
        autoComplete="current-password"
        required
      />
      <SubmitButton>{dict.login.submit}</SubmitButton>
    </form>
  )
}

export function ProductForm({
  action,
  initial,
  dict,
  imageUrl,
  cancelHref,
}: FormProps & { imageUrl: string | null; cancelHref: string }) {
  const { state, formAction, field } = useCmsForm(action, initial, dict)
  const t = dict.products
  return (
    <form action={formAction} className={styles.form}>
      <FormMessage state={state} dict={dict} />
      <LocalizedField base="name" label={t.name} field={field} dict={dict} required />
      <LocalizedField
        base="description"
        label={t.description}
        field={field}
        dict={dict}
        multiline
      />
      <div className={styles.row}>
        <Field {...field('size')} label={t.size} hint={t.sizeHint} />
        <Field {...field('priceGrosze')} label={t.price} hint={t.priceHint} required />
        <Field {...field('sortOrder')} label={t.sortOrder} hint={t.sortOrderHint} type="number" />
      </div>
      <fieldset className={styles.pair}>
        <legend>{t.photo}</legend>
        {imageUrl && <img src={imageUrl} alt="" className={styles.preview} />}
        <div className={styles.field}>
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp,image/avif"
            aria-label={t.photo}
            aria-describedby="photo-hint"
          />
          <small id="photo-hint" className={styles.hint}>
            {t.photoHint}
          </small>
          {field('photo').error && (
            <small className={styles.fieldError}>{field('photo').error}</small>
          )}
        </div>
        {imageUrl && <Checkbox name="removePhoto" defaultValue="" label={t.removePhoto} />}
      </fieldset>
      <LocalizedField base="imageAlt" label={t.imageAlt} field={field} dict={dict} />
      <Checkbox {...field('available')} label={t.available} />
      <Checkbox {...field('featured')} label={t.featured} />
      <div className={styles.actions}>
        <SubmitButton>{dict.common.save}</SubmitButton>
        <Link href={cancelHref}>{dict.common.cancel}</Link>
      </div>
    </form>
  )
}

export function DeliveryForm({
  action,
  initial,
  dict,
  cancelHref,
}: FormProps & { cancelHref: string }) {
  const { state, formAction, field } = useCmsForm(action, initial, dict)
  const t = dict.delivery
  return (
    <form action={formAction} className={styles.form}>
      <FormMessage state={state} dict={dict} />
      <LocalizedField base="name" label={t.name} field={field} dict={dict} required />
      <LocalizedField
        base="description"
        label={t.description}
        field={field}
        dict={dict}
        multiline
      />
      <div className={styles.row}>
        <Field {...field('priceGrosze')} label={t.price} hint={dict.products.priceHint} required />
        <Field
          {...field('sortOrder')}
          label={dict.products.sortOrder}
          hint={dict.products.sortOrderHint}
          type="number"
        />
      </div>
      <Checkbox {...field('requiresAddress')} label={t.requiresAddress} />
      <Checkbox {...field('enabled')} label={t.enabled} />
      <div className={styles.actions}>
        <SubmitButton>{dict.common.save}</SubmitButton>
        <Link href={cancelHref}>{dict.common.cancel}</Link>
      </div>
    </form>
  )
}

export function PaymentForm({ action, initial, dict }: FormProps) {
  const { state, formAction, field } = useCmsForm(action, initial, dict)
  const t = dict.payment
  return (
    <form action={formAction} className={styles.form}>
      <FormMessage state={state} dict={dict} />
      <Field {...field('accountHolder')} label={t.accountHolder} required />
      <Field {...field('bankName')} label={t.bankName} required />
      <Field {...field('accountNumber')} label={t.accountNumber} required />
      <LocalizedField
        base="transferTitleHint"
        label={t.transferTitleHint}
        field={field}
        dict={dict}
        multiline
      />
      <div className={styles.actions}>
        <SubmitButton>{dict.common.save}</SubmitButton>
      </div>
    </form>
  )
}

export function SettingsForm({ action, initial, dict }: FormProps) {
  const { state, formAction, field } = useCmsForm(action, initial, dict)
  const t = dict.settings
  const orderMode = field('orderMode')
  return (
    <form action={formAction} className={styles.form}>
      <FormMessage state={state} dict={dict} />
      <Field {...field('apiaryName')} label={t.apiaryName} required />
      <fieldset className={styles.pair}>
        <legend>{t.orderMode}</legend>
        {(['form', 'contact'] as const).map((mode) => (
          <label key={mode} className={styles.checkbox}>
            <input
              type="radio"
              name="orderMode"
              value={mode}
              defaultChecked={orderMode.defaultValue === mode}
            />
            {mode === 'form' ? t.orderModeForm : t.orderModeContact}
          </label>
        ))}
        {orderMode.error && <small className={styles.fieldError}>{orderMode.error}</small>}
      </fieldset>
      <div className={styles.row}>
        <Field {...field('contactEmail')} type="email" label={t.contactEmail} required />
        <Field {...field('contactPhone')} type="tel" label={t.contactPhone} />
      </div>
      <Field {...field('socialLinks')} label={t.socialLinks} hint={t.socialLinksHint} multiline />
      <LocalizedField base="heroTagline" label={t.heroTagline} field={field} dict={dict} />
      <LocalizedField base="aboutStory" label={t.aboutStory} field={field} dict={dict} multiline />
      <div className={styles.actions}>
        <SubmitButton>{dict.common.save}</SubmitButton>
      </div>
    </form>
  )
}
