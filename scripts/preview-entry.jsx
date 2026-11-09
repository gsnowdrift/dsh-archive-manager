/**
 * Preview entry (dev only): mounts the settings section with a mocked Remote
 * API so the layout can be rendered outside DSH by `scripts/preview-ui.mjs`.
 * Not part of the plugin bundle.
 *
 * The section is mounted inside a fixed `z-index: 1000` overlay on purpose:
 * that is what DSH's settings dialog is, and it is the stacking context that
 * used to swallow the date popover (Mantine defaults to z-index 300 / 200).
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import { ArchiveManagerPage } from '../src/client.jsx'

const now = Date.now()
const hours = 3_600_000
const days = 86_400_000

const rows = [
  {
    id: 'ses_8f21c4', title: '重构登录鉴权模块', workspaceId: 'ws1', cwd: 'D:/demo/projects/demo-web',
    createdAt: now - 2 * days, activityAt: now - 2 * hours, archivedAt: now - 40 * 60_000,
    reason: 'auto', parentId: null, origin: 'manual', running: true, lastAction: 'idle',
  },
  {
    id: 'ses_2b7a90', title: '周报数据汇总脚本', workspaceId: 'ws2', cwd: 'D:/demo/projects/demo-data',
    createdAt: now - 3 * days, activityAt: now - 3 * hours, archivedAt: now - 2 * hours,
    reason: 'auto', parentId: null, origin: 'manual', running: false, lastAction: 'idle',
  },
  {
    id: 'ses_5c13ee', title: '接口联调记录整理', workspaceId: 'ws3', cwd: 'D:/demo/projects/demo-docs',
    createdAt: now - 9 * days, activityAt: now - 5 * hours, archivedAt: now - 6 * hours,
    reason: 'manual', parentId: null, origin: 'manual', running: false, lastAction: 'seen',
  },
  {
    id: 'ses_7d40b2', title: '子代理：整理接口字段说明', workspaceId: 'ws3', cwd: 'D:/demo/projects/demo-docs',
    createdAt: now - 8 * days, activityAt: now - days - 2 * hours, archivedAt: now - days - 1 * hours,
    reason: 'manual', parentId: 'ses_5c13ee', origin: 'subagent', running: false, lastAction: 'seen',
  },
  {
    id: 'ses_9e6f31', title: '排查前端构建变慢', workspaceId: 'ws1', cwd: 'D:/demo/projects/demo-web',
    createdAt: now - 14 * days, activityAt: now - 2 * days, archivedAt: now - 2 * days,
    reason: 'manual', parentId: null, origin: 'manual', running: false, lastAction: 'seen',
  },
  {
    id: 'ses_4a8d57', title: '季度复盘材料初稿', workspaceId: 'ws3', cwd: 'D:/demo/projects/demo-docs',
    createdAt: now - 20 * days, activityAt: now - 4 * days, archivedAt: now - 4 * days,
    reason: 'auto', parentId: null, origin: 'manual', running: false, lastAction: 'idle',
  },
]

const dayOf = (ms) => {
  const date = new Date(ms)
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Mirrors the host: filter and buckets both read the ARCHIVE day. */
const api = {
  list: async (request) => {
    const filter = (request && request.filter) || {}
    let scoped = rows
    if (filter.workspaceId) scoped = scoped.filter((row) => row.workspaceId === filter.workspaceId)
    if (filter.includeSubagents !== true) scoped = scoped.filter((row) => row.parentId === null)
    if (filter.search) {
      const needle = String(filter.search).toLowerCase()
      scoped = scoped.filter((row) => row.title.toLowerCase().includes(needle)
        || row.id.toLowerCase().includes(needle)
        || (row.cwd || '').toLowerCase().includes(needle))
    }
    const buckets = new Map()
    for (const row of scoped) buckets.set(dayOf(row.archivedAt), (buckets.get(dayOf(row.archivedAt)) ?? 0) + 1)
    const filtered = scoped.filter((row) => {
      const day = dayOf(row.archivedAt)
      return (!filter.dateFrom || day >= filter.dateFrom) && (!filter.dateTo || day <= filter.dateTo)
    })
    return {
      ok: true,
      value: {
        total: filtered.length,
        page: 1,
        pageSize: 25,
        pageCount: 1,
        items: filtered,
        workspaces: { ws1: 'demo-web', ws2: 'demo-data', ws3: 'demo-docs' },
        archiveTotal: rows.length,
        dates: [...buckets.entries()]
          .sort((left, right) => right[0].localeCompare(left[0]))
          .map(([date, count]) => ({ date, count })),
        pending: 0,
        supportsRange: true,
      },
    }
  },
  getSettings: async () => ({
    ok: true,
    value: {
      policy: { cleanupEnabled: true, autoArchiveDays: 7, autoDeleteDays: 30 },
      lastRun: { at: now - hours, report: { actions: [], excluded: [], applied: 0, failed: [] } },
      intervalMinutes: 30,
    },
  }),
  setPolicy: async (policy) => ({ ok: true, value: policy }),
  unarchive: async () => ({ ok: true, value: { moved: 0, failed: [] } }),
  deleteSessions: async () => ({ ok: true, value: { deleted: 0, done: [], orphans: [], failed: [] } }),
  preview: async () => ({ ok: true, value: { actions: [], excluded: [], policy: {}, previewedAt: now } }),
  runCleanup: async () => ({
    ok: true,
    value: { actions: [], excluded: [], applied: 0, failed: [], previewedAt: now, skipped: false, dryRun: true },
  }),
}

createRoot(document.getElementById('root')).render(
  React.createElement(
    'div',
    { style: { position: 'fixed', inset: 0, zIndex: 1000, overflow: 'auto', background: '#f6f6f4', padding: '20px' } },
    React.createElement(
      'div',
      { style: { maxWidth: '900px', margin: '0 auto' } },
      React.createElement(ArchiveManagerPage, { getApi: () => api, getMountError: () => null }),
    ),
  ),
)
