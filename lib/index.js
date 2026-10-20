/**
 * Archive Manager — Host half.
 *
 * Manages archived DSH sessions: an indexed archive view with date filters,
 * batch unarchive, and a reversible automatic-cleanup policy.
 *
 * DSH has no session-deletion seam, so "cleanup" never touches session logs:
 * it only moves sessions between the archive set and the workspace list
 * through `ctx.workspaceRegistry.archiveSession/unarchiveSession`.
 *
 * Export shape (see the host-plugin contract): this module exports ONE form —
 * a Service class as `default`. The Loader resolves `exports.default ?? exports`
 * and mounts it; a named-class-only export mounts nothing, which leaves the
 * entry inactive and the browser half undiscovered.
 *
 * Remote endpoints use the runtime Source-mode markers instead of a generated
 * `./typert` artifact: `markRemote` writes the same prototype descriptor the
 * `@Remote` decorator writes, and the Gateway's `collectSrcClaims()` reads it
 * together with the `typertRemote` binding that `TypertRemoteService` installs.
 */
import z from '@deepseek-ai/schemastery'
import { z as zod } from 'zod'
import { rm } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, dirname, join, resolve, sep } from 'node:path'
import { Service } from '@deepseek-ai/cordis'
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'

const DAY_MS = 86_400_000

/**
 * How many sessions the background fold takes off the queue at a time.
 *
 * Small enough that a listing requested mid-pass is served promptly, large
 * enough that draining a cold archive does not cost one `setImmediate` per log.
 */
const WARM_BATCH = 8

/** Concurrent cold log reads; folding every archived artifact at once is not affordable. */
const LOG_FACTS_CONCURRENCY = 4

/**
 * How often the background pass re-checks every archived log's content identity.
 *
 * A `stat()` sweep costs ~14ms per session (~1.2s for this machine's 85-session
 * archive), far too slow for the request path, so staleness is discovered here
 * instead. Archived sessions are dormant by definition, so a minute of delay
 * before a just-resumed session's new title appears is a fair trade — and the
 * startup warm covers the common case where nothing changed at all.
 */
const LOG_FACTS_REFRESH_MS = 60_000

/**
 * How often archive entries whose session log has disappeared are dropped.
 *
 * This is the repair pass for a state the plugin cannot otherwise explain: the
 * archive set can name sessions whose log is gone (a log deleted by another
 * build, by a purge tool, or by hand), and the UI then lists a row that can
 * never fold facts — so it shows a bare id — and can never be deleted either,
 * because deletion resolved the artifact through `locate()`. Nothing but this
 * plugin owns that membership, so it heals it here instead of leaving the row
 * as a permanent relic.
 */
const ORPHAN_SWEEP_MS = 60_000

/** Prototype key carrying the Remote method descriptor (typert-protocol contract). */
const REMOTE_METHOD_DESCRIPTOR = '@deepseek-ai/dsh-typert-protocol/remote-methods'

/**
 * Mark one public instance method as a Remote endpoint on `prototype`.
 *
 * Mirrors `addMarkerInitializer`/`mark` in `dsh-typert-protocol` so a hand-written
 * (un-transpiled) package publishes the identical descriptor a `@Remote`
 * decorator would: version 1, frozen markers, `{kind:'direct'}` invocation.
 *
 * @param prototype - the class prototype owning the method.
 * @param method - the public instance method name.
 */
function markRemote(prototype, method) {
  const existing = Object.getOwnPropertyDescriptor(prototype, REMOTE_METHOD_DESCRIPTOR)?.value
  const methods = existing?.methods ?? []
  if (methods.some((candidate) => candidate.method === method)) return
  Object.defineProperty(prototype, REMOTE_METHOD_DESCRIPTOR, {
    configurable: true,
    value: Object.freeze({
      version: 1,
      methods: Object.freeze([...methods, Object.freeze({ method, invocation: Object.freeze({ kind: 'direct' }) })]),
    }),
  })
}

/**
 * Facts folded out of one session log, cached on the durable per-session
 * record so a listing never has to decode the log to answer.
 *
 * The fold itself costs ~70ms per log (81% of it zstd frame decode across an
 * average of 2,463 independently compressed frames) and spikes to ~0.5s for a
 * 28MB log; a cold pass over 85 archived sessions measured ~6s. Doing that
 * inside `list()` means the settings page stalls for seconds on first open and
 * again whenever the memo expires — the page is a UI, so the fold moved to a
 * background pass and these fields are what it writes.
 *
 * `logRevision` is the backend's own content identity for the log
 * (`persistence.stat(id).revision`, which folds in mtime, size and file
 * identity). Cached facts are reusable only while that identity still matches,
 * which is what makes the background pass cheap: it re-reads no log whose
 * revision is unchanged.
 *
 * These live on `recordSchema` rather than in a second table because adding a
 * table means bumping the domain version, and `dsh-storage-json` rejects a
 * whole-unit document whose stored version differs from the declared one — that
 * would quarantine every existing `archive_manager.json` on upgrade.
 */
const logFactFields = {
  /** Fold-rule version these facts were computed under; see `LOG_FACT_VERSION`. */
  factVersion: zod.number().optional(),
  /** Backend content identity of the log the facts came from. */
  logRevision: zod.string().optional(),
  /** Display title, absent when the log carries no `session/title` event. */
  title: zod.string().optional(),
  /** Last user activity (epoch ms), absent when the log has no user message. */
  activityAt: zod.number().optional(),
  /** When these facts were folded, for diagnostics and staleness reporting. */
  foldedAt: zod.number().optional(),
  /**
   * When this entry was retired because its session log no longer exists.
   *
   * The tombstone is what makes the removal stick even when the archive
   * membership does not: the row is hidden as long as the tombstone is there,
   * so a ghost session cannot come back on the next listing just because a
   * registry write failed to persist. It is dropped with the record once the id
   * actually leaves the archive set.
   */
  retiredAt: zod.number().optional(),
}

/**
 * Bump when {@link logFactFields} or the fold rules change.
 *
 * Cached facts are stamped with it so a rule change invalidates every stored
 * fact instead of serving results computed by the previous logic forever.
 */
const LOG_FACT_VERSION = 1

