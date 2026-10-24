'use client'

import { useEffect, useRef, useState } from 'react'
import { afterLoad } from '@/lib/after-load'
import { STILLS, stillSrcSet, stillUrl, type StillName } from '@/lib/stills'

interface LazyStillProps {
  name: StillName
  /** Empty for decoration (the element is then hidden from assistive tech). */
  alt: string
  /** The `sizes` attribute: how wide the image is shown at each breakpoint. */
  sizes: string
  className?: string
}

/**
 * A rendered still (AVIF with a WebP fallback, one file per breakpoint) that is requested only
 * after the page has loaded and when it nears the viewport. Native `loading="lazy"` is not
 * enough: on a phone it fetches images up to a few screens away right at load, and those
 * bytes would compete with the hero title, the page's Largest Contentful Paint.
 *
 * Until then the box holds its size and shows the backdrop colour. Without JavaScript the
 * `noscript` copy loads natively lazy.
 */
export function LazyStill({ name, alt, sizes, className }: LazyStillProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [near, setNear] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => afterLoad(() => setLoaded(true)), [])

  useEffect(() => {
    if (!loaded || near) return
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true)
          observer.disconnect()
        }
      },
      // Small enough that nothing below the hero is near at load on a phone.
      { rootMargin: '200px 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [loaded, near])

  const [width, height] = STILLS[name].render
  const widths = STILLS[name].widths
  // `fade` only for the copy JavaScript inserts: the noscript copy has nothing to reveal it.
  const picture = (fade: boolean) => (
    <picture>
      <source type="image/avif" srcSet={stillSrcSet(name, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={stillSrcSet(name, 'webp')} sizes={sizes} />
      {/* Pre-encoded per breakpoint by scripts/build-assets.mts, so not next/image. */}
      <img
        src={stillUrl(name, widths[widths.length - 1]!, 'webp')}
        alt={alt}
        width={width}
        height={height}
        decoding="async"
        loading="lazy"
        onLoad={fade ? () => setShow(true) : undefined}
        // A failed still shows its alt text rather than an empty tile.
        onError={fade ? () => setShow(true) : undefined}
        data-shown={fade ? show : undefined}
      />
    </picture>
  )

  return (
    <div
      ref={ref}
      className={className}
      data-still={name}
      role={alt ? undefined : 'presentation'}
      aria-hidden={alt ? undefined : true}
    >
      {near ? picture(true) : <noscript>{picture(false)}</noscript>}
    </div>
  )
}
