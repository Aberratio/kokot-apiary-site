// Rebuilds every Blender asset from source: renders the stills, encodes them for the web, and
// exports and compresses the jar model.
//
//   npm run assets:build                       # everything
//   npm run assets:build -- --only jar,about-comb --samples 64
//   npm run assets:build -- --skip-render      # re-encode existing renders only
//
// Blender comes from BLENDER, else the default Windows install path, else `blender` on PATH.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import sharp, { type Sharp } from 'sharp'
import {
  HERO_LOOPS,
  loopName,
  loopUrl,
  STILL_FORMATS,
  STILLS,
  type HeroLoopRegion,
  type StillName,
} from '../src/lib/stills'

const ROOT = path.resolve(import.meta.dirname, '..')
const BUILD = path.join(ROOT, 'blender', 'build')
const STILLS_OUT = path.join(ROOT, 'public', 'stills')
const MODEL_OUT = path.join(ROOT, 'public', 'models', 'jar.glb')
const WINDOWS_BLENDER = 'C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe'

const argv = process.argv.slice(2)
const option = (name: string) => {
  const i = argv.indexOf(name)
  return i === -1 ? undefined : argv[i + 1]
}
const only = option('--only')?.split(',')
const samples = option('--samples') ?? '256'
const skipRender = argv.includes('--skip-render')

const blender =
  process.env.BLENDER ?? (fs.existsSync(WINDOWS_BLENDER) ? WINDOWS_BLENDER : 'blender')

// The scripts use the Blender 5.2 Python API; another version may render differently or not at all.
// Re-encoding existing renders needs no Blender.
if (!skipRender) {
  const version = execFileSync(blender, ['--version'], { encoding: 'utf8' }).match(
    /Blender (\d+\.\d+)/,
  )?.[1]
  if (version !== '5.2') {
    throw new Error(`Blender 5.2 is required, found ${version ?? 'nothing'} at ${blender}`)
  }
}

const ffmpeg = process.env.FFMPEG ?? 'ffmpeg'
const LOOP_REGIONS = path.join(ROOT, 'src', 'lib', 'hero-loops.json')

const known = [
  ...Object.keys(STILLS),
  ...(Object.keys(HERO_LOOPS) as (keyof typeof HERO_LOOPS)[]).map(loopName),
  'jar-model',
]
const unknown = only?.filter((name) => !known.includes(name)) ?? []
if (unknown.length)
  throw new Error(`Unknown asset(s): ${unknown.join(', ')}. Known: ${known.join(', ')}`)

function runBlender(script: string, args: string[] = []) {
  execFileSync(
    blender,
    // --python-exit-code: a failing script fails the build instead of leaving a stale render.
    [
      '-b',
      '--factory-startup',
      '--python-exit-code',
      '1',
      '-P',
      path.join(ROOT, 'blender', script),
      '--',
      ...args,
    ],
    { stdio: ['ignore', 'ignore', 'inherit'] },
  )
}

// Encoder settings: the stills are soft and dark, so AVIF holds up well at low quality.
const ENCODE = {
  avif: (image: Sharp) => image.avif({ quality: 52, effort: 6, chromaSubsampling: '4:2:0' }),
  webp: (image: Sharp) => image.webp({ quality: 74, effort: 6 }),
} as const

const wanted = (name: string) => !only || only.includes(name)
const rows: string[] = []

fs.mkdirSync(BUILD, { recursive: true })
fs.mkdirSync(STILLS_OUT, { recursive: true })

for (const [name, still] of Object.entries(STILLS) as [StillName, (typeof STILLS)[StillName]][]) {
  if (!wanted(name)) continue
  const png = path.join(BUILD, `${name}.png`)
  if (!skipRender) {
    const [w, h] = still.render
    console.log(`render ${name} ${w}x${h}`)
    runBlender('stills.py', [name, '--size', `${w}x${h}`, '--samples', samples, '--out', png])
  }
  for (const width of still.widths) {
    for (const format of STILL_FORMATS) {
      const file = path.join(STILLS_OUT, `${name}-${width}.${format}`)
      await ENCODE[format](sharp(png).resize({ width })).toFile(file)
      rows.push(`${path.relative(ROOT, file)}\t${(fs.statSync(file).size / 1024).toFixed(1)} KB`)
    }
  }
}

