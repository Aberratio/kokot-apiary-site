'use client'

import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { type Group, type Material, type Mesh, MeshStandardMaterial } from 'three'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { BacklitEnvironment, SceneCanvas } from 'web-studio-kit'
import { glassMaterial, honeyMaterial } from './materials'

/** Built by blender/export_jar.py and compressed by scripts/build-assets.mts (about 38 KB). */
export const JAR_MODEL_URL = '/models/jar.glb'

/** The hero's colours (HeroCanvas.tsx). */
const HONEY = '#f6a91f'
const HONEY_DEEP = '#6e2a03'
const SUN = '#ffc164'

function materials(): Record<string, Material> {
  return {
    Honey: honeyMaterial(HONEY, HONEY_DEEP),
    Glass: glassMaterial(SUN),
    // Gold lid: its highlight comes from the backlit environment's sun panel.
    Lid: new MeshStandardMaterial({
      color: '#c9a227',
      metalness: 0.9,
      roughness: 0.32,
      envMapIntensity: 2.2,
    }),
  }
}

function Jar() {
  const group = useRef<Group>(null)
  const pointer = useThree((state) => state.pointer)
  const gltf = useLoader(GLTFLoader, JAR_MODEL_URL, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder)
  })
  const byName = useMemo(() => materials(), [])
  const model = useMemo(() => {
    const scene = gltf.scene.clone()
    scene.traverse((object) => {
      const mesh = object as Mesh
      if (!mesh.isMesh) return
      // gltfpack may wrap a named node around its mesh, so look at the parent's name too.
      const material = byName[mesh.name] ?? byName[mesh.parent?.name ?? '']
      if (material) mesh.material = material
      // Glass draws after the honey and the lid, so they show through it.
      mesh.renderOrder = material === byName.Glass ? 1 : 0
    })
    return scene
  }, [gltf, byName])
  useEffect(() => () => Object.values(byName).forEach((m) => m.dispose()), [byName])

  useFrame((_, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * 0.25
    // Tilt toward the pointer, eased.
    group.current.rotation.x += (pointer.y * 0.2 - group.current.rotation.x) * 0.05
    group.current.rotation.z += (-pointer.x * 0.12 - group.current.rotation.z) * 0.05
  })

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  )
}

/**
 * The featured product as the Blender jar of honey, lit like the hero: a warm sun up, right
 * and behind it, a dim rim on the left and a dark room, so the glass stays clear and the
 * honey glows. The glass and honey are shaders matched to the Blender still (materials.ts);
 * the environment lights the lid. It turns slowly and follows the pointer.
 */
export default function JarCanvas() {
  return (
    <SceneCanvas camera={{ position: [0, 0.25, 5.4], fov: 32 }}>
      <BacklitEnvironment intensity={5} />
      {/* The sun from behind for the honey's rim, and a soft warm key from the front left. */}
      <directionalLight position={[3, 4, -4]} intensity={2.4} color={SUN} />
      <directionalLight position={[-3, 1.5, 3]} intensity={0.5} color="#ffd9a0" />
      <Suspense fallback={null}>
        <Jar />
      </Suspense>
    </SceneCanvas>
  )
}
