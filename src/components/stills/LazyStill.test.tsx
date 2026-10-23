import { act, cleanup, render } from '@testing-library/react'
import { LazyStill } from './LazyStill'

type Callback = (entries: { isIntersecting: boolean }[]) => void
const observers: { callback: Callback; options?: IntersectionObserverInit }[] = []

beforeEach(() => {
  observers.length = 0
  vi.useFakeTimers()
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: Callback, options?: IntersectionObserverInit) {
        observers.push({ callback, options })
      }
      observe() {}
      disconnect() {}
    },
  )
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const still = () =>
  render(<LazyStill name="about-hive" alt="A hive" sizes="100vw" className="photo" />)

describe('LazyStill', () => {
  it('requests nothing until the page has loaded and the still is near the viewport', () => {
    const readyState = vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading')
    const { container } = still()
    // Before load: only the noscript copy, which the browser does not fetch with scripts on.
    expect(container.querySelector('picture')).toBeNull()
    act(() => vi.runAllTimers())
    expect(observers).toHaveLength(0)

    readyState.mockReturnValue('complete')
    act(() => {
      window.dispatchEvent(new Event('load'))
      vi.runAllTimers()
    })
    expect(observers).toHaveLength(1)
    expect(observers[0]!.options?.rootMargin).toBe('200px 0px')
    expect(container.querySelector('picture')).toBeNull()

    act(() => observers[0]!.callback([{ isIntersecting: true }]))
    const sources = container.querySelectorAll('source')
    expect(sources[0]!.getAttribute('type')).toBe('image/avif')
    expect(sources[0]!.getAttribute('srcset')).toContain('/stills/about-hive-800.avif 800w')
    const img = container.querySelector('img')!
    expect(img.getAttribute('alt')).toBe('A hive')
    expect(img.getAttribute('src')).toBe('/stills/about-hive-800.webp')

    // Hidden until decoded, then faded in.
    expect(img.dataset.shown).toBe('false')
    act(() => img.dispatchEvent(new Event('load')))
    expect(img.dataset.shown).toBe('true')
  })

  it('hides a decorative still from assistive tech', () => {
    const { container } = render(<LazyStill name="jar" alt="" sizes="100vw" />)
    expect(container.firstElementChild!.getAttribute('aria-hidden')).toBe('true')
  })
})