// The hero's drip loops: one cycle rendered for the drip's region of the still only, encoded
// as VP9 at the still's largest served scale. The region goes to src/lib/hero-loops.json,
// where the hero reads it to lay the loop over the still.
const regions: Record<string, HeroLoopRegion> = fs.existsSync(LOOP_REGIONS)
  ? JSON.parse(fs.readFileSync(LOOP_REGIONS, 'utf8'))
  : {}
for (const [still, loop] of Object.entries(HERO_LOOPS) as [
  keyof typeof HERO_LOOPS,
  (typeof HERO_LOOPS)[keyof typeof HERO_LOOPS],
][]) {
  if (!wanted(loopName(still))) continue
  const frames = path.join(BUILD, `${still}-drip`)
  if (!skipRender) {
    const [w, h] = STILLS[still].render
    console.log(`render ${loopName(still)} (${loop.frames} frames)`)
    fs.rmSync(frames, { recursive: true, force: true })
    runBlender('stills.py', [
      still,
      '--size',
      `${w}x${h}`,
      '--samples',
      String(loop.samples),
      '--drip-frames',
      String(loop.frames),
    ])
  }
  const region = JSON.parse(fs.readFileSync(path.join(frames, 'region.json'), 'utf8'))
  const scale = loop.width / region.width
  const even = (v: number) => Math.max(2, Math.round((v * scale) / 2) * 2)
  const file = path.join(ROOT, 'public', loopUrl(still))
  const [outW, outH] = [even(region.w), even(region.h)]
  // Frames are scaled here and handed over as one near-lossless MJPEG stream in a file: the
  // smallest ffmpeg builds (Playwright's) read nothing else, not even from a pipe.
  const raw = await Promise.all(
    Array.from({ length: loop.frames }, (_, i) =>
      sharp(path.join(frames, `${String(i).padStart(3, '0')}.png`))
        .resize(outW, outH, { kernel: 'lanczos3' })
        .removeAlpha()
        .jpeg({ quality: 100, chromaSubsampling: '4:4:4' })
        .toBuffer(),
    ),
  )
  const stream = path.join(BUILD, `${still}-drip.mjpeg`)
  fs.writeFileSync(stream, Buffer.concat(raw))
  execFileSync(
    ffmpeg,
    [
      '-y',
      '-loglevel',
      'error',
      '-f',
      'image2pipe',
      '-c:v',
      'mjpeg',
      '-framerate',
      String(loop.fps),
      '-i',
      stream,
      '-vf',
      'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
      '-c:v',
      'libvpx-vp9',
      '-b:v',
      '0',
      '-crf',
      '22',
      '-row-mt',
      '1',
      '-colorspace',
      'bt709',
      '-color_primaries',
      'bt709',
      '-color_trc',
      'iec61966-2-1',
      '-color_range',
      'tv',
      '-an',
      file,
    ],
    { stdio: 'inherit' },
  )
  regions[still] = {
    x: region.x / region.width,
    y: region.y / region.height,
    w: region.w / region.width,
    h: region.h / region.height,
  }
  rows.push(`${path.relative(ROOT, file)}\t${(fs.statSync(file).size / 1024).toFixed(1)} KB`)
}
fs.writeFileSync(LOOP_REGIONS, JSON.stringify(regions, null, 2) + '\n')

if (wanted('jar-model')) {
  if (!skipRender) {
    console.log('export jar model')
    runBlender('export_jar.py')
  }
  fs.mkdirSync(path.dirname(MODEL_OUT), { recursive: true })
  // -cc: Meshopt compression with quantised attributes; -kn keeps the Glass, Honey and Lid
  // nodes apart so the scene can give each its own material.
  execFileSync(
    process.execPath,
    [
      path.join(ROOT, 'node_modules', 'gltfpack', 'cli.js'),
      '-i',
      path.join(BUILD, 'jar.glb'),
      '-o',
      MODEL_OUT,
      '-cc',
      '-kn',
    ],
    { stdio: 'inherit' },
  )
  rows.push(
    `${path.relative(ROOT, MODEL_OUT)}\t${(fs.statSync(MODEL_OUT).size / 1024).toFixed(1)} KB`,
  )
}

console.log(rows.join('\n'))
