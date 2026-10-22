import type { SiteContent } from '@/content'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries'
import { submitContactAction, submitOrderAction } from '@/orders/actions'
import { ContactForm, OrderForm } from '../forms/PublicForms'
import { Section } from '../Section'
import styles from './sections.module.css'

interface OrderSectionProps {
  locale: Locale
  content: SiteContent
  dict: Dictionary
}

/**
 * The order form or the contact form, as Franciszek chose with `orderMode` in the CMS. With no
 * product available the order form would be empty, so the contact form shows instead.
 */
export function OrderSection({ locale, content, dict }: OrderSectionProps) {
  const { settings } = content
  const canOrder =
    settings.orderMode === 'form' &&
    content.products.some((product) => product.available) &&
    content.deliveryOptions.length > 0
  const t = dict.order
  return (
    <Section id="order" labelledBy="order-title" className={styles.section}>
      <h2 id="order-title">{canOrder ? t.titleForm : t.titleContact}</h2>
      <p className={styles.lead}>{canOrder ? t.introForm : t.introContact}</p>
      {canOrder ? (
        <OrderForm
          lang={locale}
          copy={dict.forms}
          products={content.products}
          deliveryOptions={content.deliveryOptions}
          action={submitOrderAction.bind(null, locale)}
        />
      ) : (
        <ContactForm copy={dict.forms} action={submitContactAction.bind(null, locale)} />
      )}
      <p className={styles.direct}>{t.directContact}</p>
      <dl className={styles.details}>
        <dt>{t.email}</dt>
        <dd>
          <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
        </dd>
        <dt>{t.phone}</dt>
        <dd>
          <a href={`tel:${settings.contactPhone.replace(/\s/g, '')}`}>{settings.contactPhone}</a>
        </dd>
      </dl>
    </Section>
  )
}
