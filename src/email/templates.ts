import type { PaymentInfo } from '@/content/types'
import type { Locale } from '@/i18n/config'
import { formatPrice } from '@/lib/money'
import type { OrderLine } from '@/orders/calculate'
import type { Email } from './send'

export interface PlacedOrder {
  number: number
  customerName: string
  email: string
  phone: string
  address: string
  note: string
  deliveryName: string
  deliveryPriceGrosze: number
  lines: OrderLine[]
  totalGrosze: number
  locale: Locale
}

const copy = {
  pl: {
    subject: (n: number) => `Zamówienie nr ${n}: potwierdzenie`,
    greeting: (name: string) => `Dzień dobry ${name},`,
    thanks: 'dziękujemy za zamówienie. Oto jego podsumowanie.',
    delivery: 'Dostawa',
    total: 'Razem do zapłaty',
    payTitle: 'Dane do przelewu',
    holder: 'Odbiorca',
    bank: 'Bank',
    account: 'Numer konta',
    transferTitle: 'Tytuł przelewu',
    after: 'Wyślemy zamówienie po zaksięgowaniu wpłaty. W razie pytań odpowiedz na tę wiadomość.',
  },
  en: {
    subject: (n: number) => `Order no. ${n}: confirmation`,
    greeting: (name: string) => `Hello ${name},`,
    thanks: 'thank you for your order. Here is a summary.',
    delivery: 'Delivery',
    total: 'Total to pay',
    payTitle: 'Bank transfer details',
    holder: 'Account holder',
    bank: 'Bank',
    account: 'Account number',
    transferTitle: 'Transfer title',
    after: 'We ship once the payment arrives. Reply to this email with any questions.',
  },
}

function lineList(order: PlacedOrder, locale: Locale): string {
  return order.lines
    .map(
      (line) =>
        `- ${line.name}${line.size ? ` (${line.size})` : ''} × ${line.quantity}: ${formatPrice(
          line.unitPriceGrosze * line.quantity,
          locale,
        )}`,
    )
    .join('\n')
}

/** The customer's confirmation, in the language they ordered in, with the transfer details. */
export function orderConfirmationEmail(order: PlacedOrder, payment: PaymentInfo): Email {
  const t = copy[order.locale]
  const l = order.locale
  return {
    to: order.email,
    subject: t.subject(order.number),
    text: [
      t.greeting(order.customerName),
      t.thanks,
      '',
      lineList(order, l),
      `- ${t.delivery}: ${order.deliveryName}: ${formatPrice(order.deliveryPriceGrosze, l)}`,
      '',
      `${t.total}: ${formatPrice(order.totalGrosze, l)}`,
      '',
      `${t.payTitle}:`,
      `${t.holder}: ${payment.accountHolder}`,
      `${t.bank}: ${payment.bankName}`,
      `${t.account}: ${payment.accountNumber}`,
      `${t.transferTitle}: ${order.number}, ${order.customerName}`,
      payment.transferTitleHint[l],
      '',
      t.after,
    ].join('\n'),
  }
}

/** The notification for Franciszek. Always in Polish; replying goes to the customer. */
export function orderNotificationEmail(order: PlacedOrder, ownerEmail: string): Email {
  return {
    to: ownerEmail,
    replyTo: order.email,
    subject: `Nowe zamówienie nr ${order.number}: ${order.customerName}, ${formatPrice(order.totalGrosze, 'pl')}`,
    text: [
      `Zamówienie nr ${order.number}`,
      '',
      lineList(order, 'pl'),
      `- Dostawa: ${order.deliveryName}: ${formatPrice(order.deliveryPriceGrosze, 'pl')}`,
      `Razem: ${formatPrice(order.totalGrosze, 'pl')}`,
      '',
      `Klient: ${order.customerName}`,
      `E-mail: ${order.email}`,
      `Telefon: ${order.phone}`,
      order.address ? `Adres:\n${order.address}` : 'Adres: (odbiór osobisty)',
      order.note ? `\nUwagi:\n${order.note}` : '',
      '',
      `Język klienta: ${order.locale === 'pl' ? 'polski' : 'angielski'}`,
      'Status zmienisz w panelu: /admin/pl/orders',
    ]
      .filter((line) => line !== '')
      .join('\n'),
  }
}

export function contactEmail(
  message: { name: string; email: string; message: string; locale: Locale },
  ownerEmail: string,
): Email {
  return {
    to: ownerEmail,
    replyTo: message.email,
    subject: `Wiadomość ze strony od ${message.name}`,
    text: [
      `Od: ${message.name} <${message.email}>`,
      `Język: ${message.locale === 'pl' ? 'polski' : 'angielski'}`,
      '',
      message.message,
    ].join('\n'),
  }
}
