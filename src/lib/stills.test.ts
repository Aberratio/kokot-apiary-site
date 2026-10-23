import fs from 'node:fs'
import path from 'node:path'
import {
  productStill,
  STILL_FORMATS,
  STILLS,
  stillSrcSet,
  stillUrl,
  type StillName,
} from './stills'

const names = Object.keys(STILLS) as StillName[]

describe('stills', () => {
  it('has every encoded file in public/, within its size budget', () => {
    // Budgets per file, in KB: the stills are small on purpose (see docs/plan.md).
    const budget = (name: StillName, width: number) =>
      name === 'process-comb' || name === 'jar' ? (width > 800 ? 90 : 45) : width > 500 ? 50 : 35
    for (const name of names) {
      for (const width of STILLS[name].widths) {
        for (const format of STILL_FORMATS) {
          const file = path.join('public', stillUrl(name, width, format))
          expect(fs.existsSync(file), file).toBe(true)
          expect(fs.statSync(file).size / 1024, file).toBeLessThanOrEqual(budget(name, width))
        }
      }
    }
  })

  it('keeps the jar model within its 60 KB budget', () => {
    expect(fs.statSync('public/models/jar.glb').size / 1024).toBeLessThanOrEqual(60)
  })

  it('lists every width in the srcset', () => {
    expect(stillSrcSet('about-comb', 'avif')).toBe(
      '/stills/about-comb-400.avif 400w, /stills/about-comb-800.avif 800w',
    )
  })

  it('cycles the product placeholders', () => {
    expect([0, 1, 2, 3].map(productStill)).toEqual([
      'product-acacia',
      'product-linden',
      'product-wildflower',
      'product-acacia',
    ])
  })
})
