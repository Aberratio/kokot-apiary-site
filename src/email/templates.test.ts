import { placeholderContent } from '@/content/placeholder'
import {
  contactEmail,
  orderConfirmationEmail,
  orderNotificationEmail,
  type PlacedOrder,
} from './templates'

const order: PlacedOrder = {
  number: 1001,
  customerName: 'Anna Nowak',
  email: 'anna@example.com',
  phone: '+48 600 000 000',
  address: 'ul. Lipowa 1\n00-001 Warszawa',
  note: '',
  deliveryName: 'Kurier',
  deliveryPriceGrosze: 2200,
  lines: [
    {
      productId: 'acacia',
      name: 'Miód akacjowy',
      size: '900 g',
      unitPriceGrosze: 6000,
      quantity: 2,
    },
  ],
  totalGrosze: 14200,
  locale: 'pl',
}

const plain = (text: string) => text.replace(/\s/g, ' ')

describe('orderConfirmationEmail', () => {
  it('goes to the customer with totals and the transfer details', () => {
    const email = orderConfirmationEmail(order, placeholderContent.paymentInfo)
    expect(email.to).toBe('anna@example.com')
    expect(email.subject).toContain('1001')
    const text = plain(email.text)
    expect(text).toContain('Miód akacjowy (900 g) × 2: 120,00 zł')
    expect(text).toContain('Razem do zapłaty: 142,00 zł')
    expect(text).toContain(placeholderContent.paymentInfo.accountNumber)
    expect(text).toContain('Tytuł przelewu: 1001, Anna Nowak')
  })

  it('speaks English to an English customer', () => {
    const email = orderConfirmationEmail({ ...order, locale: 'en' }, placeholderContent.paymentInfo)
    expect(email.subject).toBe('Order no. 1001: confirmation')
    expect(plain(email.text)).toContain('Total to pay: PLN 142.00')
  })
})

describe('orderNotificationEmail', () => {
  it('goes to the owner in Polish, with replies to the customer', () => {
    const email = orderNotificationEmail({ ...order, locale: 'en' }, 'owner@example.com')
    expect(email.to).toBe('owner@example.com')
    expect(email.replyTo).toBe('anna@example.com')
    expect(plain(email.subject)).toBe('Nowe zamówienie nr 1001: Anna Nowak, 142,00 zł')
    expect(email.text).toContain('ul. Lipowa 1')
    expect(email.text).toContain('Język klienta: angielski')
  })

  it('marks a pickup order', () => {
    expect(orderNotificationEmail({ ...order, address: '' }, 'o@e.com').text).toContain(
      'Adres: (odbiór osobisty)',
    )
  })
})

describe('contactEmail', () => {
  it('forwards the message with the sender as reply-to', () => {
    const email = contactEmail(
      { name: 'Jan', email: 'jan@example.com', message: 'Czy jest miód gryczany?', locale: 'pl' },
      'owner@example.com',
    )
    expect(email).toMatchObject({ to: 'owner@example.com', replyTo: 'jan@example.com' })
    expect(email.text).toContain('Czy jest miód gryczany?')
  })
})
