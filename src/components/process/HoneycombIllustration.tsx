/** The light-mode version of the particle scene: a static honeycomb drawn in SVG. */
export function HoneycombIllustration() {
  const size = 22
  const cells: [number, number][] = []
  for (let q = -3; q <= 3; q++) {
    for (let r = -3; r <= 3; r++) {
      const x = size * Math.sqrt(3) * (q + r / 2)
      const y = size * 1.5 * r
      if (Math.hypot(x, y) < 95) cells.push([x, y])
    }
  }
  const hexagon = (cx: number, cy: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI / 3) * i + Math.PI / 6
      return `${(cx + size * Math.cos(angle)).toFixed(1)},${(cy + size * Math.sin(angle)).toFixed(1)}`
    }).join(' ')
  return (
    <svg
      viewBox="-120 -120 240 240"
      role="presentation"
      aria-hidden="true"
      width="100%"
      height="100%"
    >
      {cells.map(([x, y], i) => (
        <polygon
          key={i}
          points={hexagon(x, y)}
          fill={i % 4 === 0 ? 'rgb(230 160 40 / 0.35)' : 'none'}
          stroke="#e8a83a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
