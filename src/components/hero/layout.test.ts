import { dipperPlacement } from './layout'

describe('dipperPlacement', () => {
  it('puts the dipper right of centre on wide screens, further out on wider ones', () => {
    const laptop = dipperPlacement(1280, 800, true)
    const ultrawide = dipperPlacement(2560, 1080, true)
    expect(laptop.x).toBeGreaterThan(0.2)
    expect(ultrawide.x).toBeGreaterThan(laptop.x)
    expect(ultrawide.x).toBeLessThanOrEqual(0.5)
  })

  it('puts the dipper above the text on phones, small enough to fit the width', () => {
    const phone = dipperPlacement(375, 760, false)
    expect(phone.y).toBeGreaterThan(0)
    expect(Math.abs(phone.x)).toBeLessThan(0.1)
    expect(phone.scale).toBeLessThan(dipperPlacement(1280, 800, true).scale)
  })
})
