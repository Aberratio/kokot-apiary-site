import Image from 'next/image'
import { localize, type Product } from '@/content'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries'
import { formatPrice } from '@/lib/money'
import { KineticText, QualityGate } from 'web-studio-kit'
import { JarIllustration } from '../jar/JarIllustration'
import { JarScene } from '../jar/JarScene'
import { Section } from '../Section'
import styles from './sections.module.css'

interface OfferProps {
  locale: Locale
  products: Product[]
  dict: Dictionary['offer']
}

export function Offer({ locale, products, dict }: OfferProps) {
  // The jar presents one product: the featured one if it is on sale, else the first on sale.
  const featured =
    products.find((p) => p.featured && p.available) ?? products.find((p) => p.available)
  return (
    <Section id="offer" labelledBy="offer-title" className={styles.section}>
      <KineticText as="h2" id="offer-title">
        {dict.title}
      </KineticText>
      <p className={styles.lead}>{dict.intro}</p>
      {featured && (
        <div className={styles.featured}>
          <div className={styles.featuredStage}>
            <QualityGate fallback={<JarIllustration />}>
              <JarScene />
            </QualityGate>
          </div>
          <div>
            <span className={styles.badge}>{dict.featured}</span>
            <h3>{localize(featured.name, locale)}</h3>
            <p>{localize(featured.description, locale)}</p>
            <p>
              {featured.size} · <strong>{formatPrice(featured.priceGrosze, locale)}</strong>
            </p>
          </div>
        </div>
      )}
      <ul className={styles.products}>
        {products.map((product) => (
          <li key={product.id} className={styles.product} data-available={product.available}>
            {product.imageUrl ? (
              <div className={styles.productPhoto}>
                <Image
                  src={product.imageUrl}
                  alt={localize(product.imageAlt, locale)}
                  fill
                  sizes="(min-width: 68rem) 22rem, (min-width: 36rem) 50vw, 100vw"
                />
              </div>
            ) : (
              <div className={styles.productPhoto} role="img" aria-label={dict.photoPlaceholder} />
            )}
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
