import { isLocale, localizedPath } from './config'

describe('isLocale', () => {
  it('accepts the supported locales only', () => {
    expect(isLocale('pl')).toBe(true)
    expect(isLocale('en')).toBe(true)
    expect(isLocale('de')).toBe(false)
    expect(isLocale('')).toBe(false)
  })
})

describe('localizedPath', () => {
  it('swaps the locale segment', () => {
    expect(localizedPath('/pl', 'en')).toBe('/en')
    expect(localizedPath('/pl/offer/honey', 'en')).toBe('/en/offer/honey')
    expect(localizedPath('/en/', 'pl')).toBe('/pl')
  })

  it('adds a locale to a path without one', () => {
    expect(localizedPath('/', 'pl')).toBe('/pl')
    expect(localizedPath('/offer', 'en')).toBe('/en/offer')
  })
})
