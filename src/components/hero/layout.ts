import type { HoneyDipperPlacement } from 'web-studio-kit'

/**
 * Wide screens put the text on the left and the dipper on the right; everything else (phones,
 * portrait tablets) puts the dipper above the text. Hero.module.css uses the same query.
 */
export const WIDE_HERO_QUERY = '(min-width: 48rem) and (min-aspect-ratio: 1/1)'

/** Where the shader draws the dipper for a viewport, in the kit's screen-height units. */
export function dipperPlacement(
  width: number,
  height: number,
  wide: boolean,
): HoneyDipperPlacement {
  const aspect = width / Math.max(height, 1)
  if (wide) return { x: Math.min(0.19 * aspect, 0.5), y: 0.01, scale: 0.82 }
  return { x: 0.03, y: 0.2, scale: Math.min(0.55, 1.1 * aspect) }
}