/** Durable per-session archive bookkeeping. */
const recordSchema = zod.object({
  sessionId: zod.string(),
  /** Epoch ms at which the session entered the archive set. */
  archivedAt: zod.number(),
  /** True when this plugin put the session there through an automatic policy. */
  auto: zod.boolean(),
  lastActionAt: zod.number(),
  lastAction: zod.string(),
  /** Folded log facts; see `logFactFields`. */
  ...logFactFields,
})

const domainPolicySchema = zod.object({
  /** Master switch for scheduled cleanup. */
  cleanupEnabled: zod.boolean(),
  /** Archive sessions idle for this many days; 0 disables. */
  autoArchiveDays: zod.number(),
  /** Unarchive sessions archived for more than this many days; 0 disables. */
  retentionDays: zod.number(),
  /** Keep at most this many archived sessions; 0 disables. */
  capCount: zod.number(),
  /** Whether subagent sessions take part in the policy. */
  includeSubagents: zod.boolean(),
})

const DEFAULT_POLICY = {
  cleanupEnabled: false,
  autoArchiveDays: 90,
  retentionDays: 180,
  capCount: 0,
  includeSubagents: false,
}

/**
 * Durable plugin domain: archive bookkeeping per session plus the policy
 * singleton, stored next to other domains and never in session logs.
 */
const archiveManagerDomain = defineDomain({
  name: 'archive_manager',
  version: 1,
  global: {
    schema: zod.object({ policy: domainPolicySchema }),
    initial: { policy: { ...DEFAULT_POLICY } },
  },
  tables: { sessions: domainTable(recordSchema) },
})

/**
 * Fold the two facts a listing needs out of one session's event log.
 *
 * Both are log facts, not header facts: `session/title` carries the display
 * title (the header never does), and the last `user/message` with
 * `source.kind === 'user'` carries "when was this conversation last used"
 * — the same event `applySessionListMetadata` folds into `lastPromptAt`.
 * Last write wins for both, matching `foldSessionTitle`'s `findLast`.
 *
 * @param events - the session's committed events, in seq order.
 * @returns the folded title (or undefined) and last user activity (or undefined).
 */
function foldLogFacts(events) {
  let title
  let activityAt
  for (const event of events) {
    if (event?.type === 'session/title' && typeof event.data?.title === 'string' && event.data.title !== '') {
      title = event.data.title
    } else if (event?.type === 'user/message' && event.data?.source?.kind === 'user' && typeof event.time === 'number') {
      activityAt = event.time
    }
  }
  return { title, activityAt }
}

function clampInt(value, min, max, fallback) {
  const number = typeof value === 'number' ? Math.floor(value) : Number.NaN
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback
}

function normalizePolicy(input) {
  const source = input ?? {}
  return {
    cleanupEnabled: source.cleanupEnabled === true,
    autoArchiveDays: clampInt(source.autoArchiveDays, 0, 36500, DEFAULT_POLICY.autoArchiveDays),
    retentionDays: clampInt(source.retentionDays, 0, 36500, DEFAULT_POLICY.retentionDays),
    capCount: clampInt(source.capCount, 0, 100000, DEFAULT_POLICY.capCount),
    includeSubagents: source.includeSubagents === true,
  }
}

/**
 * Accept a local calendar day (`YYYY-MM-DD`) and nothing else.
 *
 * A range is filtered by comparing day strings, which is both cheaper than an
 * epoch window and immune to the DST hours a day does not always have. An
 * impossible date such as `2026-02-30` is not rejected: it simply matches
 * nothing, which is the same thing the user asked for.
 */
function dayString(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined
}

