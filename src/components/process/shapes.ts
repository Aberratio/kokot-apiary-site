import { sampleSphere, seededRandom } from 'web-studio-kit'

/** One particle count for every shape, so each particle has a place in all three. */
export const PARTICLE_COUNT = 3600

/** A loose swarm: a slightly flattened ball, denser in the middle. */
export function swarmShape(count = PARTICLE_COUNT): Float32Array {
  const points = sampleSphere(count, 1.7, seededRandom(11))
  for (let i = 0; i < count; i++) points[i * 3 + 1]! *= 0.75
  return points
}

/**
 * A honeycomb: hexagon outlines on a hex grid, cells within a circle, with a little depth
 * jitter so the bloom has something to catch.
 */
export function honeycombShape(count = PARTICLE_COUNT): Float32Array {
  const random = seededRandom(23)
  const size = 0.32
  const cells: [number, number][] = []
  for (let q = -6; q <= 6; q++) {
    for (let r = -6; r <= 6; r++) {
      const x = size * Math.sqrt(3) * (q + r / 2)
      const y = size * 1.5 * r
      if (Math.hypot(x, y) < 1.75) cells.push([x, y])
    }
  }
  const points = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const [cx, cy] = cells[i % cells.length]!
    // A random point on a random edge of the cell's hexagon.
    const edge = Math.floor(random() * 6)
    const a0 = (Math.PI / 3) * edge + Math.PI / 6
    const a1 = a0 + Math.PI / 3
    const t = random()
    points[i * 3] = cx + size * (Math.cos(a0) * (1 - t) + Math.cos(a1) * t)
    points[i * 3 + 1] = cy + size * (Math.sin(a0) * (1 - t) + Math.sin(a1) * t)
    points[i * 3 + 2] = (random() - 0.5) * 0.12
  }
  return points
}

/** Radius of the jar at height y (from -1.2 at the base to 1.25 at the lid), or 0 outside. */
export function jarRadius(y: number): number {
  if (y < -1.2 || y > 1.25) return 0
  if (y < -1.1) return 0.78 * ((y + 1.2) / 0.1) // base edge
  if (y < 0.75) return 0.8 // body
  if (y < 0.95) return 0.8 - ((y - 0.75) / 0.2) * 0.25 // shoulder
  if (y < 1.05) return 0.55 // neck
  return 0.62 // lid
}

/** Height of the honey inside the jar. */
export const HONEY_LEVEL = 0.55

/**
 * A jar of honey drawn flat, like the honeycomb before it: outline, lid, the honey's surface
 * line and a sparser fill below it. Seen head-on a 3D jar of points reads as a blob; a
 * drawing reads as a jar.
 */
export function jarShape(count = PARTICLE_COUNT): Float32Array {
  const random = seededRandom(37)
  const points = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const kind = random()
    let x: number
    let y: number
    if (kind < 0.5) {
      // Side walls: both sides of the profile from the base to the neck.
      y = -1.1 + random() * 2.15
      x = (random() < 0.5 ? -1 : 1) * jarRadius(y)
    } else if (kind < 0.6) {
      // Base.
      y = -1.1
      x = (random() * 2 - 1) * 0.8
    } else if (kind < 0.74) {
      // Lid: top, bottom and sides of a band.
      const side = random()
      if (side < 0.7) {
        y = side < 0.35 ? 1.25 : 1.05
        x = (random() * 2 - 1) * 0.62
      } else {
        y = 1.05 + random() * 0.2
        x = (random() < 0.5 ? -1 : 1) * 0.62
      }
    } else if (kind < 0.86) {
      // The honey's surface.
      y = HONEY_LEVEL
      x = (random() * 2 - 1) * 0.76
    } else {
      // Honey: a fill below the surface, a little denser towards the bottom.
      y = -1.06 + Math.pow(random(), 1.4) * (HONEY_LEVEL + 1.06)
      x = (random() * 2 - 1) * 0.74
    }
    points[i * 3] = x
    points[i * 3 + 1] = y
    points[i * 3 + 2] = (random() - 0.5) * 0.1
  }
  return points
}

/** Scroll progress through the section (0..1) to morph progress (0 swarm, 1 comb, 2 jar). */
export function morphProgress(sectionProgress: number): number {
  const t = (sectionProgress - 0.2) / 0.55
  return Math.min(1, Math.max(0, t)) * 2
}
