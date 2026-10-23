/**
 * The rendered stills from blender/stills.py. scripts/build-assets.mts renders each one at
 * `render` size and encodes it at every width in `widths`, as AVIF and WebP, into
 * public/stills/<name>-<width>.<ext>. Components build their srcset from the same list.
 */
export const STILLS = {
  jar: { render: [1200, 1500], widths: [480, 960] },
  'product-acacia': { render: [1000, 1000], widths: [400, 800] },
  'product-linden': { render: [1000, 1000], widths: [400, 800] },
  'product-wildflower': { render: [1000, 1000], widths: [400, 800] },
  'about-comb': { render: [1000, 1250], widths: [400, 800] },
  'about-dipper': { render: [1000, 1250], widths: [400, 800] },
  'about-hive': { render: [1000, 1250], widths: [400, 800] },
  'process-comb': { render: [1400, 1400], widths: [600, 1200] },
} as const satisfies Record<
  string,
  { render: readonly [number, number]; widths: readonly number[] }
>

export type StillName = keyof typeof STILLS

export const STILL_FORMATS = ['avif', 'webp'] as const

export function stillUrl(name: StillName, width: number, format: (typeof STILL_FORMATS)[number]) {
  return `/stills/${name}-${width}.${format}`
}

export function stillSrcSet(name: StillName, format: (typeof STILL_FORMATS)[number]) {
  return STILLS[name].widths.map((w) => `${stillUrl(name, w, format)} ${w}w`).join(', ')
}

/** Placeholder product photos, used in turn for products without an uploaded photo. */
export const PRODUCT_STILLS = ['product-acacia', 'product-linden', 'product-wildflower'] as const

export function productStill(index: number): StillName {
  return PRODUCT_STILLS[index % PRODUCT_STILLS.length]!
}
