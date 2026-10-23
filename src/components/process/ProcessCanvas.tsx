'use client'

import { useEffect, useMemo, useRef } from 'react'
import { ParticleMorph, PostFX, SceneCanvas, useScrollProgress } from 'web-studio-kit'
import { honeycombShape, jarShape, morphProgress, swarmShape } from './shapes'

/**
 * Swarm, then honeycomb, then jar, driven by how far the process section has scrolled.
 * The canvas is sticky inside the section, so it measures the section, not itself.
 */
export default function ProcessCanvas() {
  const container = useRef<HTMLDivElement>(null)
  const section = useRef<HTMLElement | null>(null)
  const morph = useRef(0)
  const shapes = useMemo(() => [swarmShape(), honeycombShape(), jarShape()], [])

  // Runs before useScrollProgress's effect (same component, declared first).
  useEffect(() => {
    section.current = container.current?.closest('section') ?? null
  }, [])
  useScrollProgress(section, {
    cssVar: false,
    onChange: (progress) => {
      morph.current = morphProgress(progress)
    },
  })

  return (
    <div ref={container} style={{ width: '100%', height: '100%' }}>
      <SceneCanvas camera={{ position: [0, 0, 5], fov: 45 }} flat>
        {/* Post-processing outputs an opaque image, so the scene paints the page colour; `flat`
            turns tone mapping off so that colour comes out exactly as the page has it. */}
        <color attach="background" args={['#0c0703']} />
        <ParticleMorph shapes={shapes} progress={morph} color="#ffc164" size={24} />
        <PostFX bloom={0.9} bloomThreshold={0.2} grain={0} />
      </SceneCanvas>
    </div>
  )
}
