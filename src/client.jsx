/**
 * Archive Manager — Client half (source).
 *
 * Built by `scripts/build-client.mjs` (esbuild) into `lib/client.js`, the
 * `dsh.client` bundle the module loader materializes. Never ship this file
 * directly: the loader expects the `window.__ModuleLoader__.load({factory})`
 * wrapper plus the single inlined stylesheet the build emits.
 *
 * UI kit: Mantine 7 (MIT). React / react-dom / react/jsx-runtime are platform
 * seed words of the DSH web shell, so they stay external and the bundle carries
 * only the components it uses.
 */
import React from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Checkbox,
  Chip,
  Divider,
  Group,
  Loader,
  MantineProvider,
  Modal,
  NativeSelect,
  NumberInput,
  Pagination,
  Paper,
  Popover,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core'
import { DatePicker, DatesProvider } from '@mantine/dates'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import 'dayjs/locale/zh-cn'

const NS = 'archiveManager'
const REMOTE_NS = 'archiveManager'
const REMOTE_SERVICE_KEY = `remote.${REMOTE_NS}`

const zh = {
  nav: '归档会话',
  'panel.total': '共 {count} 个会话',
  'panel.search': '搜索标题 / 工作区 / 会话 ID',
  'panel.date': '日期',
  'panel.date.all': '全部日期',
  'panel.date.today': '今天',
  'panel.date.last7': '近 7 天',
  'panel.date.last30': '近 30 天',
  'panel.date.range': '{from} ~ {to}',
  'panel.date.clear': '清除日期',
  'panel.date.hint': '点开始日、再点结束日；同一天点两次即只看该日',
  'panel.clearFilters': '清除筛选',
  'panel.workspace.all': '全部工作区',
  'panel.subagents': '含子代理',
  'panel.refresh': '刷新',
  'panel.empty': '暂无归档会话',
  'panel.emptyFiltered': '当前筛选没有匹配的会话',
  'panel.selected': '已选 {count} 项',
  'panel.clear': '取消选择',
  'panel.unarchive': '取消归档',
  'panel.unarchiveMany': '取消归档 {count} 项',
  'panel.delete': '删除',
  'panel.deleteMany': '删除 {count} 项',
  'panel.deleteTitle': '删除会话',
  'panel.deleteConfirm': '确认删除选中的 {count} 个会话？会话日志会被永久删除，无法恢复。',
  'panel.cancel': '取消',
  'panel.moved': '已取消归档 {count} 个会话',
  'panel.deleted': '已删除 {count} 个会话，失败 {failed} 个',
  'panel.repaired': '；另外清理了 {count} 个空壳条目',
  'panel.pending': '标题解析中，稍后自动刷新…',
  'panel.archivedAt': '归档 {time}',
  'panel.activity': '最近活动 {time}',
  'panel.justNow': '刚刚',
  'panel.minutesAgo': '{count} 分钟前',
  'panel.hoursAgo': '{count} 小时前',
  'panel.yesterday': '昨天',
  'panel.selectAll': '全选本页',
  'panel.badge.running': '运行中',
  'panel.badge.auto': '自动归档',
  'panel.badge.manual': '手动归档',
  'panel.badge.subagent': '子代理',
  'panel.groupToday': '今天 · {date} · {count} 个会话',
  'panel.groupYesterday': '昨天 · {date} · {count} 个会话',
  'panel.groupDay': '{date} · {count} 个会话',
  'panel.settings': '自动清理',
  'panel.cleanupEnabled': '启用定时清理',
  'panel.cleanupEnabledHint': '按下面的规则在后台自动归档与删除会话',
  'panel.autoArchiveDays': '自动归档闲置会话',
  'panel.autoArchiveDaysHint': '闲置超过设定天数后归档，0 关闭',
  'panel.autoDeleteDays': '自动删除归档会话',
  'panel.autoDeleteDaysHint': '归档超过设定天数后自动删除（含手动归档），0 归档时立即删除',
  'panel.deleteAtArchive': '0 天模式：新归档的会话会被立即删除',
  'panel.unitDays': '天',
  'panel.save': '保存设置',
  'panel.saved': '已保存',
  'panel.preview': '预览计划',
  'panel.runCleanup': '立即执行',
  'panel.lastRun': '上次执行：{time}',
  'panel.never': '尚未执行过',
  'panel.dryRun': '仅预览，未执行',
  'panel.plannedDetail': '将归档 {archive} 项、删除 {delete} 项',
  'panel.excludedRunning': '运行中跳过 {count} 项',
  'panel.applied': '已执行 {count} 项，失败 {failed} 项',
  'panel.apiMissing': '插件数据通道未就绪（Remote 命名空间挂载失败）。',
  'panel.mountFailed': '数据通道挂载失败：{message}',
  'panel.hostStale': '宿主端尚未重启，日期筛选可能不生效。完全退出 DSH 再打开即可。',
  'panel.dismiss': '关闭',
}

