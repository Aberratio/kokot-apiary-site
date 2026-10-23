import type { Dictionary } from '../dictionaries'

export const en: Dictionary = {
  meta: {
    title: 'Kokot Apiary: honey straight from the hive',
    description: "Honey from Franciszek Kokot's family apiary. Order a jar or get in touch.",
  },
  nav: {
    label: 'Page sections',
    skipToContent: 'Skip to content',
    about: 'About',
    process: 'The bees',
    offer: 'Honey',
    howToOrder: 'How to order',
    order: 'Contact',
  },
  languageSwitch: {
    label: 'Language',
    pl: 'Polski',
    en: 'English',
  },
  hero: {
    scrollHint: 'Scroll to meet the apiary',
  },
  about: {
    title: 'About the apiary',
    // Alt text for the rendered placeholder images, until real photos replace them.
    photos: {
      comb: 'A honeycomb in a wooden frame, lit by a low sun',
      dipper: 'Honey running off a wooden dipper into a jar',
      hive: 'A wooden beehive at dusk, against the light',
    },
  },
  process: {
    title: 'From swarm to jar',
    intro: 'How honey is made, in three steps.',
    steps: {
      swarm: {
        title: 'Swarm',
        body: 'The bees gather nectar from flowers within a few kilometres of the hive.',
      },
      comb: {
        title: 'Comb',
        body: 'Inside the hive the nectar ripens in wax cells until it becomes honey.',
      },
      jar: {
        title: 'Jar',
        body: 'We spin the honey out of the combs and pour it into jars, without heating it.',
      },
    },
  },
  offer: {
    title: 'Our honey',
    intro: 'Current honeys. Prices include VAT; delivery is charged separately.',
    available: 'Available',
    unavailable: 'Currently unavailable',
    featured: 'Featured',
    size: 'Size',
    price: 'Price',
  },
  howToOrder: {
    title: 'How to order',
    intro: 'Pay by bank transfer once your order is confirmed. There are no online payments.',
    paymentTitle: 'Bank transfer details',
    accountHolder: 'Account holder',
    bankName: 'Bank',
    accountNumber: 'Account number',
    deliveryTitle: 'Delivery',
    free: 'Free',
  },
  order: {
    titleForm: 'Order honey',
    titleContact: 'Write to us',
    introForm:
      'Pick your honey and delivery. After sending you get an email with the bank transfer details; we ship once the payment arrives.',
    introContact: 'Want to order honey or ask something? Write and we will reply by email.',
    directContact: 'You can also email or call directly:',
    email: 'Email',
    phone: 'Phone',
  },
  forms: {
    name: 'Full name',
    email: 'Email',
    phone: 'Phone',
    address: 'Delivery address',
    addressHint: 'Street, number, postcode, town. For a parcel locker: its code.',
    note: 'Notes (optional)',
    message: 'Message',
    products: 'Honey',
    quantity: 'Quantity',
    delivery: 'Delivery',
    subtotal: 'Honey total',
    deliveryCost: 'Delivery',
    total: 'To pay',
    submitOrder: 'Place order with obligation to pay',
    submitContact: 'Send message',
    sending: 'Sending…',
    honeypot: 'Leave this field empty',
    ordered: 'Thank you! Order no. {number} has been received.',
    orderedNoNumber: 'Thank you! Your order has been received.',
    orderedNext:
      'We sent you an email with a summary. Transfer the amount to the account shown under "How to order", with the order number in the title.',
    sent: 'Thank you! Your message has been sent. We will reply soon.',
    messages: {
      fixErrors: 'Fix the highlighted fields.',
      tooMany: 'Too many attempts. Try again in a few minutes.',
      unavailable: 'Ordering through the site is unavailable right now. Please email or call.',
      sendFailed: 'The message could not be sent. Please email us directly at the address below.',
      emptyOrder: 'Pick at least one jar.',
      unavailableProduct: 'One of the honeys is no longer available. Refresh the page.',
      tooManyItems: 'At most 20 of one honey. For a larger order, write to us.',
    },
    errors: {
      required: 'This field is required.',
      tooLong: 'Too long.',
      invalidEmail: 'Enter a valid email address.',
      invalidPhone: 'Enter a valid phone number.',
    },
  },
  footer: {
    contactTitle: 'Contact',
    socialTitle: 'Find us',
    rights: 'All rights reserved.',
  },
}
