'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DoubleSide, type Group, LatheGeometry, PMREMGenerator, Vector2 } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { readEffectsBudget, SceneCanvas } from 'web-studio-kit'

/** Half-profile of the glass, bottom to rim: [radius, height]. */
const GLASS_PROFILE: [number, number][] = [
  [0, -1.2],
  [0.72, -1.2],
  [0.8, -1.12],
  [0.8, 0.72],
  [0.62, 0.92],
  [0.56, 0.98],
  [0.56, 1.08],
]

function lathe(profile: [number, number][], segments = 64) {
  return new LatheGeometry(
    profile.map(([r, y]) => new Vector2(r, y)),
    segments,
  )
}

/** Image-based lighting from three's built-in room, so nothing is downloaded. */
function RoomLighting() {
  const get = useThree((state) => state.get)
  useEffect(() => {
    // Read inside the effect: the scene is three's own object, not React state.
    const { gl, scene } = get()
    const pmrem = new PMREMGenerator(gl)
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = environment
    return () => {
      scene.environment = null
      environment.dispose()
      pmrem.dispose()
    }
  }, [get])
  return null
}

function Jar({ rich }: { rich: boolean }) {
  const group = useRef<Group>(null)
  const pointer = useThree((state) => state.pointer)
  const glass = useMemo(() => lathe(GLASS_PROFILE), [])
  // Honey fills the body up to just below the shoulder, slightly inside the glass.
  const honey = useMemo(
    () =>
      lathe([
        [0, -1.14],
        [0.74, -1.14],
        [0.76, -1.08],
        [0.76, 0.62],
        [0, 0.62],
      ]),
    [],
  )
  useEffect(
    () => () => {
      glass.dispose()
      honey.dispose()
    },
    [glass, honey],
  )

  useFrame((_, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * 0.25
    // Tilt toward the pointer, eased.
    group.current.rotation.x += (pointer.y * 0.25 - group.current.rotation.x) * 0.05
    group.current.rotation.z += (-pointer.x * 0.15 - group.current.rotation.z) * 0.05
  })

  return (
    <group ref={group}>
      <mesh geometry={honey}>
        {rich ? (
          // Not transmissive: three draws transmissive objects without the other transmissive
          // ones behind them, so transmissive honey would vanish inside transmissive glass.
          // A clearcoat and a warm glow give it the depth instead.
          <meshPhysicalMaterial
            color="#c4700c"
            roughness={0.22}
            envMapIntensity={0.6}
            clearcoat={1}
            clearcoatRoughness={0.08}
            emissive="#3d1600"
            emissiveIntensity={0.3}
          />
        ) : (
          <meshStandardMaterial color="#d48a14" roughness={0.25} metalness={0.05} />
        )}
      </mesh>
      <mesh geometry={glass}>
        {rich ? (
          // A dim reflection keeps the glass clear; the bright built-in room turns it milky.
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.02}
            transmission={1}
            thickness={0.15}
            ior={1.5}
            envMapIntensity={0.35}
          />
        ) : (
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.1}
            transparent
            opacity={0.18}
            side={DoubleSide}
          />
        )}
      </mesh>
      <mesh position={[0, 1.17, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 0.2, 64]} />
        <meshStandardMaterial color="#c9a227" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  )
}

/** The featured product as a code-built 3D jar of honey that turns and follows the pointer. */
export default function JarCanvas() {
  // Transmission renders the scene twice per frame; only strong machines get it.
  const [rich] = useState(() => readEffectsBudget() === 'high')
  return (
    <SceneCanvas camera={{ position: [0, 0.2, 4.2], fov: 40 }}>
      <RoomLighting />
      <directionalLight position={[3, 4, 2]} intensity={1.2} />
      <Jar rich={rich} />
    </SceneCanvas>
  )
}
