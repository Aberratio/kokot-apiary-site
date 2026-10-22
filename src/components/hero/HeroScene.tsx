'use client'

import dynamic from 'next/dynamic'

// three.js and the shader are only downloaded when QualityGate decides to render this.
export const HeroScene = dynamic(() => import('./HeroCanvas'), { ssr: false })
