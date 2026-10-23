import { LazyStill } from '../stills/LazyStill'

/** The light-mode version of the 3D jar: the same jar, rendered in Blender with the same light. */
export function JarStill({ className }: { className?: string }) {
  return (
    <LazyStill
      name="jar"
      alt=""
      className={className}
      sizes="(min-width: 48rem) min(32rem, 45vw), calc(100vw - 2rem)"
    />
  )
}
