#!/usr/bin/env node
/**
 * Remove archive entries whose session log no longer exists on disk.
 *
 * This is the offline repair for the state that the old delete path could leave
 * behind: an id stuck in `archivedSessionIds` while its session directory is
 * already gone. Such a row folds to no facts and cannot be located, so the UI
 * shows a bare id and the delete button has nothing left to delete.
 *
 * The plugin now prunes these by itself (startup plus every
 * `ORPHAN_SWEEP_MS`), so run this only for an archive that is already stuck —
 * or when the running process cannot persist the unarchive write.
 *
 * Usage:
 *   node scripts/prune-orphans.mjs                 # dry run, prints what it would do
 *   node scripts/prune-orphans.mjs --apply         # rewrite both storages, with backups
 *   node scripts/prune-orphans.mjs --dsh-home DIR  # non-default DSH home
 *
 * Close the app before `--apply`: the running process keeps the archive set in
 * memory and will write it back over this change.
 */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const dshHomeIndex = args.indexOf('--dsh-home')
const dshHome = dshHomeIndex >= 0 && args[dshHomeIndex + 1]
  ? path.resolve(args[dshHomeIndex + 1])
  : path.join(os.homedir(), '.dsh')

const storagesDir = path.join(dshHome, 'storages')
const sessionsRoot = path.join(dshHome, 'sessions')
const workspaceFile = path.join(storagesDir, 'workspace.json')
const archiveFile = path.join(storagesDir, 'archive_manager.json')

/** Session directory names present on disk, in both id forms the app has used. */
function sessionDirs() {
  const names = new Set()
  for (const bucket of fs.readdirSync(sessionsRoot)) {
    const dir = path.join(sessionsRoot, bucket)
    if (!fs.statSync(dir).isDirectory()) continue
    for (const name of fs.readdirSync(dir)) {
      if (!fs.statSync(path.join(dir, name)).isDirectory()) continue
      names.add(name)
      names.add(name.replace(/^session-/, ''))
      names.add(`session-${name.replace(/^session-/, '')}`)
    }
  }
  return names
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function backup(file) {
  const target = `${file}.bak-${stamp()}`
  fs.copyFileSync(file, target)
  return target
}

function writeJson(file, value) {
  const tmp = `${file}.tmp-${process.pid}`
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`)
  fs.renameSync(tmp, file)
}

const dirs = sessionDirs()
const workspace = JSON.parse(fs.readFileSync(workspaceFile, 'utf8'))
const ids = workspace.global?.archivedSessionIds
if (!Array.isArray(ids)) throw new Error(`no global.archivedSessionIds in ${workspaceFile}`)

const orphans = ids.filter((id) => !dirs.has(id))
const keep = ids.filter((id) => dirs.has(id))

console.log(`dsh home      ${dshHome}`)
console.log(`archived      ${ids.length}`)
console.log(`logs present  ${keep.length}`)
console.log(`orphans       ${orphans.length}`)
for (const id of orphans) console.log(`  - ${id}`)

/**
 * Drop the plugin's own records for ids that are no longer archived. A record
 * only ever exists for an archived id, so anything outside the kept set is a
 * leftover from a session whose log is gone.
 */
function pruneArchiveRecords(keepSet) {
  if (!fs.existsSync(archiveFile)) return { dropped: 0, backup: null }
  const doc = JSON.parse(fs.readFileSync(archiveFile, 'utf8'))
  // The table name has been both `sessions` and `records` across versions.
  const table = doc.tables?.sessions ?? doc.tables?.records
  let dropped = 0
  if (table && typeof table === 'object') {
    for (const id of Object.keys(table)) {
      if (keepSet.has(id)) continue
      delete table[id]
      dropped += 1
    }
  }
  if (dropped === 0) return { dropped: 0, backup: null }
  const backupFile = backup(archiveFile)
  writeJson(archiveFile, doc)
  return { dropped, backup: backupFile }
}

/**
 * Also drop the ids from the per-workspace session lists: an id with no log
 * cannot be opened from a workspace either, and leaving it there keeps a dead
 * row in the workspace views.
 */
function pruneWorkspaceSessionIds(workspaceDoc, orphanSet) {
  let dropped = 0
  const tables = workspaceDoc.tables?.workspaces
  if (tables && typeof tables === 'object') {
    for (const entry of Object.values(tables)) {
      if (!Array.isArray(entry?.sessionIds)) continue
      const next = entry.sessionIds.filter((id) => {
        if (!orphanSet.has(id)) return true
        dropped += 1
        return false
      })
      entry.sessionIds = next
    }
  }
  return dropped
}

const orphanSet = new Set(orphans)
const keepSet = new Set(keep)

if (!apply) {
  console.log('\ndry run; re-run with --apply to rewrite the storages')
  process.exit(0)
}

let workspaceBackup = null
if (orphans.length > 0) {
  workspaceBackup = backup(workspaceFile)
  workspace.global.archivedSessionIds = keep
}
const workspaceDropped = pruneWorkspaceSessionIds(workspace, orphanSet)
if (orphans.length > 0) writeJson(workspaceFile, workspace)

const records = pruneArchiveRecords(keepSet)

const reportFile = path.join(dshHome, `prune-orphans-${stamp()}.json`)
fs.writeFileSync(reportFile, `${JSON.stringify({ removed: orphans, workspaceDropped, recordsDropped: records.dropped, backups: { workspaceFile: workspaceBackup, archiveFile: records.backup } }, null, 2)}\n`)

console.log(`\narchived ${ids.length} -> ${keep.length}`)
console.log(`workspace sessionIds dropped ${workspaceDropped}`)
console.log(`plugin records dropped       ${records.dropped}`)
if (workspaceBackup) console.log(`backup workspace ${workspaceBackup}`)
if (records.backup) console.log(`backup records   ${records.backup}`)
console.log(`report           ${reportFile}`)
