'use client'

import dynamic from 'next/dynamic'

// three.js and the particle shaders load only when QualityGate mounts this.
export const ProcessScene = dynamic(() => import('./ProcessCanvas'), { ssr: false })