const en = {
  nav: 'Archived sessions',
  'panel.total': '{count} sessions',
  'panel.search': 'Search title / workspace / session id',
  'panel.date': 'Date',
  'panel.date.all': 'All dates',
  'panel.date.today': 'Today',
  'panel.date.last7': 'Last 7 days',
  'panel.date.last30': 'Last 30 days',
  'panel.date.range': '{from} ~ {to}',
  'panel.date.clear': 'Clear date',
  'panel.date.hint': 'Pick the start day, then the end day; pick one day twice for a single day',
  'panel.clearFilters': 'Clear filters',
  'panel.workspace.all': 'All workspaces',
  'panel.subagents': 'Include subagents',
  'panel.refresh': 'Refresh',
  'panel.empty': 'No archived sessions',
  'panel.emptyFiltered': 'No session matches the current filter',
  'panel.selected': '{count} selected',
  'panel.clear': 'Clear',
  'panel.unarchive': 'Unarchive',
  'panel.unarchiveMany': 'Unarchive {count}',
  'panel.delete': 'Delete',
  'panel.deleteMany': 'Delete {count}',
  'panel.deleteTitle': 'Delete sessions',
  'panel.deleteConfirm': 'Delete the {count} selected sessions? Their logs are removed permanently.',
  'panel.cancel': 'Cancel',
  'panel.moved': 'Unarchived {count} sessions',
  'panel.deleted': 'Deleted {count} sessions, {failed} failed',
  'panel.repaired': '; cleaned up {count} stale entries',
  'panel.pending': 'Resolving titles, the list refreshes shortly…',
  'panel.archivedAt': 'Archived {time}',
  'panel.activity': 'Active {time}',
  'panel.justNow': 'just now',
  'panel.minutesAgo': '{count} min ago',
  'panel.hoursAgo': '{count} h ago',
  'panel.yesterday': 'yesterday',
  'panel.selectAll': 'Select page',
  'panel.badge.running': 'Running',
  'panel.badge.auto': 'Auto',
  'panel.badge.manual': 'Manual',
  'panel.badge.subagent': 'Subagent',
  'panel.groupToday': 'Today · {date} · {count} sessions',
  'panel.groupYesterday': 'Yesterday · {date} · {count} sessions',
  'panel.groupDay': '{date} · {count} sessions',
  'panel.settings': 'Automatic cleanup',
  'panel.cleanupEnabled': 'Enable scheduled cleanup',
  'panel.cleanupEnabledHint': 'Archive and delete sessions in the background by the rules below',
  'panel.autoArchiveDays': 'Auto-archive idle sessions',
  'panel.autoArchiveDaysHint': 'Archive after this many idle days, 0 off',
  'panel.autoDeleteDays': 'Auto-delete archived sessions',
  'panel.autoDeleteDaysHint': 'Delete after this many days archived (manual archives too), 0 deletes at archiving',
  'panel.deleteAtArchive': '0-day mode: newly archived sessions are deleted immediately',
  'panel.unitDays': 'days',
  'panel.save': 'Save',
  'panel.saved': 'Saved',
  'panel.preview': 'Preview plan',
  'panel.runCleanup': 'Run now',
  'panel.lastRun': 'Last run: {time}',
  'panel.never': 'Never run',
  'panel.dryRun': 'preview only, nothing executed',
  'panel.plannedDetail': 'Archive {archive}, delete {delete}',
  'panel.excludedRunning': '{count} running skipped',
  'panel.applied': 'Applied {count}, failed {failed}',
  'panel.apiMissing': 'Plugin data channel is not ready (Remote namespace mount failed).',
  'panel.mountFailed': 'Data channel mount failed: {message}',
  'panel.hostStale': 'The host has not restarted, date filters may not apply. Quit DSH completely and reopen.',
  'panel.dismiss': 'Dismiss',
}

/**
 * The locale service is attached at apply time and read through this closure,
 * so slot components never receive ctx (docs: "服务不暴露").
 */
let localeService

function activeLocale() {
  try {
    const active = localeService && localeService.getSnapshot ? localeService.getSnapshot().active : ''
    if (typeof active === 'string' && active !== '') return active
  } catch {
    /* fall through to the browser language */
  }
  return typeof navigator === 'undefined' ? 'en' : navigator.language
}

function isZhLocale() {
  return String(activeLocale()).toLowerCase().startsWith('zh')
}

/** Translate a copy key through this plugin's namespace, with a bundled fallback. */
function t(key, params) {
  let text
  try {
    const bound = localeService && typeof localeService.bind === 'function' ? localeService.bind(NS) : undefined
    if (typeof bound === 'function') {
      const candidate = bound(key, params)
      if (typeof candidate === 'string' && candidate !== '' && candidate !== key) text = candidate
    }
  } catch {
    /* fall through to the bundled dictionary */
  }
  if (text === undefined) {
    const dict = String(activeLocale()).toLowerCase().startsWith('zh') ? zh : en
    text = dict[key] !== undefined ? dict[key] : (zh[key] !== undefined ? zh[key] : key)
  }
  return params === undefined ? text : fill(text, params)
}

function fill(template, params) {
  let out = String(template)
  for (const key of Object.keys(params)) out = out.split(`{${key}}`).join(String(params[key]))
  return out
}

const pad2 = (value) => String(value).padStart(2, '0')

