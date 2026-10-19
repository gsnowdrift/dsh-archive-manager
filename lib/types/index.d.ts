/** Row returned by `remote.archiveManager.list`. */
export interface ArchiveRow {
  id: string
  title: string
  workspaceId: string
  cwd: string | null
  createdAt: number
  activityAt: number
  archivedAt: number
  reason: 'manual' | 'auto'
  parentId: string | null
  origin: string | null
  running: boolean
  lastAction: string | null
}

export interface ArchivePolicy {
  cleanupEnabled: boolean
  autoArchiveDays: number
  retentionDays: number
  capCount: number
  includeSubagents: boolean
}

export interface ArchiveListRequest {
  filter?: { date?: string; workspaceId?: string; search?: string; includeSubagents?: boolean }
  page?: number
  pageSize?: number
}

export interface CleanupAction {
  id: string
  title: string
  kind: 'archive' | 'unarchive'
  reason: 'idle' | 'retention' | 'cap'
  ageDays: number
}

export interface CleanupReport {
  actions: CleanupAction[]
  excluded: { id: string; title: string; reason: string }[]
  policy: ArchivePolicy
  previewedAt: number
  applied: number
  failed?: { id: string; message: string }[]
  dryRun?: boolean
  skipped?: boolean
}

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface TypertRemoteNamespaceMap {
    archiveManager: 'archiveManager'
  }
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    archiveManager: import('./index.js').ArchiveManagerService
  }
}
