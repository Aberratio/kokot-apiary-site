import Image from 'next/image'
import { localize, type Product } from '@/content'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries'
import { formatPrice } from '@/lib/money'
import { KineticText, QualityGate } from 'web-studio-kit'
import { productStill } from '@/lib/stills'
import { JarStill } from '../jar/JarStill'
import { JarScene } from '../jar/JarScene'
import { Section } from '../Section'
import { LazyStill } from '../stills/LazyStill'
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
    <Section id="offer" labelledBy="offer-title" className={styles.section} light="left">
      <KineticText as="h2" id="offer-title">
        {dict.title}
      </KineticText>
      <p className={styles.lead}>{dict.intro}</p>
      {featured && (
        <div className={styles.featured}>
          <div className={styles.featuredStage}>
            <QualityGate
              className={styles.featuredGate}
              fallback={<JarStill className={styles.featuredStill} />}
            >
              <JarScene fallback={<JarStill className={styles.featuredStill} />} />
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
        {products.map((product, index) => (
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
              // A rendered jar until Franciszek uploads a photo of this product.
              <LazyStill
                name={productStill(index)}
                // The product's name, not its photo alt: that may describe a removed photo.
                alt={localize(product.name, locale)}
                className={styles.productPhoto}
                sizes="(min-width: 68rem) 21rem, (min-width: 36rem) 50vw, 100vw"
              />
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