function formatTime(ms) {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return '—'
  const date = new Date(ms)
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

function dayKey(ms) {
  const date = new Date(ms)
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function dayLabel(ms) {
  const date = new Date(ms)
  return `${pad2(date.getMonth() + 1)}月${pad2(date.getDate())}日`
}

/** Short relative time for the activity line; absolute fallback past a week. */
function relativeTime(ms) {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return '—'
  const diff = Date.now() - ms
  if (diff < 60_000) return t('panel.justNow')
  if (diff < 3_600_000) return fill(t('panel.minutesAgo'), { count: Math.floor(diff / 60_000) })
  if (diff < 86_400_000) return fill(t('panel.hoursAgo'), { count: Math.floor(diff / 3_600_000) })
  if (diff < 172_800_000) return t('panel.yesterday')
  const date = new Date(ms)
  return `${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/** Compact day label for the trigger button: MM-DD inside the current year. */
function shortDay(key) {
  if (typeof key !== 'string' || key.length !== 10) return key
  const year = String(new Date().getFullYear())
  return key.slice(0, 4) === year ? key.slice(5) : key
}

function isoDayOf(date) {
  return dayKey(date.getTime())
}

/**
 * Date filter: a range picker (Mantine `DatePicker type="range"`) plus the
 * quick choices the toolbar used to spell out. Both write the same
 * `{from, to}` day-string pair, so a preset and a hand-picked range reach the
 * host through one code path (`dateFrom` / `dateTo`).
 *
 * `counts` comes from the host's day buckets and is drawn under each day, so
 * the calendar answers "which days are worth widening to" before the click.
 */
function DateRangeControl({ range, counts, onChange, t }) {
  const [opened, setOpened] = React.useState(false)
  // The calendar edits a DRAFT. A controlled DatePicker fed a `value` rebuilt
  // from props on every render drops the first click of a range — only one end
  // exists at that point, so the component is reset and nothing appears to
  // happen. The draft keeps the half-finished range alive until both ends land.
  const [draft, setDraft] = React.useState([null, null])
  const hasRange = range.from !== '' && range.to !== ''
  const value = draft
  const rangeValue = () => (hasRange
    ? [new Date(`${range.from}T00:00:00`), new Date(`${range.to}T00:00:00`)]
    : [null, null])

  const toggle = () => {
    if (!opened) setDraft(rangeValue())
    setOpened(!opened)
  }

  const today = new Date()
  const todayKey = isoDayOf(today)
  const spanKey = (span) => {
    const start = new Date(today)
    start.setDate(start.getDate() - span)
    return isoDayOf(start)
  }

  const activeQuick = (() => {
    if (!hasRange) return 'all'
    if (range.from === todayKey && range.to === todayKey) return 'today'
    if (range.from === spanKey(6) && range.to === todayKey) return '7'
    if (range.from === spanKey(29) && range.to === todayKey) return '30'
    return null
  })()

  const label = !hasRange
    ? t('panel.date.all')
    : activeQuick === 'today'
      ? t('panel.date.today')
      : activeQuick === '7'
        ? t('panel.date.last7')
        : activeQuick === '30'
          ? t('panel.date.last30')
          : range.from === range.to
            ? shortDay(range.from)
            : fill(t('panel.date.range'), { from: shortDay(range.from), to: shortDay(range.to) })

  const quick = (kind) => {
    setDraft([null, null])
    if (kind === 'all') onChange({ from: '', to: '' })
    else if (kind === 'today') onChange({ from: todayKey, to: todayKey })
    else onChange({ from: spanKey(kind === '7' ? 6 : 29), to: todayKey })
    setOpened(false)
  }

  const pick = (dates) => {
    const next = Array.isArray(dates) ? dates : [null, null]
    setDraft(next)
    // Both ends are needed before the filter changes; the first click of a
    // fresh range therefore keeps the dropdown open for the second one.
    if (!next[0] || !next[1]) return
    onChange({ from: isoDayOf(next[0]), to: isoDayOf(next[1]) })
    setDraft([null, null])
    setOpened(false)
  }

  // The host's day buckets ride along inside each cell. They must not take part
  // in layout — Mantine gives every day a fixed square, so a second line pushes
  // the grid out of alignment — hence the absolutely positioned overlay.
  const renderDay = (date) => {
    const count = counts.get(isoDayOf(date)) ?? 0
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span>{date.getDate()}</span>
        {count > 0 ? (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              textAlign: 'center',
              fontSize: 9,
              lineHeight: '10px',
              opacity: 0.55,
              pointerEvents: 'none',
            }}
          >{count}</span>
        ) : null}
      </div>
    )
  }

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom-start" withArrow shadow="md" width={336} zIndex={2000}>
      <Popover.Target>
        <Button
          variant="default"
          size="sm"
          onClick={toggle}
          aria-label={t('panel.date')}
          style={{ fontWeight: 400, whiteSpace: 'nowrap' }}
        >
          {label}
        </Button>
      </Popover.Target>
      <Popover.Dropdown p="xs">
        <Stack gap={8}>
          <Group gap={6} wrap="wrap">
            {[
              ['all', t('panel.date.all')],
              ['today', t('panel.date.today')],
              ['7', t('panel.date.last7')],
              ['30', t('panel.date.last30')],
            ].map(([kind, text]) => (
              <Chip
                key={kind}
                size="xs"
                checked={activeQuick === kind}
                onChange={() => quick(kind)}
              >
                {text}
              </Chip>
            ))}
          </Group>
          <Divider />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <DatePicker
              type="range"
              size="md"
              value={value}
              onChange={pick}
              numberOfColumns={1}
              // Without this, clicking the same day twice RESETS the range
              // (Mantine's default "deselect" behaviour) and a single-day
              // filter is impossible to express.
              allowSingleDateInRange
              defaultDate={hasRange ? rangeValue()[0] : new Date()}
              renderDay={renderDay}
            />
          </div>
          <Group justify="space-between" gap="xs" wrap="nowrap">
            <Text size="xs" c="dimmed" style={{ flex: 1, lineHeight: 1.45 }}>{t('panel.date.hint')}</Text>
            {hasRange ? (
              <Button variant="subtle" color="gray" size="compact-xs" onClick={() => { setDraft([null, null]); onChange({ from: '', to: '' }) }}>
                {t('panel.date.clear')}
              </Button>
            ) : null}
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  )
}

/** One declared wire parameter; see the note on `codec` below. */
function codec(typeSymbol) {
  return { mode: 'strict', typeSymbol, create: () => passthrough }
}

const passthrough = { parse: (value) => value }

function param(wire) {
  return { name: wire, wire, source: 'json', codec: codec(`@gsnowdrift/dsh-archive-manager#${wire}`) }
}

const remoteDescriptors = [
  { method: 'list', parameters: [param('request')] },
  { method: 'getSettings', parameters: [] },
  { method: 'setPolicy', parameters: [param('policy')] },
  { method: 'unarchive', parameters: [param('sessionIds')] },
  { method: 'deleteSessions', parameters: [param('sessionIds')] },
  { method: 'preview', parameters: [] },
  { method: 'runCleanup', parameters: [param('request')] },
].map((descriptor) => ({
  id: `@gsnowdrift/dsh-archive-manager#archiveManager/${descriptor.method}`,
  service: 'archiveManager',
  namespace: REMOTE_NS,
  method: descriptor.method,
  invocation: { kind: 'direct' },
  parameters: descriptor.parameters,
  result: codec(`@gsnowdrift/dsh-archive-manager#archiveManager/${descriptor.method}/result`),
}))

const theme = {
  primaryColor: 'dark',
  defaultRadius: 'md',
  fontSizes: { xs: '12px', sm: '13px', md: '14px' },
}

const divider = { borderBottom: '0.5px solid var(--mantine-color-default-border)' }

/** Undo arrow: unarchive. Inline SVG so the bundle carries no icon package. */
function IconUndo() {
  return (
    <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={1.9}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h9.5a6 6 0 0 1 0 12H10" />
    </svg>
  )
}

/** Trash can: permanent deletion. */
function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={1.9}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function ArchiveManagerPage(props) {
  const getApi = typeof props.getApi === 'function' ? props.getApi : () => undefined
  const getMountError = typeof props.getMountError === 'function' ? props.getMountError : () => null

  const [api, setApi] = React.useState(() => getApi())
  const [apiMissing, setApiMissing] = React.useState(false)
  const [state, setState] = React.useState({ loading: true, error: null, data: null })
  const [query, setQuery] = React.useState('')
  const [filter, setFilter] = React.useState({ workspaceId: '', from: '', to: '', includeSubagents: false })
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState(() => new Set())
  const [settings, setSettings] = React.useState(null)
  const [notice, setNotice] = React.useState(null)
  const [busy, setBusy] = React.useState(false)
  const [pendingDelete, setPendingDelete] = React.useState(null)
  const pollBudget = React.useRef(0)

  const mountError = getMountError()

  // The namespace service appears a tick after apply(); pick it up when it
  // does. Give up after ~10s and say so, rather than polling for ever.
  React.useEffect(() => {
    if (api !== undefined) return undefined
    let ticks = 0
    const timer = setInterval(() => {
      const next = getApi()
      if (next !== undefined) {
        setApi(next)
        clearInterval(timer)
        return
      }
      ticks += 1
      if (ticks >= 100) {
        clearInterval(timer)
        setApiMissing(true)
      }
    }, 100)
    return () => clearInterval(timer)
  }, [api, getApi])

  // Typing must not fire a request per keystroke.
  const [search, setSearch] = React.useState('')
  React.useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 250)
    return () => clearTimeout(timer)
  }, [query])

  const accept = React.useCallback((value) => {
    setState({ loading: false, error: null, data: value })
    // The host clamps an out-of-range page; follow it instead of asking for a
    // page that no longer exists on every subsequent request.
    if (typeof value.page === 'number' && value.page !== page) setPage(value.page)
  }, [page])

  const load = React.useCallback(async () => {
    if (api === undefined) return
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      const request = {
        filter: {
          dateFrom: filter.from,
          dateTo: filter.to,
          workspaceId: filter.workspaceId,
          search,
          includeSubagents: filter.includeSubagents,
        },
        page,
        pageSize: 25,
      }
      const result = await api.list(request)
      if (!result.ok) throw new Error(result.error?.message || String(result.error))
      accept(result.value)
    } catch (error) {
      setState({ loading: false, error: String(error && error.message ? error.message : error), data: null })
    }
  }, [api, filter.from, filter.to, filter.workspaceId, filter.includeSubagents, search, page, accept])

  React.useEffect(() => { load() }, [load])

  // The host folds titles in the background; a non-zero `pending` means the
  // rows on screen are not final yet. Repaint a bounded number of times so a
  // permanently unreadable log cannot keep the page polling.
  const pending = state.data && typeof state.data.pending === 'number' ? state.data.pending : 0
  React.useEffect(() => {
    if (pending <= 0) {
      pollBudget.current = 0
      return undefined
    }
    if (pollBudget.current >= 20) return undefined
    pollBudget.current += 1
    const timer = setTimeout(() => { load() }, 1200)
    return () => clearTimeout(timer)
  }, [pending, load])

  React.useEffect(() => {
    if (api === undefined) return
    let alive = true
    api.getSettings().then((result) => {
      if (!alive || !result.ok) return
      setSettings(result.value)
    }).catch(() => {})
    return () => { alive = false }
  }, [api])

  React.useEffect(() => {
    if (notice === null) return undefined
    const timer = setTimeout(() => setNotice(null), notice.kind === 'error' ? 8000 : 4000)
    return () => clearTimeout(timer)
  }, [notice])

  const policy = settings ? settings.policy : null

  const notify = (next) => setNotice(next)

  const toggle = (id, checked) => setSelected((current) => {
    const next = new Set(current)
    if (checked) next.add(id)
    else next.delete(id)
    return next
  })

  const pageIds = state.data ? state.data.items.map((row) => row.id) : []
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id))

  const unarchive = async (ids) => {
    if (busy || ids.length === 0 || api === undefined) return
    setBusy(true)
    try {
      const result = await api.unarchive(ids)
      if (!result.ok) throw new Error(result.error?.message || String(result.error))
      notify({ kind: 'ok', text: fill(t('panel.moved'), { count: result.value.moved }) })
      setSelected(new Set())
      setPage(1)
      await load()
    } catch (error) {
      notify({ kind: 'error', text: String(error && error.message ? error.message : error) })
    } finally {
      setBusy(false)
    }
  }

  /**
   * Permanent deletion. Always behind the modal: a running session is refused
   * by the host and reported back per session, and an entry whose log is
   * already gone is repaired rather than counted as a failure.
   */
  const remove = async (ids) => {
    if (busy || ids.length === 0 || api === undefined) return
    setBusy(true)
    try {
      const result = await api.deleteSessions(ids)
      if (!result.ok) throw new Error(result.error?.message || String(result.error))
      const value = result.value
      const failures = Array.isArray(value.failed) ? value.failed : []
      const repaired = Array.isArray(value.orphans) ? value.orphans.length : 0
      notify({
        kind: failures.length > 0 ? 'error' : 'ok',
        text: fill(t('panel.deleted'), { count: value.deleted, failed: failures.length })
          + (repaired > 0 ? fill(t('panel.repaired'), { count: repaired }) : '')
          + (failures.length > 0 ? ' — ' + failures.map((entry) => `${entry.id}: ${entry.message}`).join('; ') : ''),
      })
      setSelected(new Set())
      setPage(1)
      await load()
    } catch (error) {
      notify({ kind: 'error', text: String(error && error.message ? error.message : error) })
    } finally {
      setBusy(false)
      setPendingDelete(null)
    }
  }

  const savePolicy = async () => {
    if (settings === null || api === undefined) return
    setBusy(true)
    try {
      const result = await api.setPolicy(settings.policy)
      if (!result.ok) throw new Error(result.error?.message || String(result.error))
      notify({ kind: 'ok', text: t('panel.saved') })
      setSettings((current) => (current === null ? current : { ...current, policy: result.value }))
    } catch (error) {
      notify({ kind: 'error', text: String(error && error.message ? error.message : error) })
    } finally {
      setBusy(false)
    }
  }

  const runCleanup = async (dryRun) => {
    if (busy || api === undefined) return
    setBusy(true)
    try {
      const result = await api.runCleanup({ dryRun })
      if (!result.ok) throw new Error(result.error?.message || String(result.error))
      const report = result.value
      if (dryRun) {
        const actions = report.actions ?? []
        const archiving = actions.filter((action) => action.kind === 'archive').length
        const deleting = actions.filter((action) => action.kind === 'delete').length
        const excluded = (report.excluded ?? []).length
        const parts = [fill(t('panel.plannedDetail'), { archive: archiving, delete: deleting })]
        if (excluded > 0) parts.push(fill(t('panel.excludedRunning'), { count: excluded }))
        if (report.policy?.autoDeleteDays === 0) parts.push(t('panel.deleteAtArchive'))
        parts.push(t('panel.dryRun'))
        notify({ kind: 'ok', text: parts.join(' · ') })
      } else {
        const failed = report.failed ? report.failed.length : 0
        notify({
          kind: failed > 0 ? 'error' : 'ok',
          text: fill(t('panel.applied'), { count: report.applied, failed }),
        })
        await load()
        if (api !== undefined) {
          const next = await api.getSettings()
          if (next.ok) setSettings(next.value)
        }
      }
    } catch (error) {
      notify({ kind: 'error', text: String(error && error.message ? error.message : error) })
    } finally {
      setBusy(false)
    }
  }

  const rows = state.data ? state.data.items : []
  const total = state.data ? state.data.total : 0
  const pageCount = state.data ? state.data.pageCount : 1
  const buckets = state.data && Array.isArray(state.data.dates) ? state.data.dates : []
  const workspaceMap = state.data && state.data.workspaces ? state.data.workspaces : {}
  const filtered = search !== '' || filter.workspaceId !== '' || filter.from !== '' || filter.to !== '' || filter.includeSubagents
  const counts = new Map(buckets.map((bucket) => [bucket.date, bucket.count]))

  const workspaceData = [{ value: '', label: t('panel.workspace.all') }]
  for (const key of Object.keys(workspaceMap)) {
    workspaceData.push({ value: key, label: workspaceMap[key] || key })
  }

  // Cards group by the archive day: the list is "what did I archive and when",
  // and archivedAt is the timestamp this plugin owns.
  const groups = []
  for (const row of rows) {
    const key = dayKey(row.archivedAt)
    const last = groups[groups.length - 1]
    if (last !== undefined && last.key === key) last.rows.push(row)
    else groups.push({ key, rows: [row], stamp: row.archivedAt })
  }

  const todayKey = dayKey(Date.now())
  const yesterdayKey = dayKey(Date.now() - 86_400_000)

  const groupLabel = (group) => {
    if (group.key === todayKey) return fill(t('panel.groupToday'), { date: dayLabel(group.stamp), count: group.rows.length })
    if (group.key === yesterdayKey) return fill(t('panel.groupYesterday'), { date: dayLabel(group.stamp), count: group.rows.length })
    return fill(t('panel.groupDay'), { date: dayLabel(group.stamp), count: group.rows.length })
  }

  return (
    <MantineProvider theme={theme}>
      <DatesProvider settings={{ locale: isZhLocale() ? 'zh-cn' : 'en', firstDayOfWeek: 1 }}>
        <Stack gap="md">
        <Group justify="space-between" align="baseline">
          <Group gap="xs" align="baseline">
            <Text fw={500} size="md">{t('nav')}</Text>
            <Text size="xs" c="dimmed">{fill(t('panel.total'), { count: total })}</Text>
          </Group>
          <Group gap="xs">
            {pending > 0 ? <Text size="xs" c="dimmed">{t('panel.pending')}</Text> : null}
            <Button variant="default" size="compact-sm" onClick={() => load()} disabled={busy || api === undefined}>
              {t('panel.refresh')}
            </Button>
          </Group>
        </Group>

        {mountError !== null ? (
          <Alert color="red" variant="light">{fill(t('panel.mountFailed'), { message: mountError })}</Alert>
        ) : null}
        {apiMissing ? <Alert color="red" variant="light">{t('panel.apiMissing')}</Alert> : null}
        {state.error !== null ? <Alert color="red" variant="light">{state.error}</Alert> : null}
        {state.data && state.data.supportsRange === false ? (
          <Alert color="orange" variant="light">{t('panel.hostStale')}</Alert>
        ) : null}

        <Group gap="xs" wrap="wrap">
          <TextInput
            placeholder={t('panel.search')}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            size="sm"
            style={{ flex: '1 1 220px', minWidth: 180 }}
          />
          <DateRangeControl
            range={{ from: filter.from, to: filter.to }}
            counts={counts}
            t={t}
            onChange={(next) => {
              setPage(1)
              setFilter((current) => ({ ...current, from: next.from, to: next.to }))
            }}
          />
          <NativeSelect
            data={workspaceData}
            value={filter.workspaceId}
            onChange={(event) => { setPage(1); setFilter((current) => ({ ...current, workspaceId: event.currentTarget.value })) }}
            size="sm"
            aria-label={t('panel.workspace.all')}
            w={150}
          />
          <Switch
            size="sm"
            checked={filter.includeSubagents}
            onChange={(event) => {
              const checked = event.currentTarget.checked
              setPage(1)
              setFilter((current) => ({ ...current, includeSubagents: checked }))
            }}
            label={t('panel.subagents')}
          />
        </Group>

        {selected.size > 0 ? (
          <Paper withBorder radius="md" p="xs" style={{ background: 'var(--mantine-color-blue-light)' }}>
            <Group justify="space-between" gap="xs">
              <Text size="sm" c="blue.9">{fill(t('panel.selected'), { count: selected.size })}</Text>
              <Group gap="xs">
                <Button variant="default" size="compact-sm" disabled={busy} onClick={() => setSelected(new Set())}>
                  {t('panel.clear')}
                </Button>
                <Button variant="light" size="compact-sm" disabled={busy} onClick={() => unarchive([...selected])}>
                  {fill(t('panel.unarchiveMany'), { count: selected.size })}
                </Button>
                <Button color="red" variant="light" size="compact-sm" disabled={busy} onClick={() => setPendingDelete([...selected])}>
                  {fill(t('panel.deleteMany'), { count: selected.size })}
                </Button>
              </Group>
            </Group>
          </Paper>
        ) : null}

        {state.loading && state.data === null ? (
          <Center h={160}><Loader size="sm" /></Center>
        ) : rows.length === 0 ? (
          <Center h={160}>
            <Stack gap="xs" align="center">
              <Text size="sm" c="dimmed">{filtered ? t('panel.emptyFiltered') : t('panel.empty')}</Text>
              {filtered ? (
                <Button
                  variant="default"
                  size="compact-sm"
                  onClick={() => {
                    setPage(1)
                    setQuery('')
                    setFilter({ workspaceId: '', from: '', to: '', includeSubagents: false })
                  }}
                >
                  {t('panel.clearFilters')}
                </Button>
              ) : null}
            </Stack>
          </Center>
        ) : (
          <Stack gap="md">
            <Group justify="space-between" gap="xs">
              <Group gap={8}>
                <Checkbox
                  size="sm"
                  checked={allSelected}
                  indeterminate={!allSelected && pageIds.some((id) => selected.has(id))}
                  onChange={(event) => {
                    const checked = event.currentTarget.checked
                    setSelected((current) => {
                      const next = new Set(current)
                      for (const id of pageIds) {
                        if (checked) next.add(id)
                        else next.delete(id)
                      }
                      return next
                    })
                  }}
                  aria-label={t('panel.selectAll')}
                />
                <Text size="xs" c="dimmed">{t('panel.selectAll')}</Text>
              </Group>
            </Group>

            {groups.map((group) => (
              <Stack key={group.key} gap="xs">
                <Text size="xs" c="dimmed" fw={500}>{groupLabel(group)}</Text>
                {group.rows.map((row) => {
                  const checked = selected.has(row.id)
                  const workspaceTitle = workspaceMap[row.workspaceId] || row.workspaceId || '—'
                  return (
                    <Card
                      key={row.id}
                      withBorder
                      radius="md"
                      padding="sm"
                      style={checked
                        ? { borderColor: 'var(--mantine-color-blue-4)', background: 'var(--mantine-color-blue-0)' }
                        : undefined}
                    >
                      <Group align="flex-start" wrap="nowrap" gap="sm">
                        <Checkbox
                          size="sm"
                          mt={2}
                          checked={checked}
                          onChange={(event) => toggle(row.id, event.currentTarget.checked)}
                          aria-label={row.title}
                        />
                        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                          <Group gap={6} wrap="wrap">
                            <Text size="sm" fw={500} truncate style={{ maxWidth: '100%' }}>{row.title}</Text>
                            {row.running ? <Badge color="orange" variant="light" size="sm">{t('panel.badge.running')}</Badge> : null}
                            <Badge color={row.reason === 'auto' ? 'blue' : 'gray'} variant="light" size="sm">
                              {row.reason === 'auto' ? t('panel.badge.auto') : t('panel.badge.manual')}
                            </Badge>
                            {row.parentId !== null ? <Badge color="gray" variant="outline" size="sm">{t('panel.badge.subagent')}</Badge> : null}
                          </Group>
                          <Text size="xs" c="dimmed" truncate>{workspaceTitle}{row.cwd ? ` · ${row.cwd}` : ''}</Text>
                          <Text size="xs" c="dimmed">
                            {fill(t('panel.archivedAt'), { time: formatTime(row.archivedAt) })}
                            {' · '}
                            {fill(t('panel.activity'), { time: relativeTime(row.activityAt) })}
                          </Text>
                        </Stack>
                        <Group gap={2} wrap="nowrap" style={{ flex: 'none' }}>
                          <Button
                            variant="subtle"
                            color="dark"
                            size="compact-xs"
                            disabled={busy}
                            onClick={() => unarchive([row.id])}
                            leftSection={<IconUndo />}
                          >
                            {t('panel.unarchive')}
                          </Button>
                          <Button
                            variant="subtle"
                            color="red"
                            size="compact-xs"
                            disabled={busy}
                            onClick={() => setPendingDelete([row.id])}
                            leftSection={<IconTrash />}
                          >
                            {t('panel.delete')}
                          </Button>
                        </Group>
                      </Group>
                    </Card>
                  )
                })}
              </Stack>
            ))}

            <Group justify="space-between" gap="xs">
              <Text size="xs" c="dimmed">{fill(t('panel.total'), { count: total })}</Text>
              <Pagination size="sm" total={pageCount} value={page} onChange={setPage} withEdges={pageCount > 7} />
            </Group>
          </Stack>
        )}

        {policy === null ? null : (
          <Card withBorder radius="md" padding="md">
            <Text fw={500} size="sm" mb={4}>{t('panel.settings')}</Text>
            <Stack gap={0}>
              <Group justify="space-between" py="xs" style={divider}>
                <Stack gap={0}>
                  <Text size="sm">{t('panel.cleanupEnabled')}</Text>
                  <Text size="xs" c="dimmed">{t('panel.cleanupEnabledHint')}</Text>
                </Stack>
                <Switch
                  size="sm"
                  checked={policy.cleanupEnabled}
                  onChange={(event) => {
                    const checked = event.currentTarget.checked
                    setSettings({ ...settings, policy: { ...policy, cleanupEnabled: checked } })
                  }}
                />
              </Group>
              <Group justify="space-between" py="xs" style={divider}>
                <Stack gap={0}>
                  <Text size="sm">{t('panel.autoArchiveDays')}</Text>
                  <Text size="xs" c="dimmed">{t('panel.autoArchiveDaysHint')}</Text>
                </Stack>
                <NumberInput
                  size="sm"
                  w={120}
                  min={0}
                  max={36500}
                  clampBehavior="strict"
                  suffix={` ${t('panel.unitDays')}`}
                  value={policy.autoArchiveDays}
                  onChange={(value) => setSettings({ ...settings, policy: { ...policy, autoArchiveDays: Number(value) || 0 } })}
                />
              </Group>
              <Group justify="space-between" py="xs">
                <Stack gap={0}>
                  <Text size="sm">{t('panel.autoDeleteDays')}</Text>
                  <Text size="xs" c="dimmed">{t('panel.autoDeleteDaysHint')}</Text>
                </Stack>
                <NumberInput
                  size="sm"
                  w={120}
                  min={0}
                  max={36500}
                  clampBehavior="strict"
                  suffix={` ${t('panel.unitDays')}`}
                  value={policy.autoDeleteDays}
                  onChange={(value) => setSettings({ ...settings, policy: { ...policy, autoDeleteDays: Number(value) || 0 } })}
                />
              </Group>
            </Stack>

            {policy.autoDeleteDays === 0 ? (
              <Alert color="orange" variant="light" mt="xs" p="xs">
                <Text size="xs">{t('panel.deleteAtArchive')}</Text>
              </Alert>
            ) : null}

            <Group mt="md" gap="xs" wrap="wrap">
              <Button size="compact-sm" disabled={busy} onClick={savePolicy}>{t('panel.save')}</Button>
              <Button variant="default" size="compact-sm" disabled={busy || api === undefined} onClick={() => runCleanup(true)}>
                {t('panel.preview')}
              </Button>
              <Button variant="default" size="compact-sm" disabled={busy || api === undefined} onClick={() => runCleanup(false)}>
                {t('panel.runCleanup')}
              </Button>
              <Text size="xs" c="dimmed">
                {settings.lastRun ? fill(t('panel.lastRun'), { time: formatTime(settings.lastRun.at) }) : t('panel.never')}
              </Text>
            </Group>

            {notice === null ? null : (
              <Alert
                mt="sm"
                p="xs"
                variant="light"
                color={notice.kind === 'error' ? 'red' : 'teal'}
                withCloseButton
                onClose={() => setNotice(null)}
                closeButtonLabel={t('panel.dismiss')}
              >
                <Text size="xs">{notice.text}</Text>
              </Alert>
            )}
          </Card>
        )}
      </Stack>

      <Modal
        opened={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title={t('panel.deleteTitle')}
        centered
        size="sm"
        zIndex={2100}
      >
        <Text size="sm">{fill(t('panel.deleteConfirm'), { count: pendingDelete ? pendingDelete.length : 0 })}</Text>
        <Group justify="flex-end" mt="md" gap="xs">
          <Button variant="default" size="compact-sm" onClick={() => setPendingDelete(null)}>{t('panel.cancel')}</Button>
          <Button color="red" size="compact-sm" loading={busy} onClick={() => remove(pendingDelete ?? [])}>
            {t('panel.delete')}
          </Button>
        </Group>
      </Modal>
      </DatesProvider>
    </MantineProvider>
  )
}

