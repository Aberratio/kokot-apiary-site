'use client'

import { useEffect, useMemo, useRef } from 'react'
import {
  fluidFragmentShader,
  fluidUniforms,
  PostFX,
  SceneCanvas,
  ShaderPlane,
} from 'web-studio-kit'

/** Honey colours for the kit's fluid shader. */
const HONEY = { deep: '#2e1402', mid: '#c27410', highlight: '#ffd889' }

/**
 * Flowing honey behind the hero: thick, slow, pushed around by the pointer, darkening as the
 * page scrolls. `uScroll` goes from 0 to 1 over the first screen.
 */
export default function HeroCanvas() {
  const scroll = useRef(0)
  const uniforms = useMemo(() => fluidUniforms(HONEY, { viscosity: 1.6, distortion: 1.2 }), [])

  useEffect(() => {
    const update = () => {
      scroll.current = Math.min(1, window.scrollY / window.innerHeight)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <SceneCanvas>
      <ShaderPlane fragmentShader={fluidFragmentShader} uniforms={uniforms} scroll={scroll} />
      <PostFX bloom={0.45} bloomThreshold={0.72} grain={0.05} />
    </SceneCanvas>
  )
}
