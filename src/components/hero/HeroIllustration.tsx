/**
 * The light-mode version of the hero scene: the same backlit honey dipper, drawn flat. A
 * wooden dipper tilted up to the right, honey on its lower side and a drip about to let go.
 * The sun glow behind it continues in the hero's CSS background.
 */
export function HeroIllustration({ className }: { className?: string }) {
  // Ridges along the head's axis, in the head's own frame (axis vertical, handle up).
  const ridges = [-80, -48, -16, 16, 48, 80].map((y) => ({
    y,
    half: 62 * Math.sqrt(1 - (y / 115) ** 2),
  }))
  return (
    <svg
      className={className}
      viewBox="0 0 400 600"
      preserveAspectRatio="xMidYMin meet"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="hero-sun">
          <stop offset="0" stopColor="#ffd28a" stopOpacity="0.6" />
          <stop offset="0.4" stopColor="#e09a32" stopOpacity="0.2" />
          <stop offset="1" stopColor="#6e2a03" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hero-wood" x1="0" x2="1">
          <stop offset="0" stopColor="#2b170a" />
          <stop offset="0.28" stopColor="#7d5029" />
          <stop offset="0.5" stopColor="#5e3a1c" />
          <stop offset="0.86" stopColor="#2a160a" />
          <stop offset="1" stopColor="#d79a4e" />
        </linearGradient>
        <radialGradient id="hero-honey" cx="0.62" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffd25e" />
          <stop offset="0.45" stopColor="#f0a020" />
          <stop offset="1" stopColor="#8a3a05" />
        </radialGradient>
        <linearGradient id="hero-stream" x1="0" x2="1">
          <stop offset="0" stopColor="#b5560a" />
          <stop offset="0.45" stopColor="#ffc847" />
          <stop offset="1" stopColor="#c9700f" />
        </linearGradient>
        <radialGradient id="hero-drip-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffb93a" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffb93a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* The sun behind the dipper; the glow fades out before the circle's edge. */}
      <circle cx="320" cy="40" r="230" fill="url(#hero-sun)" />

      <g transform="translate(200 250) rotate(40)">
        {/* Handle, collar and neck, running out of the frame. */}
        <rect x="-11" y="-640" width="22" height="510" rx="11" fill="url(#hero-wood)" />
        <rect x="-15" y="-180" width="30" height="10" rx="5" fill="url(#hero-wood)" />
        <path d="M-25 -98 L-11 -142 H11 L25 -98 Z" fill="url(#hero-wood)" />
        {/* Grooved head: a core with six discs. */}
        <rect x="-27" y="-102" width="54" height="204" rx="22" fill="#2a160a" />
        {ridges.map(({ y, half }) => (
          <rect
            key={y}
            x={-half}
            y={y - 11}
            width={half * 2}
            height="22"
            rx="10"
            fill="url(#hero-wood)"
          />
        ))}
        {/* Honey on the lower side, its upper edge sagging. */}
        <path
          d="M-52 36 C-34 22 -14 30 4 12 C20 -4 42 -12 68 -38 L72 8 C74 50 64 90 42 108 C20 122 -22 120 -42 104 C-60 90 -62 60 -52 36 Z"
          fill="url(#hero-honey)"
          opacity="0.94"
        />
        <path
          d="M-30 40 C-18 34 -6 36 6 26 M-36 74 C-20 66 0 70 14 58"
          stroke="#fff4d6"
          strokeOpacity="0.55"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* The stream, thinning as it falls, pinched above a drop about to break off. */}
      <ellipse cx="161" cy="520" rx="46" ry="60" fill="url(#hero-drip-glow)" />
      <path
        d="M150 340 C154 400 156 460 157 508 C157 518 151 524 151 536 A10 13 0 0 0 171 536 C171 524 165 518 165 508 C166 460 168 400 173 340 Z"
        fill="url(#hero-stream)"
      />
      <ellipse cx="157" cy="532" rx="2.5" ry="5" fill="#fff4d6" opacity="0.7" />
    </svg>
  )
}