function isoDay(time) {
  const date = new Date(time)
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * Wall-clock time of the last write to a session log, read out of the
 * persistence revision rather than by opening the file.
 *
 * `revision` is `dev:ino:size:mtimeNs:ctimeNs[:corpusHash]`, so the mtime is the
 * fourth field and is already in the `list()` snapshot. That matters: a
 * per-session `stat()` costs ~15ms and a cold read ~200ms, so judging idleness
 * over the whole store by opening or stat-ing each session would cost minutes.
 * `list()` answers for every session in ~130ms.
 *
 * mtime is the right clock for "was this used recently": every appended event
 * bumps it, including prompts, so it needs no fold and cannot disagree with the
 * log's own contents.
 */
function activityOfRevision(revision) {
  if (typeof revision !== 'string') return undefined
  const mtimeNs = revision.split(':')[3]
  if (typeof mtimeNs !== 'string' || !/^\d+$/.test(mtimeNs)) return undefined
  const ms = Number(BigInt(mtimeNs) / 1_000_000n)
  return Number.isFinite(ms) ? ms : undefined
}

/**
 * Archive bookkeeping and cleanup policy over the workspace registry's archive
 * set, projected to the browser as the `archiveManager` Remote namespace.
 */
export class ArchiveManagerService extends TypertRemoteService {
  /** Services required before this plugin can mount. */
  static inject = ['workspaceRegistry', 'storageDomain', 'timer']

  /** Plugin options; the Loader applies schema defaults. */
  static Config = z.object({
    /** Minutes between scheduled cleanup runs while the policy is enabled. */
    cleanupIntervalMinutes: z.number().step(1).min(1).max(1440).default(30),
  })

  table = undefined
  global = undefined
  lastRun = { at: 0, report: null }
  running = false
  /** Archived rows for the plan currently being computed; set by a sweep. */
  planRows = undefined

  /** Idle non-archived sessions for the current plan; set by a sweep. */
  planIdle = undefined
  /** Sessions awaiting a background fold, oldest first. */
  warmQueue = []

  /** Sessions currently being folded, so a queue cannot duplicate work. */
  warming = new Set()

  /** Whether a drain is already scheduled or running. */
  warmScheduled = false

  /** Reentrancy guard for `warmLogFacts`. */
  warmingBusy = false

  /**
   * Bumped whenever a fold writes new facts.
   *
   * A page that opened while the archive was still cold polls `list()`, which
   * reports `pending`; this counter lets it stop polling once nothing changed
   * between two listings even if some rows will never get facts at all.
   */
  factsGeneration = 0
  /** True once a sweep actually ran against the store, so the page stops asking. */
  orphansRetired = false

  constructor(ctx, config = {}) {
    super(ctx, 'archiveManager')
    this.config = {
      cleanupIntervalMinutes: clampInt(config?.cleanupIntervalMinutes, 1, 1440, 30),
    }
    // Publish the endpoints from the live instance before any init work runs.
    const prototype = Object.getPrototypeOf(this)
    for (const method of ['list', 'getSettings', 'setPolicy', 'unarchive', 'deleteSessions', 'preview', 'runCleanup']) {
      markRemote(prototype, method)
    }
  }

  async [Service.init]() {
    const domain = await this.ctx.storageDomain.open(archiveManagerDomain)
    this.ctx.effect(() => () => domain.close(), 'archive-manager: domain')
    this.table = domain.table('sessions')
    this.global = domain.global
    this.ctx.setInterval(() => this.syncArchiveSet(), 15_000)
    // Retire archive entries whose log is gone before warming, so the first
    // read of the archive is not spent on rows that can never fold. Deferred
    // rather than awaited: plugin init must not wait on a disk pass.
    setImmediate(() => {
      this.pruneOrphans().catch((error) => {
        this.ctx.logger.warn(`archive-manager: orphan sweep failed: ${String(error)}`)
      })
    })
    this.ctx.setInterval(() => {
      this.pruneOrphans().catch((error) => {
        this.ctx.logger.warn(`archive-manager: orphan sweep failed: ${String(error)}`)
      })
    }, ORPHAN_SWEEP_MS)
    // Warm the whole archive once at startup, in the background: the first
    // opening of the settings page should find facts already folded rather than
    // showing ids for a pass and then repainting.
    this.scheduleWarm([...this.ctx.workspaceRegistry.archivedSessionIds])
    // Then keep them honest: a session that was resumed, retitled or used again
    // is re-detected here, not on the request path.
    this.ctx.setInterval(() => this.refreshLogFacts(), LOG_FACTS_REFRESH_MS)
    this.ctx.setInterval(() => {
      if (!this.policy().cleanupEnabled) return
      this.runCleanup({ reason: 'auto' }).catch((error) => {
        this.ctx.logger.warn(`archive-manager: scheduled cleanup failed: ${String(error)}`)
      })
    }, this.config.cleanupIntervalMinutes * 60_000)
  }

  // ------------------------------------------------------------ bookkeeping

  /**
   * Persist the first time a session is seen in the archive set and forget
   * records of sessions that left it. The archive set itself always comes
   * from the registry, which is its only owner.
   */
  syncArchiveSet() {
    if (this.table === undefined) return
    const archived = this.ctx.workspaceRegistry.archivedSessionIds
    const live = new Set(archived)
    const now = Date.now()
    for (const id of archived) {
      if (this.table.get(id) !== undefined) continue
      this.table.put(id, { sessionId: id, archivedAt: now, auto: false, lastActionAt: now, lastAction: 'seen' })
    }
    for (const [key, record] of [...this.table.entries()]) {
      if (!live.has(record.sessionId)) this.table.delete(key)
    }
    // Drop bookkeeping for sessions that left the archive; their persisted log
    // facts go with the record, and `warmLogFacts` refolds if one returns.
    // `??=` rather than a plain read: this method is the first thing `list()`
    // touches, so an undefined field here blanks the whole page instead of
    // failing one row.
    this.warmQueue = (this.warmQueue ?? []).filter((id) => live.has(id))
  }

  archivedSet() {
    // Retired entries are not part of the archive any more, even while the
    // registry still lists them; a cleanup plan must not act on a ghost.
    return new Set(this.ctx.workspaceRegistry.archivedSessionIds
      .filter((id) => this.table?.get(id)?.retiredAt === undefined))
  }

  /** Session headers keyed by id, from the workspace registry's stored index. */
  async headersOf(ids) {
    const registry = this.ctx.workspaceRegistry
    const wanted = new Set(ids)
    const headers = new Map()
    let stored = []
    try {
      stored = await registry.listStoredHeaders()
    } catch {
      stored = []
    }
    for (const header of stored) {
      if (header?.id !== undefined && wanted.has(header.id)) headers.set(header.id, header)
    }
    return headers
  }

  /**
   * Workspace id owning one session, or '' when no workspace claims it.
   *
   * `WorkspaceEntity` exposes its id as `id` (the record's stable id); there is
   * no `workspaceId` field, so reading one would silently collapse every
   * session onto a single '' bucket.
   */
  workspaceOf(sessionId) {
    for (const workspace of this.ctx.workspaceRegistry.list()) {
      if (workspace.sessionIds.includes(sessionId)) return workspace.id
    }
    return ''
  }

  workspaceLabels() {
    const labels = {}
    for (const workspace of this.ctx.workspaceRegistry.list()) labels[workspace.id] = workspace.title
    return labels
  }

  /** Run state of a live agent, when the agent service is present. */
  isRunning(sessionId) {
    return this.ctx.get('agents')?.get?.(sessionId)?.status === 'running'
  }

  /**
   * Title and last-activity facts for the given sessions, keyed by id.
   *
   * Both live in the session log, not the header, and neither can be read
   * through the projection cache here:
   *
   * - `cachedSnapshot()` gates on `currentLifecycleMatches()`, which demands
   *   that the stored row's `formatVersion` equal the header's `version`.
   *   Records written before that field existed carry no `formatVersion`, so
   *   the comparison is always false and the cache serves nothing for them —
   *   which is exactly why the page showed ids and one single day.
   * - `sessionQuery.readTitleSnapshots()` folds the log correctly, but this
   *   plugin has no guarantee that service is ACTIVE when it runs, and
   *   `ctx.get()` returns undefined for a non-ACTIVE service: a silent hole.
   *
   * So the fold reads the log through `sessionPersistence` — the same
   * `open(id,'read')` + `read(0)` seam `readColdSessionLog()` uses — and both
   * facts come out of that one pass.
   *
   * **Never on the request path.** A single fold averages ~70ms and a cold
   * pass over this machine's 85 archived logs measured ~6s, which a settings
   * page cannot hide. `list()` therefore answers from the facts persisted on
   * the durability record and asks {@link scheduleWarm} to refresh whatever is
   * stale; the next listing picks the refresh up. A row with no facts yet
   * shows its id for one round trip instead of blocking the page for seconds.
   */
  logFactsOf(ids) {
    const facts = new Map()
    const stale = []
    for (const id of ids) {
      const record = this.table?.get(id)
      if (record !== undefined && record.factVersion === LOG_FACT_VERSION && record.logRevision !== undefined) {
        facts.set(id, {
          title: record.title,
          activityAt: record.activityAt,
          // A fold that found nothing is still a complete answer, but it is
          // only trustworthy while the log it came from is unchanged, so the
          // revision rides along and `warmLogFacts` re-checks it.
          revision: record.logRevision,
        })
      } else {
        stale.push(id)
      }
    }
    if (stale.length > 0) this.scheduleWarm(stale)
    return { facts, stale }
  }

  /**
   * Re-check every archived log against the facts stored for it.
   *
   * This is how a changed log becomes visible: the request path cannot afford a
   * `stat()` per session, so it trusts what the table holds, and staleness is
   * discovered here instead. `warmOne` re-stats each session and skips the fold
   * when the revision still matches, so a sweep over an unchanged archive costs
   * one `stat()` per session and opens nothing.
   */
  refreshLogFacts() {
    this.scheduleWarm([...this.ctx.workspaceRegistry.archivedSessionIds])
  }

  /**
   * Ask for a background fold of `ids`, coalescing overlapping requests.
   *
   * Called on the request path, so it must return immediately: it records the
   * ids and lets {@link warmLogFacts} drain them on a later turn of the loop.
   * A session already queued or in flight is not queued twice.
   */
  scheduleWarm(ids) {
    // The queue and the in-flight set are both nullable on purpose: this is
    // reached from the request path, and a probe or a partially constructed
    // instance must not blank the listing over bookkeeping state.
    this.warmQueue ??= []
    this.warming ??= new Set()
    for (const id of ids) {
      if (!this.warmQueue.includes(id) && !this.warming.has(id)) this.warmQueue.push(id)
    }
    if (this.warmQueue.length === 0 || this.warmScheduled) return
    this.warmScheduled = true
    // `setImmediate` rather than a microtask: the point is to finish rendering
    // the listing that asked for this before competing for the thread.
    setImmediate(() => {
      this.warmScheduled = false
      this.warmLogFacts().catch((error) => {
        this.ctx.logger.warn(`archive-manager: background log fold failed: ${String(error)}`)
      })
    })
  }

  /**
   * Drain the warm queue: fold stale logs and persist the results.
   *
   * Each session is handled at most once at a time. The revision check makes
   * this idempotent — a log whose identity still matches what the stored facts
   * were folded from is skipped without being opened, so the pass is cheap
   * after the first complete sweep.
   */
  async warmLogFacts() {
    if (this.warmingBusy) return
    this.warmingBusy = true
    try {
      const persistence = this.ctx.get('sessionPersistence')
      if (persistence === undefined) {
        this.warmQueue.length = 0
        return
      }
      while (this.warmQueue.length > 0) {
        const batch = this.warmQueue.splice(0, WARM_BATCH)
        for (const id of batch) this.warming.add(id)
        try {
          let cursor = 0
          const worker = async () => {
            while (cursor < batch.length) {
              const id = batch[cursor++]
              await this.warmOne(persistence, id)
              // Yield between sessions so a background fold never monopolises
              // the loop: this pass competes with the RPCs it is serving.
              await new Promise((resolve) => setImmediate(resolve))
            }
          }
          const workers = []
          for (let index = 0; index < Math.min(LOG_FACTS_CONCURRENCY, batch.length); index++) workers.push(worker())
          await Promise.all(workers)
        } finally {
          for (const id of batch) this.warming.delete(id)
        }
      }
    } finally {
      this.warmingBusy = false
    }
  }

  /**
   * Fold one session's log and persist the facts, unless already current.
   *
   * `stat()` comes first and is the cheap gate: when the stored revision still
   * matches, nothing is opened at all, so sweeping an unchanged archive costs
   * one stat per session and no decode.
   */
  async warmOne(persistence, id) {
    let revision
    try {
      const stat = await persistence.stat(id)
      if (stat === undefined) return
      revision = String(stat.revision)
    } catch {
      return
    }
    const record = this.table?.get(id)
    if (record !== undefined && record.factVersion === LOG_FACT_VERSION && record.logRevision === revision) return
    const folded = await this.readLogFacts(persistence, id)
    if (folded === undefined) return
    const existing = this.table?.get(id)
    if (existing === undefined) return
    // Merge rather than replace: the bookkeeping fields are owned by
    // `syncArchiveSet`, and a concurrent write may have touched them.
    this.table.put(id, {
      ...existing,
      factVersion: LOG_FACT_VERSION,
      logRevision: revision,
      ...(folded.title === undefined ? {} : { title: folded.title }),
      ...(folded.activityAt === undefined ? {} : { activityAt: folded.activityAt }),
      foldedAt: Date.now(),
    })
    // Lets a waiting page know its rows are now final.
    this.factsGeneration++
  }

  /**
   * One cold pass over a single session log.
   *
   * The handle is always closed, even when the read throws, or the backend
   * keeps the artifact leased for the rest of the process lifetime.
   */
  async readLogFacts(persistence, id) {
    let handle
    try {
      handle = await persistence.open(id, 'read')
      const read = await handle.read(0, undefined)
      return foldLogFacts(read?.events ?? [])
    } catch (error) {
      // A missing or unreadable log is a normal state for a stale archive
      // entry, not a reason to fail the whole listing.
      this.ctx.logger.warn(`archive-manager: reading the log of "${id}" failed: ${String(error)}`)
      return undefined
    } finally {
      if (handle !== undefined) {
        try {
          await handle.close()
        } catch (error) {
          this.ctx.logger.warn(`archive-manager: closing the log of "${id}" failed: ${String(error)}`)
        }
      }
    }
  }

  policy() {
    const stored = this.global?.get()?.policy
    return normalizePolicy({ ...DEFAULT_POLICY, ...(stored ?? {}) })
  }

  /** One row from a session header plus this plugin's bookkeeping. */
  describe(id, header, record, now, title, activityAt) {
    const createdAt = typeof header?.createdAt === 'number' ? header.createdAt : (record?.archivedAt ?? now)
    return {
      id,
      title: typeof title === 'string' && title !== '' ? title : '',
      workspaceId: this.workspaceOf(id),
      cwd: typeof header?.cwd === 'string' ? header.cwd : null,
      createdAt,
      activityAt,
      archivedAt: record?.archivedAt ?? createdAt,
      /** False when this plugin never witnessed the session entering the archive set. */
      archivedKnown: record?.archivedAt !== undefined,
      reason: record?.auto === true ? 'auto' : 'manual',
      parentId: typeof header?.parentSession === 'string' ? header.parentSession : null,
      running: this.isRunning(id),
      lastAction: record?.lastAction ?? null,
    }
  }

  /**
   * Every archived session as one row, most recently active first, together
   * with how many rows are still waiting for their log facts.
   *
   * The pending count is what lets the page repaint rather than show ids
   * indefinitely: a non-zero value means "the background pass has not caught up
   * yet, ask again", and zero means the titles and dates are final.
   */
  async rows() {
    this.syncArchiveSet()
    // A retired entry stays hidden until its archive membership actually goes
    // away; see {@link retire}. Without this the row reappears for as long as a
    // registry write fails to persist, which is how the page ended up full of
    // ids that could not be deleted.
    const ids = this.ctx.workspaceRegistry.archivedSessionIds
      .filter((id) => this.table?.get(id)?.retiredAt === undefined)
    const headers = await this.headersOf(ids)
    // Never awaits a fold: unwarmed sessions answer from their header for one
    // listing while the background pass catches up.
    const { facts, stale } = this.logFactsOf(ids)
    const now = Date.now()
    const rows = ids.map((id) => {
      const header = headers.get(id)
      const folded = facts.get(id)
      const createdAt = typeof header?.createdAt === 'number' ? header.createdAt : now
      // Fall back to creation only when the log carries no user message at all;
      // a session that was used at all answers with that use, not its opening.
      const activityAt = typeof folded?.activityAt === 'number' ? folded.activityAt : createdAt
      // A header can carry the title itself (some backends persist it), which
      // saves the fold a pass; `pending` still covers sessions that only have
      // it in their log.
      const title = folded?.title ?? (typeof header?.title === 'string' ? header.title : undefined)
      return this.describe(id, header, this.table?.get(id), now, title, activityAt)
    })
    rows.sort((left, right) => right.activityAt - left.activityAt || left.id.localeCompare(right.id))
    return { rows, pending: stale.length }
  }

  /**
   * One bucket per calendar day of last activity, counted over `rows`.
   *
   * `rows` must already have every filter applied *except* the date one, so a
   * bucket counts exactly the rows that picking it will show. Counting the
   * whole archive instead let a day advertise sessions the listing then hid
   * (a subagent session, a row outside the selected workspace): the dropdown
   * said 1 and the table showed 0.
   *
   * Bucketing by the plugin's own first-seen timestamp put every pre-existing
   * archived session into the day this plugin was installed.
   */
  dateBuckets(rows) {
    const counts = new Map()
    for (const row of rows) {
      const day = isoDay(row.activityAt)
      counts.set(day, (counts.get(day) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((left, right) => right[0].localeCompare(left[0]))
      .map(([date, count]) => ({ date, count }))
  }

  // ----------------------------------------------------------------- Remote

  /**
   * Filtered, paginated archive list plus facet data for the UI.
   *
   * `request` carries no default expression: the Gateway's SRC signature
   * parser rejects a Remote method whose parameter list contains defaults,
   * destructuring, or rest, so the empty-object fallback lives in the body.
   */
  async list(request) {
    // Opening the page is exactly when a stale archive entry is felt, so this is
    // the right moment to start the repair — not to wait for it. Fire and
    // forget: the answer below is still served from memory, and the sweep bumps
    // `factsGeneration` so the page reloads into the repaired archive.
    if (!this.orphansRetired) {
      setImmediate(() => {
        this.pruneOrphans().catch((error) => {
          this.ctx.logger.warn(`archive-manager: orphan sweep failed: ${String(error)}`)
        })
      })
    }
    const { rows, pending } = await this.rows()
    const input = request ?? {}
    const filter = input.filter ?? {}
    // `date` is the single-day form the first release shipped; `dateFrom` /
    // `dateTo` are the inclusive range the calendar now asks for. Both are
    // accepted so an old client keeps working.
    const from = dayString(filter.dateFrom) ?? dayString(filter.date)
    const to = dayString(filter.dateTo) ?? dayString(filter.date)
    const search = typeof filter.search === 'string' ? filter.search.trim().toLowerCase() : ''
    // Everything except the date. Facets are counted over this set and the
    // date filter is applied on top of it, which is what keeps a bucket equal
    // to the rows it hands back once picked.
    let scoped = rows
    if (typeof filter.workspaceId === 'string' && filter.workspaceId !== '') {
      scoped = scoped.filter((row) => row.workspaceId === filter.workspaceId)
    }
    if (filter.includeSubagents !== true) scoped = scoped.filter((row) => row.parentId === null)
    if (search !== '') {
      scoped = scoped.filter((row) => row.title.toLowerCase().includes(search)
        || row.id.toLowerCase().includes(search)
        || (row.cwd ?? '').toLowerCase().includes(search))
    }
    // Buckets and the date filter must read the same timestamp, or picking a
    // day shows a different set than the bucket promised.
    const filtered = from === undefined && to === undefined
      ? scoped
      : scoped.filter((row) => {
        const day = isoDay(row.activityAt)
        return (from === undefined || day >= from) && (to === undefined || day <= to)
      })
    const total = filtered.length
    const pageSize = clampInt(input.pageSize, 1, 500, 50)
    const pageCount = Math.max(1, Math.ceil(total / pageSize))
    const page = clampInt(input.page, 1, pageCount, 1)
    const start = (page - 1) * pageSize
    return {
      total,
      page,
      pageSize,
      pageCount,
      items: filtered.slice(start, start + pageSize),
      workspaces: this.workspaceLabels(),
      archiveTotal: rows.length,
      dates: this.dateBuckets(scoped),
      /**
       * Rows whose log facts are still being folded in the background.
       * Non-zero means the page should refetch shortly: titles and dates for
       * those rows are not final yet.
       */
      pending,
      /** Changes whenever a fold lands, so a poller can tell progress from a stall. */
      factsGeneration: this.factsGeneration,
      /**
       * Proves the host half understands `dateFrom`/`dateTo`. A client bundle
       * can be hot-reloaded on its own, so without this flag an old host would
       * silently ignore a range and answer with the whole archive.
       */
      supportsRange: true,
    }
  }

  async getSettings() {
    return {
      policy: this.policy(),
      lastRun: this.lastRun.at === 0 ? null : this.lastRun,
      intervalMinutes: this.config.cleanupIntervalMinutes,
    }
  }

  async setPolicy(policy) {
    const next = normalizePolicy({ ...this.policy(), ...(policy ?? {}) })
    await this.global.set({ policy: next })
    return next
  }

  /** Move sessions out of the archive set; idempotent per session. */
  async unarchive(sessionIds) {
    const ids = Array.isArray(sessionIds) ? sessionIds : []
    let moved = 0
    const failed = []
    for (const id of ids) {
      try {
        await this.ctx.workspaceRegistry.unarchiveSession(id)
        this.table?.delete(id)
        moved++
      } catch (error) {
        failed.push({ id, message: String(error?.message ?? error) })
      }
    }
    return { moved, failed }
  }

  /**
   * Permanently delete archived sessions from disk.
   *
   * This is the one destructive capability, and DSH exposes no seam for it:
   * `sessionPersistence` has no delete (only list/open/create), and
   * `workspaceRegistry` only archives. The implementation therefore resolves
   * each session's artifact through the persistence backend's own `locate()`
   * hook — never by string-concatenating a path — and refuses anything outside
   * the configured sessions root.
   *
   * Deletion is two different operations depending on what is actually there.
   * A session whose log still exists is removed from disk. A session whose log
   * is already gone — the archive set can name sessions the store no longer
   * has — has nothing to remove, and its row used to be undeletable forever
   * because the artifact could never be located; it is healed instead by
   * dropping the bookkeeping and the archive membership, which is exactly what
   * {@link pruneOrphans} does in the background.
   *
   * Refusals, all reported per session instead of thrown: a running session,
   * which would keep writing to a directory that no longer exists; and a
   * session whose artifact exists but cannot be located.
   *
   * The method is named `deleteSessions`, not `remove`: the Client's
   * `RemoteNamespaceService` owns a `remove()` of its own, and its
   * `assertMethodAvailable()` rejects any endpoint whose name appears on that
   * prototype — which fails the WHOLE namespace mount, not just this method.
   */
  async deleteSessions(sessionIds) {
    const ids = Array.isArray(sessionIds) ? sessionIds : []
    const done = []
    const orphans = []
    const failed = []
    const persistence = this.ctx.get('sessionPersistence')
    if (persistence === undefined || typeof persistence.stat !== 'function') {
      return { deleted: 0, done, orphans, failed: ids.map((id) => ({ id, message: 'session persistence is not available' })) }
    }
    const headers = await this.headersOf(ids)
    for (const id of ids) {
      try {
        if (this.isRunning(id)) {
          failed.push({ id, message: 'session is running' })
          continue
        }
        const located = this.locateOf(persistence, id, headers.get(id))
        const target = located?.path
        const hasArtifact = await this.artifactExists(persistence, id)
        if (hasArtifact !== true && target === undefined) {
          // Nothing on disk to remove: heal the archive entry instead of
          // refusing the row the user just asked to get rid of.
          await this.retire(id)
          done.push(id)
          orphans.push(id)
          continue
        }
        if (target === undefined) {
          failed.push({ id, message: 'session persistence did not locate an artifact' })
          continue
        }
        // The artifact is `<root>/<project>/<sessionDir>/session.vN.jsonl.zst`;
        // removing the session directory also drops its other generations.
        const directory = dirname(target)
        // A known sessions root is authoritative: see {@link sessionRoots}. Only
        // when a build publishes none at all — and has no DSH home to fall back
        // on — is the weaker signal used, and then a directory named exactly
        // after the session is the strongest one available.
        const guarded = this.sessionRoots(persistence).length > 0
          ? this.withinRoot(directory, persistence)
          : basename(directory) === id
        if (!guarded) {
          failed.push({ id, message: `refusing to delete outside the sessions root: ${directory}` })
          continue
        }
        await rm(directory, { recursive: true, force: true })
        await this.retire(id)
        done.push(id)
      } catch (error) {
        failed.push({ id, message: String(error?.message ?? error) })
      }
    }
    return { deleted: done.length, done, orphans, failed }
  }

  /**
   * Retire an archive entry whose session log no longer exists: tombstone it,
   * then drop the archive membership this plugin does not own.
   *
   * The tombstone is written BEFORE the membership is dropped, and it is what
   * makes the result stick. A delete that removed the log but failed to remove
   * the membership is precisely how the archive set ended up full of entries
   * that show an id and cannot be deleted; if the registry write fails again,
   * the row must still disappear instead of coming back on the next listing.
   * {@link syncArchiveSet} deletes the tombstoned record once the id is really
   * gone from the archive set, so nothing accumulates.
   */
  async retire(id) {
    const record = this.table?.get(id)
    const now = Date.now()
    this.table?.put(id, {
      sessionId: id,
      archivedAt: record?.archivedAt ?? now,
      auto: record?.auto === true,
      lastActionAt: now,
      lastAction: 'retired',
      ...(record?.factVersion === undefined ? {} : { factVersion: record.factVersion }),
      ...(record?.title === undefined ? {} : { title: record.title }),
      ...(record?.activityAt === undefined ? {} : { activityAt: record.activityAt }),
      retiredAt: now,
    })
    await this.ctx.workspaceRegistry.unarchiveSession(id)
  }

  /**
   * Resolve a session's artifact path through the backend's own `locate()`.
   *
   * Only a header the store actually handed out is a documented input, but a
   * record can exist without a header (and then the row is undeletable), so the
   * bare `{ id }` shape is tried as well before giving up.
   */
  locateOf(persistence, id, header) {
    const candidates = header === undefined ? [{ id }] : [header, { id }]
    for (const candidate of candidates) {
      try {
        const located = persistence.locate(candidate)
        if (typeof located?.path === 'string' && located.path !== '') return located
      } catch {
        // A backend that rejects the shape simply has no artifact for it.
      }
    }
    return undefined
  }

  /**
   * Whether the persistence backend still has a log for `id`.
   *
   * `stat()` is the backend's own existence probe — the same one the fact fold
   * uses — so this never guesses at a path. `undefined` means "cannot tell"
   * (no probe or a throwing probe) and callers must not treat it as absence.
   */
  async artifactExists(persistence, id) {
    if (typeof persistence?.stat !== 'function') return undefined
    try {
      return (await persistence.stat(id)) !== undefined
    } catch {
      return undefined
    }
  }

  /**
   * Persistent directories a session artifact may legitimately live under.
   *
   * The backend keeps its root wherever it happens to: `root`, `config.root`,
   * or `options.root` depending on the build, and on this DSH version none of
   * them is published. Reading only `root ?? config.root` answered `undefined`,
   * so {@link withinRoot} refused EVERY delete with "refusing to delete outside
   * the sessions root" — the destructive half of the feature could not work at
   * all. The configured value is still preferred; the DSH home fallbacks
   * (`$DSH_HOME/sessions`, `~/.dsh/sessions`, what `dshHomePath('sessions')`
   * resolves to) cover the backend that exposes nothing.
   */
  sessionRoots(persistence) {
    const roots = []
    const push = (value) => {
      if (typeof value !== 'string' || value === '') return
      const normalized = resolve(value)
      if (!roots.includes(normalized)) roots.push(normalized)
    }
    push(persistence?.root)
    push(persistence?.config?.root)
    push(persistence?.options?.root)
    const home = typeof process.env.DSH_HOME === 'string' ? process.env.DSH_HOME : undefined
    if (home !== undefined && home !== '') push(join(home, 'sessions'))
    try {
      push(join(homedir(), '.dsh', 'sessions'))
    } catch {
      // No home directory means no fallback root to offer.
    }
    return roots
  }

  /**
   * Whether `directory` is inside one of the sessions roots.
   *
   * The guard is `resolve`d on both sides and requires a real path-separator
   * boundary, so a sibling directory sharing the root's name prefix
   * (`.../sessions-evil`) cannot pass. The root itself is not a session
   * directory and is refused.
   */
  withinRoot(directory, persistence) {
    const normalizedTarget = resolve(directory)
    for (const root of this.sessionRoots(persistence)) {
      if (normalizedTarget === root) return false
      if (normalizedTarget.startsWith(root + sep)) return true
    }
    return false
  }

  /**
   * Drop archive entries whose session log no longer exists.
   *
   * This is the repair pass for state this plugin cannot otherwise explain: the
   * archive set can name sessions the store has already lost, and such a row
   * can neither fold facts (it lists as a bare id) nor be deleted (deletion
   * resolved the artifact through `locate()`). Only this plugin tracks those
   * entries, so only this plugin can retire them.
   *
   * `list()` and `stat()` must BOTH agree before an entry counts as gone, so a
   * session that merely was not enumerated is never dropped. An empty listing
   * means the backend could not enumerate the store — not that the whole
   * archive lost its logs — and is ignored for the same reason.
   */
  async pruneOrphans() {
    const persistence = this.ctx.get('sessionPersistence')
    if (persistence === undefined) return 0
    const archived = [...this.ctx.workspaceRegistry.archivedSessionIds]
    if (archived.length === 0) return 0
    let present
    if (typeof persistence.list === 'function') {
      let snapshots
      try {
        snapshots = await persistence.list()
      } catch (error) {
        this.ctx.logger.warn(`archive-manager: listing sessions to prune orphans failed: ${String(error)}`)
        return 0
      }
      const ids = new Set()
      for (const snapshot of snapshots ?? []) {
        const id = snapshot?.header?.id
        if (id !== undefined) ids.add(id)
      }
      if (ids.size === 0) return 0
      present = ids
    }
    const missing = []
    for (const id of archived) {
      if (present?.has(id) === true) continue
      if (this.isRunning(id)) continue
      const exists = await this.artifactExists(persistence, id)
      if (exists === true) continue
      missing.push(id)
    }
    for (const id of missing) {
      try {
        await this.retire(id)
      } catch (error) {
        this.ctx.logger.warn(`archive-manager: retiring the archive entry of "${id}" failed: ${String(error)}`)
      }
    }
    this.orphansRetired = true
    if (missing.length > 0) {
      this.ctx.logger.info(`archive-manager: retired ${missing.length} archive entr${missing.length === 1 ? 'y' : 'ies'} whose session log no longer exists`)
      // The retired entries are visible in the list, so the next read is a new
      // generation.
      this.factsGeneration++
    }
    return missing.length
  }

  /**
   * Compute what the cleanup policy would do right now, without acting.
   *
   * `plan()` reads `planRows`, which only a sweep fills in, so this used to
   * answer `[]` for every policy unless a sweep happened to have run first:
   * the preview button claimed there was nothing to do and then "Run now"
   * proposed 49 actions over the same archive. Reading the rows here is the
   * same work a dry run does, and a plan over the live archive is what the
   * caller is asking for.
   */
  async preview() {
    this.planRows = (await this.rows()).rows
    try {
      this.planIdle = await this.idleCandidates(this.archivedSet(), this.policy())
      return this.plan()
    } finally {
      this.planRows = undefined
      this.planIdle = undefined
    }
  }

  /** Run the cleanup policy now; `dryRun` returns the plan unchanged. */
  async runCleanup(request) {
    return this.sweep(request?.dryRun === true)
  }

  /**
   * Sessions outside the archive that the idle rule may move into it.
   *
   * The archive rule used to plan `archive` actions for rows drawn from
   * `rows()`, which is by definition the archived set, so every such action
   * re-archived a session that was already archived: the registry returned
   * early, the plugin reported success, and the setting never did anything.
   * Idle sessions live on the other side of the archive boundary, so they have
   * to be discovered from the whole store rather than from the archive set.
   *
   * `list()` supplies both the header and the revision for every session in one
   * pass (~130ms for this machine's 223 sessions), and the revision carries the
   * mtime, so this never opens a log. Subagent sessions are skipped unless the
   * policy includes them, and live/running sessions are skipped always.
   */
  async idleCandidates(archived, policy) {
    const persistence = this.ctx.get('sessionPersistence')
    if (persistence === undefined || typeof persistence.list !== 'function') return []
    let snapshots = []
    try {
      snapshots = await persistence.list()
    } catch (error) {
      this.ctx.logger.warn(`archive-manager: listing sessions for cleanup failed: ${String(error)}`)
      return []
    }
    const now = Date.now()
    const idle = []
    for (const snapshot of snapshots) {
      const header = snapshot?.header
      if (header?.id === undefined || archived.has(header.id)) continue
      if (!policy.includeSubagents && typeof header.parentSession === 'string') continue
      if (this.isRunning(header.id)) continue
      const activityAt = activityOfRevision(snapshot.revision)
      if (activityAt === undefined) continue
      const idleDays = (now - activityAt) / DAY_MS
      if (policy.autoArchiveDays > 0 && idleDays > policy.autoArchiveDays) {
        // No title here on purpose: `syncArchiveSet` drops the record of every
        // session that is not archived, so an idle candidate has no record and
        // therefore no folded facts yet. The plan shows its id, and the
        // background fold gives it a title once it has been archived.
        idle.push({
          id: header.id,
          title: '',
          kind: 'archive',
          reason: 'idle',
          ageDays: Math.floor(idleDays),
        })
      }
    }
    idle.sort((left, right) => right.ageDays - left.ageDays || left.id.localeCompare(right.id))
    return idle
  }

  plan() {
    const policy = this.policy()
    const now = Date.now()
    const actions = []
    const excluded = []
    const candidates = []
    for (const row of this.planRows ?? []) {
      if (!policy.includeSubagents && row.parentId !== null) continue
      if (row.running) {
        excluded.push({ id: row.id, title: row.title, reason: 'running' })
        continue
      }
      const archivedDays = (now - row.archivedAt) / DAY_MS
      if (policy.retentionDays > 0 && archivedDays > policy.retentionDays) {
        actions.push({ id: row.id, title: row.title, kind: 'unarchive', reason: 'retention', ageDays: Math.floor(archivedDays) })
        continue
      }
      if (policy.capCount > 0) candidates.push(row)
    }
    if (policy.capCount > 0 && candidates.length > policy.capCount) {
      const planned = new Set(actions.map((action) => action.id))
      for (const row of candidates.slice(policy.capCount)) {
        if (planned.has(row.id)) continue
        actions.push({ id: row.id, title: row.title, kind: 'unarchive', reason: 'cap', ageDays: Math.floor((now - row.archivedAt) / DAY_MS) })
      }
    }
    // Idle candidates come from outside the archive, so they are gathered
    // separately by the caller and appended here. They must carry kind
    // 'archive'; `sweep()` branches on that to call archiveSession.
    for (const action of this.planIdle ?? []) actions.push(action)
    return { actions, excluded, policy, previewedAt: now }
  }

  async sweep(dryRun) {
    // Cleanup planning reads titles and dates too; it may wait for the fold
    // because it is not serving a UI request.
    this.planRows = (await this.rows()).rows
    if (this.running) {
      this.planRows = undefined
      return { skipped: true, actions: [], excluded: [], applied: 0 }
    }
    try {
      this.planIdle = await this.idleCandidates(this.archivedSet(), this.policy())
      if (dryRun) return { ...this.plan(), applied: 0, skipped: false, dryRun: true }
      this.running = true
      const plan = this.plan()
      const now = Date.now()
      let applied = 0
      const failed = []
      for (const action of plan.actions) {
        try {
          if (action.kind === 'unarchive') {
            await this.ctx.workspaceRegistry.unarchiveSession(action.id)
            this.table?.delete(action.id)
          } else {
            await this.ctx.workspaceRegistry.archiveSession(action.id)
            // An idle candidate has no record — `syncArchiveSet` deletes the
            // record of any session outside the archive — so this cannot
            // resurrect folded facts by writing a fresh object. What it can do
            // is keep the facts of a session that had a record for another
            // reason, spreading `existing` rather than overwriting it.
            const existing = this.table?.get(action.id)
            this.table?.put(action.id, {
              ...(existing ?? {}),
              sessionId: action.id,
              archivedAt: now,
              auto: true,
              lastActionAt: now,
              lastAction: 'idle',
            })
            // Ask for this session's facts now instead of waiting up to a
            // minute for the periodic refresh: a freshly auto-archived session
            // otherwise lists as a bare id.
            this.scheduleWarm([action.id])
          }
          applied++
        } catch (error) {
          failed.push({ id: action.id, message: String(error?.message ?? error) })
        }
      }
      const report = {
        actions: plan.actions,
        excluded: plan.excluded,
        policy: plan.policy,
        previewedAt: plan.previewedAt,
        applied,
        failed,
        appliedAt: now,
        skipped: false,
      }
      this.lastRun = { at: now, report: { actions: plan.actions, excluded: plan.excluded, applied, failed } }
      return report
    } finally {
      this.running = false
      this.planRows = undefined
      this.planIdle = undefined
    }
  }
}

/**
 * Applicable entry point, kept alongside the default export.
 *
 * Cordis loads a plugin module either as a Service class (default export, the
 * declared service name is then mounted by the loader) or as an
 * `{ apply, inject }` object. dsh-plugin.org lists "exports an `apply(ctx)`
 * module" as an acceptance requirement, and both forms are equally valid to
 * the loader — so the class is also published as `apply`, which makes the
 * module satisfy either contract without changing what it does.
 *
 * @param ctx - the Host cordis context.
 * @returns the mounted service instance.
 */
export function apply(ctx) {
  return ctx.plugin(ArchiveManagerService)
}

export default ArchiveManagerService
