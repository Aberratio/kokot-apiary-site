import { makeMotes } from './media'

describe('makeMotes', () => {
  it('gives the same motes on every call, so server and client markup match', () => {
    expect(makeMotes(16)).toEqual(makeMotes(16))
  })

  it('keeps every mote inside the hero', () => {
    for (const mote of makeMotes(64)) {
      expect(mote.x).toBeGreaterThanOrEqual(0)
      expect(mote.x).toBeLessThanOrEqual(100)
      expect(mote.y).toBeGreaterThanOrEqual(0)
      expect(mote.y).toBeLessThanOrEqual(100)
      expect(mote.opacity).toBeLessThanOrEqual(1)
    }
  })
})
