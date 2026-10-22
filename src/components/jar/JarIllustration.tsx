/** The light-mode version of the 3D jar: a flat jar of honey in SVG. */
export function JarIllustration() {
  return (
    <svg viewBox="0 0 200 260" role="presentation" aria-hidden="true" width="100%" height="100%">
      <defs>
        <linearGradient id="jar-honey" x1="0" x2="1">
          <stop offset="0" stopColor="#9a4f00" />
          <stop offset="0.45" stopColor="#e7a224" />
          <stop offset="1" stopColor="#a35a00" />
        </linearGradient>
      </defs>
      <rect x="58" y="12" width="84" height="26" rx="5" fill="#c9a227" />
      <path
        d="M66 38 h68 v10 q0 8 14 16 q14 8 14 22 v150 q0 12 -12 12 h-120 q-12 0 -12 -12 v-150 q0 -14 14 -22 q14 -8 14 -16 z"
        fill="rgb(255 255 255 / 0.08)"
        stroke="rgb(255 255 255 / 0.5)"
        strokeWidth="2"
      />
      <path d="M44 100 h112 v128 q0 8 -8 8 h-96 q-8 0 -8 -8 z" fill="url(#jar-honey)" />
      <path
        d="M58 110 q-4 50 0 110"
        stroke="rgb(255 255 255 / 0.35)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}
