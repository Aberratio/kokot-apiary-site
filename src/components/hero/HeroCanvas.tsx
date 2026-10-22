'use client'

import { useEffect, useMemo, useRef } from 'react'
import {
  advanceHoneyDipper,
  honeyDipperFragmentShader,
  honeyDipperUniforms,
  PostFX,
  SceneCanvas,
  setHoneyDipperLayout,
  ShaderPlane,
} from 'web-studio-kit'
import { dipperPlacement, WIDE_HERO_QUERY } from './layout'

/** The scene's colours; HeroIllustration and Hero.module.css use the same ones. */
const COLORS = { honey: '#f6a91f', honeyDeep: '#6e2a03', wood: '#9a6634', sun: '#ffc164' }

function currentPlacement() {
  const wide = window.matchMedia(WIDE_HERO_QUERY).matches
  return dipperPlacement(window.innerWidth, window.innerHeight, wide)
}

/**
 * A backlit honey dipper behind the hero: honey runs off it and drips, the pointer turns it,
 * scrolling speeds up the flow and dims the scene. `uScroll` goes from 0 to 1 over the first
 * screen. Rendered at a reduced pixel ratio: it is a raymarcher, and honey is soft anyway.
 */
export default function HeroCanvas() {
  const scroll = useRef(0)
  const uniforms = useMemo(
    () => honeyDipperUniforms(COLORS, { flowSpeed: 0.9, layout: currentPlacement() }),
    [],
  )

  useEffect(() => {
    const onScroll = () => {
      scroll.current = Math.min(1, window.scrollY / window.innerHeight)
    }
    const onResize = () => setHoneyDipperLayout(uniforms, currentPlacement())
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [uniforms])

  return (
    <SceneCanvas dpr={[0.6, 1]}>
      <ShaderPlane
        fragmentShader={honeyDipperFragmentShader}
        uniforms={uniforms}
        scroll={scroll}
        onFrame={advanceHoneyDipper}
      />
      <PostFX bloom={0.55} bloomThreshold={0.78} grain={0.045} />
    </SceneCanvas>
  )
}
