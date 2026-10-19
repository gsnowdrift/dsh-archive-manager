window.__ModuleLoader__.load({
  id: '@gsnowdrift/dsh-archive-manager',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    const React = require('react')
    const h = React.createElement

    /**
     * Dictionaries for this plugin's own locale namespace. Registered on
     * `ctx.locale` in apply() (docs: "本地化：用声明的 locale namespace，不要硬编码文案").
     */
    const NS = 'archiveManager'

    const zh = {
      'nav': '归档会话',
      'panel.label': '归档会话',
      'panel.empty': '暂无归档会话',
      'panel.apiMissing': '插件数据通道未就绪（Remote 命名空间挂载失败）。',
      'panel.refresh': '刷新',
      'panel.search': '搜索标题 / 工作区 / ID',
      'panel.date.all': '全部日期',
      'panel.workspace.all': '全部工作区',
      'panel.subagents': '包含子代理会话',
      'panel.selectAll': '全选',
      'panel.selected': '已选 {count} 项',
      'panel.unarchive': '取消归档',
      'panel.unarchiveMany': '取消归档 {count} 项',
      'panel.delete': '删除',
      'panel.deleteMany': '删除 {count} 项',
      'panel.deleteConfirm': '将永久删除选中的 {count} 个会话，磁盘上的会话记录会被移除，无法恢复。确定继续？',
      'panel.deleted': '已删除 {count} 项，失败 {failed} 项',
      'panel.colTitle': '会话',
      'panel.colWorkspace': '工作区',
      'panel.colActivity': '最近活动',
      'panel.colReason': '来源',
      'panel.selectRow': '选择此行',
      'panel.colAction': '操作',
      'panel.reason.manual': '手动',
      'panel.reason.auto': '自动',
      'panel.running': '运行中',
      'panel.page': '第 {page} / {pages} 页',
      'panel.prev': '上一页',
      'panel.next': '下一页',
      'panel.total': '共 {count} 条',
      'panel.settings': '自动清理',
      'panel.cleanupEnabled': '启用定时清理',
      'panel.cleanupEnabledHint': '按下面的规则在后台自动归档与还原会话',
      'panel.autoArchiveDays': '自动归档闲置会话',
      'panel.autoArchiveDaysHint': '闲置超过设定天数后归档，0 关闭',
      'panel.retentionDays': '保留期限',
      'panel.retentionDaysHint': '归档超过设定天数后自动还原，0 关闭',
      'panel.capCount': '归档数量上限',
      'panel.capCountHint': '超出后自动还原最旧的会话，0 关闭',
      'panel.includeSubagents': '子代理会话参与清理',
      'panel.includeSubagentsHint': '关闭时只处理主会话',
      'panel.unitDays': '天',
      'panel.unitCount': '条',
      'panel.preview': '预览计划',
      'panel.runCleanup': '立即执行',
      'panel.save': '保存设置',
      'panel.saved': '已保存',
      'panel.planned': '计划 {count} 项操作',
      'panel.plannedDetail': '将归档 {archive} 项、还原 {unarchive} 项',
      'panel.applied': '已执行 {count} 项，失败 {failed} 项',
      'panel.lastRun': '上次执行：{time}',
      'panel.never': '尚未执行',
      'panel.dismiss': '关闭提示',
      'panel.excludedRunning': '跳过运行中会话 {count} 个',
      'panel.dryRun': '仅预览，未执行',
      'panel.moved': '已取消归档 {count} 项',
      'panel.failed': '{count} 项失败',
      'toast.unarchived': '已取消归档 {count} 个会话',
      'toast.cleanup': '自动清理完成：执行 {count} 项',
    }

    const en = {
      'nav': 'Archived sessions',
      'panel.label': 'Archived sessions',
      'panel.empty': 'No archived sessions',
      'panel.apiMissing': 'The plugin data channel is unavailable (the Remote namespace failed to mount).',
      'panel.refresh': 'Refresh',
      'panel.search': 'Search title / workspace / id',
      'panel.date.all': 'All dates',
      'panel.workspace.all': 'All workspaces',
      'panel.subagents': 'Include subagent sessions',
      'panel.selectAll': 'Select all',
      'panel.selected': '{count} selected',
      'panel.unarchive': 'Unarchive',
      'panel.unarchiveMany': 'Unarchive {count}',
      'panel.delete': 'Delete',
      'panel.deleteMany': 'Delete {count}',
      'panel.deleteConfirm': 'Permanently delete {count} selected session(s)? Their records are removed from disk and cannot be recovered.',
      'panel.deleted': 'Deleted {count}, {failed} failed',
      'panel.colTitle': 'Session',
      'panel.colWorkspace': 'Workspace',
      'panel.colActivity': 'Last activity',
      'panel.colReason': 'Source',
      'panel.selectRow': 'Select this row',
      'panel.colAction': 'Action',
      'panel.reason.manual': 'manual',
      'panel.reason.auto': 'automatic',
      'panel.running': 'running',
      'panel.page': 'Page {page} of {pages}',
      'panel.prev': 'Previous',
      'panel.next': 'Next',
      'panel.total': '{count} total',
      'panel.settings': 'Automatic cleanup',
      'panel.cleanupEnabled': 'Enable scheduled cleanup',
      'panel.cleanupEnabledHint': 'Archive and restore sessions in the background by the rules below',
      'panel.autoArchiveDays': 'Auto-archive idle sessions',
      'panel.autoArchiveDaysHint': 'Archive after this many idle days, 0 off',
      'panel.retentionDays': 'Retention',
      'panel.retentionDaysHint': 'Restore archived sessions after this many days, 0 off',
      'panel.capCount': 'Archive cap',
      'panel.capCountHint': 'Restore the oldest sessions beyond this count, 0 off',
      'panel.includeSubagents': 'Include subagent sessions',
      'panel.includeSubagentsHint': 'When off, only main sessions are cleaned',
      'panel.unitDays': 'days',
      'panel.unitCount': 'sessions',
      'panel.preview': 'Preview plan',
      'panel.runCleanup': 'Run now',
      'panel.save': 'Save settings',
      'panel.saved': 'Saved',
      'panel.planned': '{count} planned actions',
      'panel.plannedDetail': 'Archive {archive}, restore {unarchive}',
      'panel.applied': '{count} applied, {failed} failed',
      'panel.lastRun': 'Last run: {time}',
      'panel.never': 'Never ran',
      'panel.dismiss': 'Dismiss',
      'panel.excludedRunning': '{count} running sessions skipped',
      'panel.dryRun': 'Preview only, nothing changed',
      'panel.moved': 'Unarchived {count}',
      'panel.failed': '{count} failed',
      'toast.unarchived': 'Unarchived {count} sessions',
      'toast.cleanup': 'Cleanup finished: {count} actions',
    }

    // The settings shell already pads its body (`.options`, 24px each side) and
    // spends 188px on the nav rail, so this section must not add its own
    // horizontal padding or the table would be pushed past the panel edge.
    const styles = {
      root: { display: 'flex', flexDirection: 'column', gap: '14px', padding: '4px 0 24px', boxSizing: 'border-box', minWidth: 0, color: 'var(--dsw-alias-label-primary, inherit)' },
      // Last-resort guard for very narrow windows; the column widths below are
      // chosen so the table does not need it in a normal panel.
      tableScroll: { width: '100%', overflowX: 'auto' },
      header: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
      title: { fontSize: '17px', fontWeight: 600, marginRight: 'auto' },
      card: { border: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.25))', borderRadius: '10px', padding: '14px' },
      toolbar: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
      input: { padding: '5px 8px', borderRadius: '6px', border: '1px solid var(--dsw-alias-border-l4, rgba(127,127,127,.35))', background: 'transparent', color: 'inherit', fontSize: '13px' },
      select: { padding: '5px 6px', borderRadius: '6px', border: '1px solid var(--dsw-alias-border-l4, rgba(127,127,127,.35))', background: 'transparent', color: 'inherit', fontSize: '13px' },
      button: { padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--dsw-alias-border-l4, rgba(127,127,127,.35))', background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: '13px' },
      primary: { padding: '5px 12px', borderRadius: '6px', border: '1px solid var(--dsw-alias-button-primary-fill, #4f7cff)', background: 'var(--dsw-alias-button-primary-fill, #4f7cff)', color: 'var(--dsw-alias-label-primary-foreground, #fff)', cursor: 'pointer', fontSize: '13px' },
      table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px', tableLayout: 'fixed' },
      th: { textAlign: 'left', padding: '7px 6px', borderBottom: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.25))', fontWeight: 500, opacity: 0.8, whiteSpace: 'nowrap' },
      td: { padding: '7px 6px', borderBottom: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.14))', verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
      ellipsis: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 },
      actions: { display: 'flex', gap: '6px', justifyContent: 'flex-end' },
      // Icon-sized controls: the action column is the tightest one and a text
      // button would not fit next to two of them at this width.
      iconButton: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '24px', padding: 0, borderRadius: '6px', border: '1px solid var(--dsw-alias-border-l4, rgba(127,127,127,.35))', background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: '13px', lineHeight: 1 },
      iconDanger: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '24px', padding: 0, borderRadius: '6px', border: '1px solid rgba(229,72,77,.5)', background: 'transparent', color: '#e5484d', cursor: 'pointer', fontSize: '13px', lineHeight: 1 },
      danger: { padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(229,72,77,.5)', background: 'transparent', color: '#e5484d', cursor: 'pointer', fontSize: '13px' },
      muted: { opacity: 0.6, fontSize: '12px' },
      row: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
      // Settings block: mirrors the host's own settings rows (13px label over a
      // 12px secondary hint, control right-aligned) so this section reads as
      // part of the dialog instead of a bolt-on with oversized text.
      sectionTitle: { fontSize: '14px', fontWeight: 600, lineHeight: '20px', marginBottom: '4px' },
      settingRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', padding: '11px 0', borderBottom: '0.5px solid var(--dsw-alias-border-l2, rgba(127,127,127,.2))' },
      settingText: { display: 'flex', flexDirection: 'column', minWidth: 0 },
      settingLabel: { fontSize: '13px', lineHeight: '20px' },
      settingHint: { fontSize: '12px', lineHeight: '18px', color: 'var(--dsw-alias-label-secondary, currentColor)', opacity: 0.85 },
      numberWrap: { display: 'flex', alignItems: 'center', gap: '6px', flex: 'none' },
      number: { width: '64px', padding: '4px 8px', textAlign: 'right', fontSize: '13px' },
      unit: { fontSize: '12px', opacity: 0.7, minWidth: '26px' },
      // Action feedback: sticky at the foot of the settings card so it stays
      // readable whatever part of the page the user scrolled to when clicking.
      notice: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.25))', background: 'var(--dsw-alias-bg-layer-2, transparent)', fontSize: '12px', lineHeight: '18px', position: 'sticky', bottom: 0, zIndex: 1 },
      noticeText: { flex: '1 1 auto', minWidth: 0, overflowWrap: 'anywhere' },
      noticeOk: { color: 'var(--dsw-alias-label-secondary, inherit)' },
      noticeError: { color: 'var(--dsw-alias-state-error-primary, #e5484d)' },
      noticeClose: { flex: 'none', padding: '0 4px', border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: '13px', lineHeight: 1, opacity: 0.7 },
      badge: { fontSize: '11px', borderRadius: '999px', padding: '1px 7px', border: '1px solid currentColor', opacity: 0.75 },
      error: { color: '#e5484d', fontSize: '12px' },
    }


    function pad(value) {
      return String(value).padStart(2, '0')
    }

    function formatTime(time) {
      if (typeof time !== 'number' || !Number.isFinite(time)) return ''
      const date = new Date(time)
      return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes())
    }

    function localDay(time) {
      const date = new Date(time)
      return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
    }

    /** Clock only: the day already leads the activity cell, so repeating it wastes the column. */
    function formatClock(time) {
      if (typeof time !== 'number' || !Number.isFinite(time)) return ''
      const date = new Date(time)
      return pad(date.getHours()) + ':' + pad(date.getMinutes())
    }

    function format(template, params) {
      return String(template).replace(/\{(\w+)\}/g, (all, key) => params[key] === undefined ? all : String(params[key]))
    }

    /**
     * The archive management page: rendered as the Settings dialog's
     * "归档会话" section. The Remote namespace arrives through the
     * registration's inject face; the component itself only needs React.
     */
    function ArchiveManagerPage(props) {
      // The Remote namespace is mounted by this same client half, asynchronously.
      // Resolving it per call (never once at registration) keeps the page
      // renderable before `remote.archiveManager` exists.
      const getApi = typeof props.getApi === 'function' ? props.getApi : () => undefined
      // A failed `$mount` used to be invisible: the page rendered, `getApi()`
      // stayed undefined forever, and the user saw an empty list. Surface the
      // reason instead of spinning silently.
      const getMountError = typeof props.getMountError === 'function' ? props.getMountError : () => null
      const t = typeof props.t === 'function' ? props.t : (key) => key
      const [state, setState] = React.useState({ loading: true, error: null, data: null })
      const [filter, setFilter] = React.useState({ date: '', workspaceId: '', search: '', includeSubagents: false })
      const [page, setPage] = React.useState(1)
      const [selected, setSelected] = React.useState(() => new Set())
      const [settings, setSettings] = React.useState(null)
      const [notice, setNotice] = React.useState(null)
      const [busy, setBusy] = React.useState(false)
      const [api, setApi] = React.useState(() => getApi())
      const [apiMissing, setApiMissing] = React.useState(false)

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

      /**
       * Reconcile the controls with what the host actually returned before
       * showing it.
       *
       * Two things invalidate the current view without the user touching a
       * control. Deleting or unarchiving the last session of the selected day
       * removes that day's bucket, and removing rows can leave `page` past the
       * new last page. A <select> whose value no longer exists silently
       * displays its first option, so the dropdown read "all dates" while the
       * request still carried the vanished day: the table came back empty with
       * nothing on screen to explain why. Resetting the filter re-runs `load`
       * through its dependency, so this converges in one extra round trip.
       */
      const accept = React.useCallback((value) => {
        setState({ loading: false, error: null, data: value })
        const days = Array.isArray(value.dates) ? value.dates : []
        if (filter.date !== '' && !days.some((bucket) => bucket.date === filter.date)) {
          setFilter((current) => ({ ...current, date: '' }))
        }
        // The host clamps an out-of-range page; follow it instead of asking for
        // a page that no longer exists on every subsequent request.
        if (typeof value.page === 'number' && value.page !== page) setPage(value.page)
      }, [filter.date, page])

      const load = React.useCallback(async () => {
        if (api === undefined) return
        setState((current) => ({ ...current, loading: true, error: null }))
        try {
          const result = await api.list({ filter, page, pageSize: 25 })
          if (!result.ok) throw new Error(result.error?.message || String(result.error))
          accept(result.value)
        } catch (error) {
          setState({ loading: false, error: String(error && error.message ? error.message : error), data: null })
        }
      }, [api, filter, page, accept])

      React.useEffect(() => { load() }, [load])

      /**
       * Repaint while the host is still folding log facts.
       *
       * The fold cannot happen on the request path (a cold pass over this
       * machine's archive measured ~17s), so `list()` answers immediately with
       * `pending > 0` and rows that have no title yet. Without this effect the
       * page would sit on those ids until the user navigated away and back.
       *
       * It stops on the first listing that reports `pending === 0`, and also
       * gives up after a bounded number of attempts so a permanently unreadable
       * session cannot poll forever. `factsGeneration` is not needed here: a
       * shrinking `pending` already proves progress, and a stall is bounded by
       * the attempt count.
       */
      const pendingCount = state.data && typeof state.data.pending === 'number' ? state.data.pending : 0
      React.useEffect(() => {
        if (api === undefined || pendingCount === 0) return undefined
        let attempts = 0
        const timer = setInterval(async () => {
          attempts += 1
          if (attempts > 40) {
            clearInterval(timer)
            return
          }
          const result = await api.list({ filter, page, pageSize: 25 })
          // Do not flip the table into "loading" for a background refresh: the
          // rows already on screen stay readable while this lands.
          if (result.ok) accept(result.value)
        }, 500)
        return () => clearInterval(timer)
      }, [api, filter, page, pendingCount === 0, accept])

      const loadSettings = React.useCallback(async () => {
        if (api === undefined) return
        const result = await api.getSettings()
        if (result.ok) setSettings(result.value)
      }, [api])

      React.useEffect(() => { loadSettings() }, [loadSettings])

      const rows = state.data ? state.data.items : []
      const dates = state.data ? state.data.dates : []
      const workspaces = state.data ? state.data.workspaces : {}
      const pageCount = state.data ? state.data.pageCount : 1

      const toggle = (id) => {
        setSelected((current) => {
          const next = new Set(current)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return next
        })
      }

      /**
       * Report the outcome of an action where the action happened.
       *
       * The settings block sits at the bottom of a scrolling page, so a status
       * line under the title scrolls out of view the moment the user clicks
       * 保存 or 预览计划 — the buttons appear to do nothing. The notice therefore
       * lives at the foot of the settings card, is sticky so it survives the
       * scroll, and carries an explicit close button: a success message that
       * vanishes on a timer reads as a flicker, one that stays reads as stale.
       */
      const notify = (next) => setNotice({ ...next, at: Date.now(), id: (notice?.id ?? 0) + 1 })
      const dismissNotice = () => setNotice(null)
      const noticeRevision = notice === null ? 0 : notice.id
      React.useEffect(() => {
        if (notice === null || notice.kind === 'error') return undefined
        const timer = setInterval(() => {
          if (Date.now() - notice.at >= 6000) setNotice(null)
        }, 1000)
        return () => clearInterval(timer)
      }, [noticeRevision])

      const unarchive = async (ids) => {
        if (busy || ids.length === 0) return
        setBusy(true)
        try {
          const result = await api.unarchive(ids)
          if (!result.ok) throw new Error(result.error?.message || String(result.error))
          notify({ kind: 'ok', text: format(t('panel.moved'), { count: result.value.moved }) })
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
       * Permanently delete archived sessions.
       *
       * Destructive and irreversible, so it always asks first; a running
       * session is refused by the Host and reported back per session.
       */
      const remove = async (ids) => {
        if (busy || ids.length === 0) return
        const question = format(t('panel.deleteConfirm'), { count: ids.length })
        if (typeof window !== 'undefined' && typeof window.confirm === 'function' && !window.confirm(question)) return
        setBusy(true)
        try {
          const result = await api.deleteSessions(ids)
          if (!result.ok) throw new Error(result.error?.message || String(result.error))
          const value = result.value
          const failures = Array.isArray(value.failed) ? value.failed : []
          notify({
            kind: failures.length > 0 ? 'error' : 'ok',
            text: format(t('panel.deleted'), { count: value.deleted, failed: failures.length })
              + (failures.length > 0 ? ' — ' + failures.map((entry) => entry.id + ': ' + entry.message).join('; ') : ''),
          })
          setSelected(new Set())
          setPage(1)
          await load()
        } catch (error) {
          notify({ kind: 'error', text: String(error && error.message ? error.message : error) })
        } finally {
          setBusy(false)
        }
      }

      const savePolicy = async () => {
        if (settings === null) return
        const result = await api.setPolicy(settings.policy)
        if (result.ok) {
          notify({ kind: 'ok', text: t('panel.saved') })
          setSettings({ ...settings, policy: result.value })
        } else {
          notify({ kind: 'error', text: result.error.message })
        }
      }

      const runCleanup = async (dryRun) => {
        if (busy) return
        setBusy(true)
        try {
          const result = await api.runCleanup({ dryRun })
          if (!result.ok) throw new Error(result.error?.message || String(result.error))
          const report = result.value
          if (dryRun) {
            // A bare count hides what the policy would actually do, and the
            // idle rule looks inert unless it says how many sessions it would
            // archive versus restore.
            const actions = report.actions ?? []
            const archiving = actions.filter((action) => action.kind === 'archive').length
            const restoring = actions.length - archiving
            const excluded = (report.excluded ?? []).length
            const parts = [format(t('panel.plannedDetail'), { archive: archiving, unarchive: restoring })]
            if (excluded > 0) parts.push(format(t('panel.excludedRunning'), { count: excluded }))
            parts.push(t('panel.dryRun'))
            notify({ kind: 'ok', text: parts.join(' · ') })
          } else {
            const failed = report.failed ? report.failed.length : 0
            notify({
              kind: failed > 0 ? 'error' : 'ok',
              text: format(t('panel.applied'), { count: report.applied, failed }),
            })
            await load()
            await loadSettings()
          }
        } catch (error) {
          notify({ kind: 'error', text: String(error && error.message ? error.message : error) })
        } finally {
          setBusy(false)
        }
      }

      /**
       * One line of feedback for an action, dismissible, with an error that
       * stays until read. Rendered inside the settings card next to the buttons
       * that produce it — a status line under the page title is off-screen
       * exactly when it matters.
       */
      const noticeRow = notice === null ? null : h('div', {
        style: styles.notice,
        role: notice.kind === 'error' ? 'alert' : 'status',
        'aria-live': notice.kind === 'error' ? 'assertive' : 'polite',
      },
        h('span', { style: { ...styles.noticeText, ...(notice.kind === 'error' ? styles.noticeError : styles.noticeOk) } }, notice.text),
        h('button', { type: 'button', style: styles.noticeClose, title: t('panel.dismiss'), 'aria-label': t('panel.dismiss'), onClick: dismissNotice }, '✕'))

      const policy = settings ? settings.policy : null

      return h('div', { style: styles.root },
        h('div', { style: styles.header },
          h('span', { style: styles.title }, t('panel.label')),
          h('span', { style: styles.muted }, state.data ? format(t('panel.total'), { count: state.data.total }) : ''),
          h('button', { type: 'button', style: styles.button, onClick: load }, t('panel.refresh'))),
        state.error === null ? null : h('div', { style: styles.error }, state.error),
        // Without a policy there is no settings card to host the notice, so it
        // falls back to the page head instead of disappearing.
        noticeRow !== null && policy === null ? noticeRow : null,
        apiMissing
          ? h('div', { style: styles.error },
            h('div', null, t('panel.apiMissing')),
            getMountError() === null ? null : h('div', { style: { marginTop: '4px', opacity: 0.85 } }, getMountError()))
          : null,
        h('div', { style: styles.card },
          h('div', { style: styles.toolbar },
            h('input', {
              style: styles.input,
              placeholder: t('panel.search'),
              value: filter.search,
              onChange: (event) => {
                const value = event.target.value
                setFilter((current) => ({ ...current, search: value }))
                setPage(1)
              },
            }),
            h('select', {
              style: styles.select,
              value: filter.date,
              onChange: (event) => {
                const value = event.target.value
                setFilter((current) => ({ ...current, date: value }))
                setPage(1)
              },
            },
            h('option', { value: '' }, t('panel.date.all')),
            dates.map((bucket) => h('option', { key: bucket.date, value: bucket.date }, bucket.date + ' (' + bucket.count + ')'))),
            h('select', {
              style: styles.select,
              value: filter.workspaceId,
              onChange: (event) => {
                const value = event.target.value
                setFilter((current) => ({ ...current, workspaceId: value }))
                setPage(1)
              },
            },
            h('option', { value: '' }, t('panel.workspace.all')),
            Object.keys(workspaces).map((id) => h('option', { key: id, value: id }, workspaces[id]))),
            h('label', { style: styles.muted },
              h('input', {
                type: 'checkbox',
                checked: filter.includeSubagents,
                onChange: (event) => {
                  const checked = event.target.checked
                  setFilter((current) => ({ ...current, includeSubagents: checked }))
                  setPage(1)
                },
              }),
              ' ' + t('panel.subagents')),
            selected.size > 0
              ? h('div', { style: styles.actions },
                h('button', { type: 'button', style: styles.primary, disabled: busy, onClick: () => unarchive([...selected]) },
                  format(t('panel.unarchiveMany'), { count: selected.size })),
                h('button', { type: 'button', style: styles.danger, disabled: busy, onClick: () => remove([...selected]) },
                  format(t('panel.deleteMany'), { count: selected.size })))
              : null),
          rows.length === 0
            ? h('div', { style: { ...styles.muted, padding: '18px 0', textAlign: 'center' } }, state.loading ? '…' : t('panel.empty'))
            : h('div', { style: styles.tableScroll },
              h('table', { style: styles.table },
                h('colgroup', null,
                  h('col', { style: { width: '28px' } }),
                  h('col', null),
                  h('col', { style: { width: '88px' } }),
                  h('col', { style: { width: '96px' } }),
                  h('col', { style: { width: '66px' } })),
                h('thead', null, h('tr', null,
                  h('th', { style: styles.th },
                    h('input', {
                      type: 'checkbox',
                      checked: rows.length > 0 && rows.every((row) => selected.has(row.id)),
                      onChange: (event) => {
                        if (event.target.checked) setSelected(new Set(rows.map((row) => row.id)))
                        else setSelected(new Set())
                      },
                    })),
                  h('th', { style: styles.th }, t('panel.colTitle')),
                  h('th', { style: styles.th }, t('panel.colWorkspace')),
                  h('th', { style: styles.th }, t('panel.colActivity')),
                  h('th', { style: { ...styles.th, textAlign: 'right' } }, t('panel.colAction')))),
                h('tbody', null, rows.map((row) => h('tr', { key: row.id },
                  h('td', { style: styles.td },
                    h('input', {
                      type: 'checkbox',
                      'aria-label': t('panel.selectRow'),
                      checked: selected.has(row.id),
                      onChange: () => toggle(row.id),
                    })),
                  h('td', { style: { ...styles.td, whiteSpace: 'normal' } },
                    // The title is what identifies a conversation, so it owns the
                    // flexible column; an untitled session shows a de-emphasised
                    // id instead of competing with the titles.
                    h('div', { style: { ...styles.ellipsis, fontSize: '13px' }, title: row.title || row.id },
                      row.title || h('span', { style: styles.muted }, row.id)),
                    // Reason and running state ride along as metadata: they are
                    // one short word each and do not deserve columns of their own.
                    h('div', {
                      style: { ...styles.muted, ...styles.ellipsis },
                      title: [row.cwd || row.id, t('panel.reason.' + row.reason), row.running ? t('panel.running') : ''].filter((part) => part !== '').join(' · '),
                    },
                      [row.cwd || row.id, t('panel.reason.' + row.reason), row.running ? t('panel.running') : ''].filter((part) => part !== '').join(' · '))),
                  h('td', { style: { ...styles.td, ...styles.ellipsis }, title: workspaces[row.workspaceId] || row.workspaceId },
                    row.workspaceId === '' ? '—' : (workspaces[row.workspaceId] || row.workspaceId)),
                  h('td', { style: { ...styles.td, whiteSpace: 'normal' }, title: formatTime(row.activityAt) },
                    h('div', { style: styles.ellipsis }, localDay(row.activityAt)),
                    h('div', { style: { ...styles.muted, ...styles.ellipsis }, title: formatTime(row.activityAt) }, formatClock(row.activityAt))),
                  h('td', { style: { ...styles.td, paddingLeft: 0 } },
                    h('div', { style: styles.actions },
                      h('button', { type: 'button', style: styles.iconButton, disabled: busy, title: t('panel.unarchive'), onClick: () => unarchive([row.id]) }, '↩'),
                      h('button', { type: 'button', style: styles.iconDanger, disabled: busy, title: t('panel.delete'), onClick: () => remove([row.id]) }, '✕')))))))),
          h('div', { style: { ...styles.row, marginTop: '10px' } },
            h('button', { type: 'button', style: styles.button, disabled: page <= 1, onClick: () => setPage(page - 1) }, t('panel.prev')),
            h('span', { style: styles.muted }, format(t('panel.page'), { page: page, pages: pageCount })),
            h('button', { type: 'button', style: styles.button, disabled: page >= pageCount, onClick: () => setPage(page + 1) }, t('panel.next')))),
        policy === null ? null : h('div', { style: styles.card },
          h('div', { style: styles.sectionTitle }, t('panel.settings')),
          h('div', { style: styles.settingRow },
            h('span', { style: styles.settingText },
              h('span', { style: styles.settingLabel }, t('panel.cleanupEnabled')),
              h('span', { style: styles.settingHint }, t('panel.cleanupEnabledHint'))),
            h('input', {
              type: 'checkbox',
              checked: policy.cleanupEnabled,
              onChange: (event) => {
                const checked = event.target.checked
                setSettings({ ...settings, policy: { ...policy, cleanupEnabled: checked } })
              },
            })),
          [
            ['autoArchiveDays', 'panel.autoArchiveDays', 'panel.autoArchiveDaysHint', 'panel.unitDays'],
            ['retentionDays', 'panel.retentionDays', 'panel.retentionDaysHint', 'panel.unitDays'],
            ['capCount', 'panel.capCount', 'panel.capCountHint', 'panel.unitCount'],
          ].map(([key, label, hint, unit]) => h('label', { key, style: styles.settingRow },
            h('span', { style: styles.settingText },
              h('span', { style: styles.settingLabel }, t(label)),
              h('span', { style: styles.settingHint }, t(hint))),
            // The unit lives outside the box: at 64px a suffix inside the input
            // is clipped on every value that is not a single digit.
            h('span', { style: styles.numberWrap },
              h('input', {
                type: 'number',
                min: 0,
                style: { ...styles.input, ...styles.number },
                value: policy[key],
                onChange: (event) => {
                  const value = Number(event.target.value)
                  setSettings({ ...settings, policy: { ...policy, [key]: Number.isFinite(value) ? value : 0 } })
                },
              }),
              h('span', { style: styles.unit }, t(unit))))),
          h('label', { style: styles.settingRow },
            h('span', { style: styles.settingText },
              h('span', { style: styles.settingLabel }, t('panel.includeSubagents')),
              h('span', { style: styles.settingHint }, t('panel.includeSubagentsHint'))),
            h('input', {
              type: 'checkbox',
              checked: policy.includeSubagents,
              onChange: (event) => {
                const checked = event.target.checked
                setSettings({ ...settings, policy: { ...policy, includeSubagents: checked } })
              },
            })),
          h('div', { style: { ...styles.row, marginTop: '12px' } },
            h('button', { type: 'button', style: styles.primary, onClick: savePolicy }, t('panel.save')),
            h('button', { type: 'button', style: styles.button, disabled: busy, onClick: () => runCleanup(true) }, t('panel.preview')),
            h('button', { type: 'button', style: styles.button, disabled: busy, onClick: () => runCleanup(false) }, t('panel.runCleanup')),
            h('span', { style: styles.muted }, settings.lastRun ? format(t('panel.lastRun'), { time: formatTime(settings.lastRun.at) }) : t('panel.never'))),
          // Same node as the page-level notice: only one of the two renders,
          // and it sits under the buttons that produced it.
          noticeRow))
    }



    /**
     * The locale service is attached at apply time and read through this
     * closure, so slot components never receive ctx (docs: "服务不暴露").
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
        text = undefined
      }
      if (text === undefined) {
        const dictionary = String(activeLocale()).toLowerCase().startsWith('zh') ? zh : en
        text = dictionary[key] === undefined ? key : dictionary[key]
      }
      if (params !== undefined) text = format(text, params)
      return text
    }

    /** Surface a failure inside the section instead of throwing out of render. */
    function WithErrorStrip(Inner) {
      return function ArchiveManagerBoundary(props) {
        const [failure, setFailure] = React.useState(null)
        React.useEffect(() => {
          const onError = (event) => setFailure(String((event && event.message) || event))
          if (typeof window === 'undefined') return undefined
          window.addEventListener('error', onError)
          return () => window.removeEventListener('error', onError)
        }, [])
        if (failure !== null) return h('div', { style: styles.error }, failure)
        return h(Inner, props)
      }
    }

    /**
     * Remote namespace this plugin owns. `$mount` installs it as its own
     * Cordis service named `remote.<namespace>` — NOT as a property of the
     * `remote` service object — so the page must read it through `ctx.get()`:
     * `ctx.remote.archiveManager` is always `undefined`.
     */
    const REMOTE_NS = 'archiveManager'
    const REMOTE_SERVICE_KEY = `remote.${REMOTE_NS}`

    /**
     * One declared wire parameter.
     *
     * Two registries validate a contribution, and both refuse a bare
     * `{mode:'strict'}`: the Gateway's `requireStrictCodec` only checks the
     * mode, then `typert.remotes.register()` runs `validateInvocation`, whose
     * `validateCodec` demands a non-empty `typeSymbol` and a `create()`
     * factory. The schema is never used — decoding happens on the Host — so a
     * permissive pass-through stands in for the generated schema.
     *
     * @param wire - the named wire field the Host signature declares.
     */
    function codec(typeSymbol) {
      return { mode: 'strict', typeSymbol, create: () => passthrough }
    }

    const passthrough = { parse: (value) => value }

    function param(wire) {
      return { name: wire, wire, source: 'json', codec: codec(`@gsnowdrift/dsh-archive-manager#${wire}`) }
    }

    /**
     * Services this client half needs before activation.
     *
     * Only `slots`, `locale` and `remote` are injected. The archive data
     * arrives through the `archiveManager` Remote namespace, which this half
     * mounts itself from `REMOTE_CONTRIBUTION` — so it must NOT list
     * `remote.archiveManager` here: that service only exists once the mount
     * below has run, and parking the plugin on it would wedge web boot
     * ("pending (waiting for service: remote.archiveManager)").
     */
    const inject = ['slots', 'locale', 'remote']

    /**
     * Remote descriptors for the six Host methods, in the shape
     * `ctx.remote.$mount()` accepts. `createTypertRemoteInfo` needs generated
     * artifacts, so this half declares the descriptors directly: each carries
     * `method`, `namespace`, `invocation: {kind:'direct'}` and strict codecs.
     */
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
      // `{mode:'value'}` cannot cross `validateCodec` either; a strict codec
      // whose decode is the identity leaves the Host's JSON result untouched.
      result: codec(`@gsnowdrift/dsh-archive-manager#archiveManager/${descriptor.method}/result`),
    }))

    /**
     * Client half body.
     *
     * Per dsh-plugin.org 「Slot 组合」: every contribution goes through
     * `ctx.slots.inject`, whose callback re-runs for each declaration
     * lifetime of the owner — the registration therefore follows the Settings
     * shell mounting, collapsing and remounting instead of leaking a stale
     * entry.
     *
     * @param ctx - the client cordis context (slots, locale, remote).
     */
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

      // Mount our own Remote namespace, exactly as cost-meter does. `$mount`
      // installs `remote.archiveManager` synchronously inside this fiber, so
      // the service exists before the first request is issued.
      //
      // The rejection is recorded, not just logged: `mountContribution()`
      // validates every group before installing any, so one rejected endpoint
      // (a name colliding with `RemoteNamespaceService`, say) costs the whole
      // namespace while leaving the slot registration intact — the page would
      // render with no data and no explanation.
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

      // Settings dialog section (docs: owner declares `settings.section` as a
      // list; a row contributes {id, order, label}).
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
      }, WithErrorStrip(ArchiveManagerPage)))
    }

    exports.apply = apply
    exports.inject = inject
    return module.exports
  },
})
