import { locales } from './config'
import { getDictionary } from './dictionaries'

function leaves(value: unknown, path = ''): [string, unknown][] {
  if (typeof value !== 'object' || value === null) return [[path, value]]
  return Object.entries(value).flatMap(([key, child]) =>
    leaves(child, path ? `${path}.${key}` : key),
  )
}

describe('dictionaries', () => {
  const keys = (locale: (typeof locales)[number]) => leaves(getDictionary(locale)).map(([k]) => k)

  it('have the same keys in every language', () => {
    for (const locale of locales) expect(keys(locale)).toEqual(keys('pl'))
  })

  it('have no empty strings', () => {
    for (const locale of locales) {
      for (const [key, value] of leaves(getDictionary(locale))) {
        expect(value, `${locale}: ${key}`).toEqual(expect.stringMatching(/\S/))
      }
    }
  })
})
