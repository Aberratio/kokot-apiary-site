'use client'

import dynamic from 'next/dynamic'

// three.js and the jar load only when QualityGate mounts this.
export const JarScene = dynamic(() => import('./JarCanvas'), { ssr: false })
