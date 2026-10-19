/**
 * Optional local development helper: link this package's peer dependencies to
 * the DeepSeek Harness runtime copies so the plugin can run straight from a
 * checkout. Published installs resolve the peers from the profile, so this file
 * is only needed when developing outside a profile.
 *
 * A junction is used (real directory on Windows) so Node resolves through to the
 * same realpath — `@deepseek-ai/cordis` keeps one `Service` identity and one
 * `Symbol(cordis.init)`.
 *
 * Usage:  node scripts/link-deps.cjs [harness-node-modules-path]
 */
const fs = require('node:fs')
const path = require('node:path')

const HARNESS =
  process.argv[2] || process.env.DSH_HARNESS_NODE_MODULES || 'D:\\software\\DeepSeek Harness\\resources\\app\\dsh\\node_modules'
const root = path.join(__dirname, '..', 'node_modules')
const scope = path.join(root, '@deepseek-ai')

fs.mkdirSync(scope, { recursive: true })

const targets = [
  [path.join(HARNESS, 'zod'), path.join(root, 'zod')],
  ...['cordis', 'schemastery', 'dsh-typert-protocol', 'dsh-storage-domain', 'dsh-session-query', 'dsh-workspace']
    .map((p) => [path.join(HARNESS, '@deepseek-ai', p), path.join(scope, p)]),
]

for (const [target, link] of targets) {
  try {
    if (!fs.existsSync(target)) {
      console.log(`SKIP (missing target) ${target}`)
      continue
    }
    if (fs.existsSync(link)) {
      console.log(`OK (exists)        ${link}`)
      continue
    }
    fs.symlinkSync(target, link, 'junction')
    console.log(`LINKED             ${link} -> ${target}`)
  } catch (error) {
    console.log(`FAILED             ${link}: ${error.code} ${error.message}`)
  }
}