/**
 * Client half body. Every contribution goes through `ctx.slots.inject`, whose
 * callback re-runs per declaration lifetime, so the section follows the
 * Settings shell mounting instead of leaking a stale entry.
 *
 * `remote.archiveManager` must NOT be listed in inject: the namespace only
 * exists after the `$mount` below has run.
 */
const inject = ['slots', 'locale', 'remote']

function apply(ctx) {
  localeService = ctx.locale

  ctx.effect(() => {
    const offZh = ctx.locale.register(NS, 'zh', zh)
    const offEn = ctx.locale.register(NS, 'en', en)
    return () => {
      offZh()
      offEn()
    }
  }, '@gsnowdrift/dsh-archive-manager: dictionaries')

  let mountError = null
  ctx.effect(() => {
    let unmount
    let disposed = false
    ctx.remote.$mount({ package: '@gsnowdrift/dsh-archive-manager', descriptors: remoteDescriptors })
      .then((off) => {
        if (disposed) {
          off()
          return
        }
        unmount = off
        mountError = null
      })
      .catch((error) => {
        mountError = String(error && error.message ? error.message : error)
        ctx.logger.error('archive-manager: mounting the Remote namespace failed', error)
      })
    return () => {
      disposed = true
      if (unmount !== undefined) unmount()
    }
  }, '@gsnowdrift/dsh-archive-manager: remote namespace')

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'archive-manager',
    order: 60,
    label: () => t('nav'),
    locale: NS,
    inject: () => ({
      getApi: () => ctx.get(REMOTE_SERVICE_KEY),
      getMountError: () => mountError,
      t,
    }),
  }, ArchiveManagerPage))
}

export { apply, inject, ArchiveManagerPage }
