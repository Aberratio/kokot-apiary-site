import {
  HONEY_LEVEL,
  honeycombShape,
  jarRadius,
  jarShape,
  morphProgress,
  PARTICLE_COUNT,
  swarmShape,
} from './shapes'

describe('process shapes', () => {
  it('all have the same particle count', () => {
    for (const shape of [swarmShape(), honeycombShape(), jarShape()]) {
      expect(shape).toHaveLength(PARTICLE_COUNT * 3)
      expect(shape.every(Number.isFinite)).toBe(true)
    }
  })

  it('keeps the honeycomb flat and inside its circle', () => {
    const comb = honeycombShape()
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      expect(Math.abs(comb[i * 3 + 2]!)).toBeLessThanOrEqual(0.06)
      expect(Math.hypot(comb[i * 3]!, comb[i * 3 + 1]!)).toBeLessThan(2.1)
    }
  })

  it('draws the jar flat and within its outline', () => {
    const jar = jarShape()
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = jar[i * 3]!
      const y = jar[i * 3 + 1]!
      expect(Math.abs(jar[i * 3 + 2]!)).toBeLessThanOrEqual(0.05)
      // Positions are stored as float32, so edges land a hair either side of their value.
      const e = 1e-6
      expect(y).toBeGreaterThanOrEqual(-1.1 - e)
      expect(y).toBeLessThanOrEqual(1.25 + e)
      expect(Math.abs(x)).toBeLessThanOrEqual(Math.max(jarRadius(y - e), jarRadius(y + e)) + e)
    }
  })

  it('fills honey only below its surface', () => {
    const jar = jarShape()
    let honey = 0
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const y = jar[i * 3 + 1]!
      if (y > -1.1 && y < HONEY_LEVEL && Math.abs(jar[i * 3]!) < 0.75) honey++
    }
    // Roughly the fill share of the particles, and never empty.
    expect(honey).toBeGreaterThan(PARTICLE_COUNT * 0.1)
  })

  it('maps section scroll to a morph that rests at both ends', () => {
    expect(morphProgress(0)).toBe(0)
    expect(morphProgress(0.2)).toBe(0)
    expect(morphProgress(0.475)).toBeCloseTo(1)
    expect(morphProgress(0.75)).toBe(2)
    expect(morphProgress(1)).toBe(2)
  })
})
