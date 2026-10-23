/**
 * Polish UI copy: labels and fixed texts. Content Franciszek edits (products, prices, the
 * story) lives in the CMS, not here. This file defines the keys; `en` must match its shape.
 */
export const pl = {
  meta: {
    title: 'Pasieka Kokot: miód prosto z pasieki',
    description: 'Miód z rodzinnej pasieki Franciszka Kokota. Zamów słoik lub napisz do nas.',
  },
  nav: {
    label: 'Sekcje strony',
    skipToContent: 'Przejdź do treści',
    about: 'O pasiece',
    process: 'Pszczoły',
    offer: 'Oferta',
    howToOrder: 'Jak zamówić',
    order: 'Kontakt',
  },
  languageSwitch: {
    label: 'Język',
    pl: 'Polski',
    en: 'English',
  },
  hero: {
    scrollHint: 'Przewiń, aby poznać pasiekę',
  },
  about: {
    title: 'O pasiece',
    // Alt text for the rendered placeholder images, until real photos replace them.
    photos: {
      comb: 'Plaster miodu w drewnianej ramce, podświetlony nisko stojącym słońcem',
      dipper: 'Miód spływający z drewnianej łyżki do słoika',
      hive: 'Drewniany ul o zmierzchu, pod światło',
    },
  },
  process: {
    title: 'Od roju do słoika',
    intro: 'Jak powstaje miód, w trzech krokach.',
    steps: {
      swarm: {
        title: 'Rój',
        body: 'Pszczoły zbierają nektar z kwiatów w promieniu kilku kilometrów od ula.',
      },
      comb: {
        title: 'Plaster',
        body: 'W ulu nektar dojrzewa w woskowych komórkach, aż stanie się miodem.',
      },
      jar: {
        title: 'Słoik',
        body: 'Miód odwirowujemy z plastrów i rozlewamy do słoików, bez podgrzewania.',
      },
    },
  },
  offer: {
    title: 'Oferta',
    intro: 'Aktualne miody. Ceny zawierają VAT, koszt dostawy doliczamy osobno.',
    available: 'Dostępny',
    unavailable: 'Chwilowo niedostępny',
    featured: 'Polecany',
    size: 'Pojemność',
    price: 'Cena',
  },
  howToOrder: {
    title: 'Jak zamówić',
    intro: 'Płatność przelewem po potwierdzeniu zamówienia. Nie przyjmujemy płatności online.',
    paymentTitle: 'Dane do przelewu',
    accountHolder: 'Odbiorca',
    bankName: 'Bank',
    accountNumber: 'Numer konta',
    deliveryTitle: 'Dostawa',
    free: 'Bezpłatnie',
  },
  order: {
    titleForm: 'Zamów miód',
    titleContact: 'Napisz do nas',
    introForm:
      'Wybierz miody i dostawę. Po wysłaniu dostaniesz e-mail z danymi do przelewu; wysyłamy po zaksięgowaniu wpłaty.',
    introContact: 'Chcesz zamówić miód albo o coś zapytać? Napisz, odpowiemy mailowo.',
    directContact: 'Możesz też napisać lub zadzwonić bezpośrednio:',
    email: 'E-mail',
    phone: 'Telefon',
  },
  forms: {
    name: 'Imię i nazwisko',
    email: 'E-mail',
    phone: 'Telefon',
    address: 'Adres dostawy',
    addressHint: 'Ulica, numer, kod pocztowy, miejscowość. Dla paczkomatu: jego kod.',
    note: 'Uwagi (opcjonalnie)',
    message: 'Wiadomość',
    products: 'Miody',
    quantity: 'Ilość',
    delivery: 'Dostawa',
    subtotal: 'Miody razem',
    deliveryCost: 'Dostawa',
    total: 'Do zapłaty',
    submitOrder: 'Zamawiam z obowiązkiem zapłaty',
    submitContact: 'Wyślij wiadomość',
    sending: 'Wysyłanie…',
    honeypot: 'Nie wypełniaj tego pola',
    ordered: 'Dziękujemy! Zamówienie nr {number} zostało przyjęte.',
    orderedNoNumber: 'Dziękujemy! Zamówienie zostało przyjęte.',
    orderedNext:
      'Wysłaliśmy e-mail z podsumowaniem. Przelej kwotę na konto podane w sekcji „Jak zamówić”, w tytule wpisz numer zamówienia.',
    sent: 'Dziękujemy! Wiadomość została wysłana. Odpowiemy wkrótce.',
    messages: {
      fixErrors: 'Popraw zaznaczone pola.',
      tooMany: 'Zbyt wiele prób. Spróbuj ponownie za kilka minut.',
      unavailable: 'Zamawianie przez stronę jest chwilowo niedostępne. Napisz lub zadzwoń.',
      sendFailed: 'Nie udało się wysłać wiadomości. Napisz bezpośrednio na adres poniżej.',
      emptyOrder: 'Wybierz co najmniej jeden słoik.',
      unavailableProduct: 'Któryś z miodów jest już niedostępny. Odśwież stronę.',
      tooManyItems: 'Maksymalnie 20 sztuk jednego miodu. Przy większym zamówieniu napisz do nas.',
    },
    errors: {
      required: 'To pole jest wymagane.',
      tooLong: 'Za długi tekst.',
      invalidEmail: 'Podaj poprawny adres e-mail.',
      invalidPhone: 'Podaj poprawny numer telefonu.',
    },
  },
  footer: {
    contactTitle: 'Kontakt',
    socialTitle: 'Znajdź nas',
    rights: 'Wszelkie prawa zastrzeżone.',
  },
}
