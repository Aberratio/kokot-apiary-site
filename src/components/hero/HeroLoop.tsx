'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { afterLoad } from '@/lib/after-load'
import regions from '@/lib/hero-loops.json'
import { HERO_LOOPS, loopUrl, type HeroLoopRegion } from '@/lib/stills'
import { WIDE_HERO_MEDIA } from './media'

type LoopStill = keyof typeof HERO_LOOPS

/**
 * The honey drip as a seamless video loop, laid over its part of the hero still so the still
 * becomes a cinemagraph. Loaded only after the page has loaded (it must not compete with the
 * title), never under reduced motion or Save-Data, and paused while the hero is off screen.
 * It fades in once it plays; until then, or if VP9 is not supported, the still shows the
 * same drip standing still.
 */
export function HeroLoop({ className }: { className?: string }) {
  const [still, setStill] = useState<LoopStill | null>(null)
  const [playing, setPlaying] = useState(false)
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (nav.connection?.saveData) return
    if (!document.createElement('video').canPlayType('video/webm; codecs="vp9"')) return
    const wide = window.matchMedia(WIDE_HERO_MEDIA)
    const pick = () => {
      setPlaying(false)
      setStill(wide.matches ? 'hero-wide' : 'hero-tall')
    }
    const cancel = afterLoad(pick)
    wide.addEventListener('change', pick)
    return () => {
      cancel()
      wide.removeEventListener('change', pick)
    }
  }, [])

  useEffect(() => {
    const element = video.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) element.play().catch(() => {})
      else element.pause()
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [still])

  if (!still) return null
  const region = (regions as Record<string, HeroLoopRegion>)[still]
  if (!region) return null
  const style = {
    '--x': region.x,
    '--y': region.y,
    '--w': region.w,
    '--h': region.h,
  } as CSSProperties

  return (
    <video
      key={still}
      ref={video}
      className={className}
      style={style}
      src={loopUrl(still)}
      muted
      loop
      autoPlay
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      data-playing={playing}
      onPlaying={() => setPlaying(true)}
    />
  )
}
