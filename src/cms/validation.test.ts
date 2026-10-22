import {
  formatGroszeForInput,
  parseForm,
  parsePriceToGrosze,
  productSchema,
  settingsSchema,
} from './validation'

function form(values: Record<string, string>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(values)) data.set(key, value)
  return data
}

describe('parsePriceToGrosze', () => {
  it.each([
    ['60', 6000],
    ['60,5', 6050],
    ['60.50', 6050],
    ['1 200,00', 120000],
    ['18,00 zł', 1800],
    ['0', 0],
  ])('reads %s as %i grosze', (input, grosze) => {
    expect(parsePriceToGrosze(input)).toBe(grosze)
  })

  it.each(['', 'abc', '-5', '1,234', '1.2.3'])('rejects %s', (input) => {
    expect(parsePriceToGrosze(input)).toBeNull()
  })

  it('round-trips through the input format', () => {
    expect(parsePriceToGrosze(formatGroszeForInput(6050))).toBe(6050)
  })
})

describe('productSchema', () => {
  const valid = { namePl: 'Miód', nameEn: 'Honey', priceGrosze: '60,00', available: 'on' }

  it('parses a valid form, with missing checkboxes as false', () => {
    const result = parseForm(productSchema, form({ ...valid, descriptionPl: '', size: '' }))
    expect(result.ok && result.data).toMatchObject({
      priceGrosze: 6000,
      available: true,
      featured: false,
      sortOrder: 0,
    })
  })

  it('names the fields that failed, as dictionary keys', () => {
    const result = parseForm(productSchema, form({ ...valid, nameEn: ' ', priceGrosze: 'x' }))
    expect(result.ok).toBe(false)
    expect(!result.ok && result.errors).toMatchObject({
      nameEn: 'required',
      priceGrosze: 'invalidPrice',
    })
  })
})

describe('settingsSchema', () => {
  const valid = {
    apiaryName: 'Pasieka',
    orderMode: 'form',
    contactEmail: 'a@b.pl',
    socialLinks: 'Facebook | https://facebook.com/x\n\nInstagram | https://instagram.com/y',
  }

  it('reads one social link per line', () => {
    const result = parseForm(settingsSchema, form(valid))
    expect(result.ok && result.data.socialLinks).toEqual([
      { label: 'Facebook', url: 'https://facebook.com/x' },
      { label: 'Instagram', url: 'https://instagram.com/y' },
    ])
  })

  it('rejects a bad email, a bad link and an unknown order mode', () => {
    const result = parseForm(
      settingsSchema,
      form({
        ...valid,
        contactEmail: 'nope',
        socialLinks: 'X | javascript:alert(1)',
        orderMode: 'shop',
      }),
    )
    expect(!result.ok && result.errors).toMatchObject({
      contactEmail: 'invalidEmail',
      socialLinks: 'invalidUrl',
      orderMode: 'invalidChoice',
    })
  })
})
