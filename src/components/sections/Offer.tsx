import { localize, type Product } from '@/content'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries'
import { formatPrice } from '@/lib/money'
import { Section } from '../Section'
import styles from './sections.module.css'

interface OfferProps {
  locale: Locale
  products: Product[]
  dict: Dictionary['offer']
}

export function Offer({ locale, products, dict }: OfferProps) {
  return (
    <Section id="offer" labelledBy="offer-title" className={styles.section}>
      <h2 id="offer-title">{dict.title}</h2>
      <p className={styles.lead}>{dict.intro}</p>
      <ul className={styles.products}>
        {products.map((product) => (
          <li key={product.id} className={styles.product} data-available={product.available}>
            <div className={styles.productPhoto} role="img" aria-label={dict.photoPlaceholder} />
            <div className={styles.productBody}>
              {product.featured && <span className={styles.badge}>{dict.featured}</span>}
              <h3>{localize(product.name, locale)}</h3>
              <p>{localize(product.description, locale)}</p>
              <dl className={styles.facts}>
                <div>
                  <dt>{dict.size}</dt>
                  <dd>{product.size}</dd>
                </div>
                <div>
                  <dt>{dict.price}</dt>
                  <dd>{formatPrice(product.priceGrosze, locale)}</dd>
                </div>
              </dl>
              <p className={styles.availability}>
                {product.available ? dict.available : dict.unavailable}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}
