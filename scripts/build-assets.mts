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
import { STILL_FORMATS, STILLS, type StillName } from '../src/lib/stills'

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

function runBlender(script: string, args: string[] = []) {
  execFileSync(
    blender,
    ['-b', '--factory-startup', '-P', path.join(ROOT, 'blender', script), '--', ...args],
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
