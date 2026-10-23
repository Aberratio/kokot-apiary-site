import { localize, type DeliveryOption, type PaymentInfo } from '@/content'
import type { Locale } from '@/i18n/config'
import { KineticText } from 'web-studio-kit'
import type { Dictionary } from '@/i18n/dictionaries'
import { formatPrice } from '@/lib/money'
import { Section } from '../Section'
import styles from './sections.module.css'

interface HowToOrderProps {
  locale: Locale
  payment: PaymentInfo
  delivery: DeliveryOption[]
  dict: Dictionary['howToOrder']
}

export function HowToOrder({ locale, payment, delivery, dict }: HowToOrderProps) {
  return (
    <Section id="how-to-order" labelledBy="how-to-order-title" className={styles.section}>
      <KineticText as="h2" id="how-to-order-title">
        {dict.title}
      </KineticText>
      <p className={styles.lead}>{dict.intro}</p>
      <div className={styles.columns}>
        <div className={styles.panel}>
          <h3>{dict.paymentTitle}</h3>
          <dl className={styles.details}>
            <dt>{dict.accountHolder}</dt>
            <dd>{payment.accountHolder}</dd>
            <dt>{dict.bankName}</dt>
            <dd>{payment.bankName}</dd>
            <dt>{dict.accountNumber}</dt>
            <dd className={styles.accountNumber}>{payment.accountNumber}</dd>
          </dl>
          <p>{localize(payment.transferTitleHint, locale)}</p>
        </div>
        <div className={styles.panel}>
          <h3>{dict.deliveryTitle}</h3>
          <ul className={styles.delivery}>
            {delivery.map((option) => (
              <li key={option.id}>
                <strong>{localize(option.name, locale)}</strong>
                <span>
                  {option.priceGrosze === 0 ? dict.free : formatPrice(option.priceGrosze, locale)}
                </span>
                <p>{localize(option.description, locale)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
