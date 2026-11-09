/**
 * (Re)install this package into the DSH desktop profile from this directory.
 *
 * `file:` dependencies are COPIED into the profile's node_modules, not linked,
 * so every `npm run build:client` needs this again before restarting DSH.
 *
 *   npm run install:desktop
 *
 * Pass a different profile name as the first argument (default: desktop).
 */
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const profile = process.argv[2] ?? 'desktop'
const spec = `file:${resolve('.').replaceAll('\\', '/')}`

console.log(`install-desktop: dsh plugin --profile ${profile} add "${spec}"`)
const result = spawnSync('dsh', ['plugin', '--profile', profile, 'add', spec], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

if (result.status !== 0) {
  console.error(`install-desktop: failed with exit code ${result.status}`)
  process.exit(result.status ?? 1)
}
console.log('install-desktop: done — restart DSH to load the new build')
