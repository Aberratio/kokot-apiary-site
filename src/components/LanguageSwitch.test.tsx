import { cleanup, render, screen } from '@testing-library/react'
import { getDictionary } from '@/i18n/dictionaries'
import { LanguageSwitch } from './LanguageSwitch'

const pathname = vi.hoisted(() => ({ current: '/pl' }))
vi.mock('next/navigation', () => ({ usePathname: () => pathname.current }))

afterEach(cleanup)

describe('LanguageSwitch', () => {
  it('links to the same page in every language and marks the current one', () => {
    pathname.current = '/pl/offer'
    render(<LanguageSwitch current="pl" labels={getDictionary('pl').languageSwitch} />)

    const polish = screen.getByRole('link', { name: 'Polski' })
    const english = screen.getByRole('link', { name: 'English' })
    expect(polish.getAttribute('href')).toBe('/pl/offer')
    expect(english.getAttribute('href')).toBe('/en/offer')
    expect(english.getAttribute('hreflang')).toBe('en')
    expect(polish.getAttribute('aria-current')).toBe('page')
    expect(english.getAttribute('aria-current')).toBeNull()
  })

  it('labels the navigation in the page language', () => {
    render(<LanguageSwitch current="en" labels={getDictionary('en').languageSwitch} />)
    expect(screen.getByRole('navigation', { name: 'Language' })).toBeTruthy()
  })
})
