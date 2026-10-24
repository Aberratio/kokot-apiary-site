/**
 * Wide screens get the wide frame (subject right, title left); phones and portrait screens
 * the tall one (subject up top, title below). Hero.module.css switches layout on the same query.
 */
export const WIDE_HERO_MEDIA = '(min-width: 48rem) and (min-aspect-ratio: 1/1)'

/** Soft out-of-focus motes drifting in front of the scene: positions in % of the hero. */
export interface Mote {
  x: number
  y: number
  /** Diameter in rem. */
  size: number
  /** Seconds for one drift up and back. */
  duration: number
  delay: number
  /** How far it drifts, in rem. */
  rise: number
  opacity: number
}

/** A fixed set, from a seeded generator, so the server and the client render the same. */
export function makeMotes(count: number, seed = 7): Mote[] {
  let state = seed
  const random = () => {
    // mulberry32
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return Array.from({ length: count }, () => ({
    // Mostly right of the title and in the upper part, where the sun glow is.
    x: 30 + 70 * random(),
    y: 4 + 66 * random(),
    size: 0.35 + 1.6 * random() ** 2,
    duration: 9 + 10 * random(),
    delay: -20 * random(),
    rise: 1.5 + 3 * random(),
    opacity: 0.25 + 0.5 * random(),
  }))
}
