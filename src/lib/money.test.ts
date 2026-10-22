import { formatPrice } from './money'

// Intl uses non-breaking spaces; normalise them so the expectations stay readable.
const plain = (value: string) => value.replace(/\s/g, ' ')

describe('formatPrice', () => {
  it('formats grosze as złoty in Polish', () => {
    expect(plain(formatPrice(6000, 'pl'))).toBe('60,00 zł')
    expect(plain(formatPrice(1850, 'pl'))).toBe('18,50 zł')
  })

  it('formats grosze as PLN in English', () => {
    expect(plain(formatPrice(6000, 'en'))).toBe('PLN 60.00')
  })

  it('shows zero as a price, not a blank', () => {
    expect(plain(formatPrice(0, 'pl'))).toBe('0,00 zł')
  })
})
