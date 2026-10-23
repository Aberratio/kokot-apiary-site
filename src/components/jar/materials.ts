import { AdditiveBlending, Color, ShaderMaterial } from 'three'

/**
 * Materials for the backlit jar, matching the Blender still rather than simulating light:
 * a real glass and honey simulation needs transmission, which renders the scene twice and,
 * in three.js, cannot show transmissive honey through transmissive glass. These two small
 * shaders look the same on every device and cost one pass.
 */

const vertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vHeight;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec4 view = viewMatrix * world;
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-view.xyz);
    // World height: the model's own positions are quantised by gltfpack.
    vHeight = world.y;
    gl_Position = projectionMatrix * view;
  }
`

/**
 * Clear glass: almost invisible face-on, with warm bright edges where it turns away from the
 * camera, and a highlight on the side the sun is on. Added on top of what is behind it.
 */
export function glassMaterial(sun = '#ffc164') {
  return new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: /* glsl */ `
      uniform vec3 uSun;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec3 n = normalize(vNormal);
        float facing = abs(dot(n, normalize(vView)));
        float edge = pow(1.0 - facing, 3.0);
        // The sun is up and right, behind the jar: its side of the glass catches more light.
        float sunSide = smoothstep(-0.2, 0.9, dot(n, normalize(vec3(0.8, 0.5, -0.2))));
        vec3 color = uSun * (0.01 + edge * (0.45 + 0.8 * sunSide));
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }
    `,
    uniforms: { uSun: { value: new Color(sun) } },
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  })
}

/**
 * Backlit honey: brightest where you look through the middle, deepening towards honeyDeep at
 * the edges where the light crosses more honey, a little brighter near the top where the sun
 * comes through, and a soft highlight from the surface.
 */
export function honeyMaterial(honey = '#f6a91f', deep = '#6e2a03', glow = '#ffcf7a') {
  return new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: /* glsl */ `
      uniform vec3 uHoney;
      uniform vec3 uDeep;
      uniform vec3 uGlow;
      varying vec3 vNormal;
      varying vec3 vView;
      varying float vHeight;
      void main() {
        vec3 n = normalize(vNormal);
        vec3 v = normalize(vView);
        float facing = abs(dot(n, v));
        // Height runs from the jar's base (-1.1) to the honey's surface (0.6).
        float up = clamp((vHeight + 1.1) / 1.7, 0.0, 1.0);
        float through = pow(facing, 4.0);
        // How much backlight reaches the eye: dimmer at the edges and towards the bottom.
        // Less light shifts the hue to deep amber rather than just darkening it.
        float light = through * (0.08 + 0.92 * pow(up, 1.4));
        vec3 body = mix(uDeep * 0.55, uHoney, smoothstep(0.0, 0.75, light));
        body = mix(body, uGlow, 0.55 * smoothstep(0.55, 1.0, light));
        // A broad sheen from the sun, up and right.
        vec3 h = normalize(normalize(vec3(0.6, 0.8, 0.4)) + v);
        float sheen = pow(max(dot(n, h), 0.0), 60.0) * 0.45;
        gl_FragColor = vec4(body + sheen, 1.0);
        #include <colorspace_fragment>
      }
    `,
    uniforms: {
      uHoney: { value: new Color(honey) },
      uDeep: { value: new Color(deep) },
      uGlow: { value: new Color(glow) },
    },
  })
}
