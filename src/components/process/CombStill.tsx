import { LazyStill } from '../stills/LazyStill'

/** The light-mode version of the particle scene: a rendered comb, lit like the hero. */
export function CombStill({ className }: { className?: string }) {
  return (
    <LazyStill
      name="process-comb"
      alt=""
      className={className}
      sizes="(min-width: 60rem) 34rem, calc(100vw - 2rem)"
    />
  )
}
