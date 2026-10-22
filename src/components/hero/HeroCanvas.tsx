'use client'

import { Canvas } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { ShaderPlane } from 'web-studio-kit'

/** Full-screen shader behind the hero. `uScroll` goes from 0 to 1 over the first screen. */
export default function HeroCanvas() {
  const scroll = useRef(0)

  useEffect(() => {
    const update = () => {
      scroll.current = Math.min(1, window.scrollY / window.innerHeight)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    // A capped pixel ratio keeps a full-screen fragment shader affordable on dense screens.
    <Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: 'high-performance' }}>
      <ShaderPlane scroll={scroll} />
    </Canvas>
  )
}
