import type { SiteContent } from './types'

/**
 * Placeholder content until Franciszek fills in the CMS. Every value here is invented and
 * every one becomes editable in /admin.
 */
export const placeholderContent: SiteContent = {
  settings: {
    apiaryName: 'Pasieka Kokot',
    orderMode: 'contact',
    contactEmail: 'kontakt@example.com',
    contactPhone: '+48 600 000 000',
    socialLinks: [
      { label: 'Facebook', url: 'https://facebook.com/' },
      { label: 'Instagram', url: 'https://instagram.com/' },
    ],
    heroTagline: {
      pl: 'Miód z małej, rodzinnej pasieki.',
      en: 'Honey from a small family apiary.',
    },
    aboutStory: {
      pl: 'Tu pojawi się historia pasieki: skąd się wzięła, gdzie stoją ule i jak powstaje miód. Tekst jest tymczasowy.',
      en: 'The story of the apiary goes here: how it started, where the hives stand and how the honey is made. This text is a placeholder.',
    },
  },
  products: [
    {
      id: 'acacia',
      name: { pl: 'Miód akacjowy', en: 'Acacia honey' },
      description: {
        pl: 'Jasny, łagodny, długo pozostaje płynny.',
        en: 'Light and mild, stays runny for a long time.',
      },
      size: '900 g',
      priceGrosze: 6000,
      imageUrl: null,
      imageAlt: { pl: 'Słoik miodu akacjowego', en: 'A jar of acacia honey' },
      available: true,
      featured: true,
      sortOrder: 1,
    },
    {
      id: 'linden',
      name: { pl: 'Miód lipowy', en: 'Linden honey' },
      description: {
        pl: 'Wyrazisty, lekko miętowy aromat.',
        en: 'Bold, with a slightly minty aroma.',
      },
      size: '900 g',
      priceGrosze: 5500,
      imageUrl: null,
      imageAlt: { pl: 'Słoik miodu lipowego', en: 'A jar of linden honey' },
      available: true,
      featured: false,
      sortOrder: 2,
    },
    {
      id: 'multiflower',
      name: { pl: 'Miód wielokwiatowy', en: 'Wildflower honey' },
      description: {
        pl: 'Z wiosennych i letnich kwiatów z okolicy pasieki.',
        en: 'From spring and summer flowers around the apiary.',
      },
      size: '450 g',
      priceGrosze: 3000,
      imageUrl: null,
      imageAlt: { pl: 'Słoik miodu wielokwiatowego', en: 'A jar of wildflower honey' },
      available: false,
      featured: false,
      sortOrder: 3,
    },
  ],
  paymentInfo: {
    accountHolder: 'Franciszek Kokot',
    bankName: 'Bank (przykład)',
    accountNumber: '00 0000 0000 0000 0000 0000 0000',
    transferTitleHint: {
      pl: 'W tytule przelewu podaj imię, nazwisko i numer zamówienia.',
      en: 'Put your name and the order number in the transfer title.',
    },
  },
  deliveryOptions: [
    {
      id: 'pickup',
      name: { pl: 'Odbiór osobisty', en: 'Pickup' },
      description: {
        pl: 'Odbiór w pasiece po wcześniejszym umówieniu.',
        en: 'Collect at the apiary by appointment.',
      },
      priceGrosze: 0,
      enabled: true,
      sortOrder: 1,
    },
    {
      id: 'parcel-locker',
      name: { pl: 'Paczkomat', en: 'Parcel locker' },
      description: {
        pl: 'Wysyłka do wybranego paczkomatu.',
        en: 'Shipped to a parcel locker of your choice.',
      },
      priceGrosze: 1800,
      enabled: true,
      sortOrder: 2,
    },
    {
      id: 'courier',
      name: { pl: 'Kurier', en: 'Courier' },
      description: { pl: 'Dostawa pod wskazany adres.', en: 'Delivered to your address.' },
      priceGrosze: 2200,
      enabled: true,
      sortOrder: 3,
    },
  ],
}
