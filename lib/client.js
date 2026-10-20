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
      'panel.emptyFiltered': '当前筛选没有匹配的会话',
      'panel.hostStale': '宿主端尚未重启，日期范围筛选不会生效（当前只识别单个日期）。完全退出 DSH 再打开即可。',
      'panel.apiMissing': '插件数据通道未就绪（Remote 命名空间挂载失败）。',
      'panel.refresh': '刷新',
      'panel.search': '搜索标题 / 工作区 / ID',
      'panel.date.all': '全部日期',
      'panel.workspace.all': '全部工作区',
      'panel.subagents': '包含子代理',
      'panel.date.label': '日期范围',
      'panel.date.prev': '上个月',
      'panel.date.next': '下个月',
      'panel.date.month': '{year} 年 {month} 月',
      'panel.date.range': '{from} → {to}',
      'panel.date.count': '{count} 个会话',
      'panel.date.today': '今天',
      'panel.date.last7': '近 7 天',
      'panel.date.last30': '近 30 天',
      'panel.date.wd.mon': '一',
      'panel.date.wd.tue': '二',
      'panel.date.wd.wed': '三',
      'panel.date.wd.thu': '四',
      'panel.date.wd.fri': '五',
      'panel.date.wd.sat': '六',
      'panel.date.wd.sun': '日',
      'panel.selectAll': '全选',
      'panel.clearSearch': '清除搜索',
      'panel.clearSelection': '取消选择',
      'panel.selected': '已选 {count} 项',
      'panel.unarchive': '取消归档',
      'panel.unarchiveMany': '取消归档 {count} 项',
      'panel.delete': '删除',
      'panel.deleteMany': '删除 {count} 项',
      'panel.deleteConfirm': '将永久删除选中的 {count} 个会话，磁盘上的会话记录会被移除，无法恢复。确定继续？',
      'panel.deleted': '已删除 {count} 项，失败 {failed} 项',
      'panel.repaired': '，另有 {count} 项会话记录已不存在，仅清理了归档列表条目',
      'panel.untitled': '（无标题）',
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
      'panel.emptyFiltered': 'No sessions match these filters',
      'panel.hostStale': 'The host half has not restarted yet, so date ranges do not filter. Fully quit DSH and open it again.',
      'panel.apiMissing': 'The plugin data channel is unavailable (the Remote namespace failed to mount).',
      'panel.refresh': 'Refresh',
      'panel.search': 'Search title / workspace / id',
      'panel.date.all': 'All dates',
      'panel.workspace.all': 'All workspaces',
      'panel.subagents': 'Include subagents',
      'panel.date.label': 'Date range',
      'panel.date.prev': 'Previous month',
      'panel.date.next': 'Next month',
      'panel.date.month': '{month}/{year}',
      'panel.date.range': '{from} → {to}',
      'panel.date.count': '{count} sessions',
      'panel.date.today': 'Today',
      'panel.date.last7': 'Last 7 days',
      'panel.date.last30': 'Last 30 days',
      'panel.date.wd.mon': 'M',
      'panel.date.wd.tue': 'T',
      'panel.date.wd.wed': 'W',
      'panel.date.wd.thu': 'T',
      'panel.date.wd.fri': 'F',
      'panel.date.wd.sat': 'S',
      'panel.date.wd.sun': 'S',
      'panel.selectAll': 'Select all',
      'panel.clearSearch': 'Clear search',
      'panel.clearSelection': 'Clear selection',
      'panel.selected': '{count} selected',
      'panel.unarchive': 'Unarchive',
      'panel.unarchiveMany': 'Unarchive {count}',
      'panel.delete': 'Delete',
      'panel.deleteMany': 'Delete {count}',
      'panel.deleteConfirm': 'Permanently delete {count} selected session(s)? Their records are removed from disk and cannot be recovered.',
      'panel.deleted': 'Deleted {count}, {failed} failed',
      'panel.repaired': '; {count} session record(s) no longer existed and only their archive entry was cleaned up',
      'panel.untitled': 'Untitled',
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
      // The filters are meant to read as one strip, so the row never wraps: the
      // search field is the only element that gives up width, everything else
      // keeps its natural size.
      toolbar: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', marginBottom: '10px' },
      // Shared control frame: every control in the filter row and every button
      // in the panel has the same 30px height and 8px radius, so the row reads
      // as one strip instead of four differently-sized native widgets.
      // flex-basis 0 (not a pixel width) is what lets the field shrink below its
      // natural size instead of pushing the selects onto a second line.
      search: { position: 'relative', display: 'flex', alignItems: 'center', flex: '1 1 0%', minWidth: '88px' },
      searchIcon: { position: 'absolute', left: '9px', top: '50%', width: '14px', height: '14px', marginTop: '-7px', opacity: 0.5, pointerEvents: 'none' },
      input: { height: '30px', width: '100%', padding: '0 8px', borderRadius: '8px', border: '1px solid var(--dsw-alias-border-l4, rgba(127,127,127,.35))', background: 'var(--dsw-alias-bg-layer-2, transparent)', color: 'inherit', fontSize: '13px', boxSizing: 'border-box' },
      // Room on both sides: the magnifier sits inside the left edge, the clear
      // button inside the right one, so the field never looks like plain text.
      searchInput: { paddingLeft: '28px', paddingRight: '28px', minWidth: 0 },
      clearButton: { position: 'absolute', right: '3px', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, border: 0, borderRadius: '6px', background: 'transparent', color: 'inherit', opacity: 0.55, cursor: 'pointer', fontSize: '12px', lineHeight: 1 },
      selectWrap: { position: 'relative', display: 'inline-flex', alignItems: 'center', flex: '0 0 auto' },
      // A picker is sized to its widest realistic option: a workspace name can be
      // long, so it is capped and truncated rather than allowed to steal the row.
      select: { height: '30px', appearance: 'none', WebkitAppearance: 'none', padding: '0 26px 0 10px', borderRadius: '8px', border: '1px solid var(--dsw-alias-border-l4, rgba(127,127,127,.35))', background: 'var(--dsw-alias-bg-layer-2, transparent)', color: 'inherit', fontSize: '13px', cursor: 'pointer', boxSizing: 'border-box', maxWidth: '160px', textOverflow: 'ellipsis' },
      selectCaret: { position: 'absolute', right: '9px', pointerEvents: 'none', fontSize: '10px', lineHeight: 1, opacity: 0.55 },
      // Checkbox as a bordered pill: the raw 13px square looked detached from
      // the inputs beside it and was easy to miss.
      switchPill: { display: 'inline-flex', alignItems: 'center', gap: '6px', height: '30px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--dsw-alias-border-l4, rgba(127,127,127,.35))', background: 'transparent', cursor: 'pointer', fontSize: '13px', userSelect: 'none', boxSizing: 'border-box', whiteSpace: 'nowrap', flex: '0 0 auto' },
      switchPillOn: { borderColor: 'var(--dsw-alias-button-primary-fill, #4f7cff)', color: 'var(--dsw-alias-button-primary-fill, #4f7cff)', background: 'color-mix(in srgb, var(--dsw-alias-button-primary-fill, #4f7cff) 10%, transparent)' },
      // Date range picker. A native <input type="date"> cannot annotate the days
      // it offers, and the whole point here is seeing how many sessions sit on
      // each day before choosing a window.
      dateField: { position: 'relative', display: 'inline-flex', alignItems: 'center', flex: '0 0 auto' },
      // A fixed width, not a max-width: the label changes length as a range is
      // picked, and a button that resizes under the pointer looks like a glitch.
      dateButton: { display: 'inline-flex', alignItems: 'center', gap: '6px', width: '140px', height: '30px', padding: '0 8px', borderRadius: '8px', border: '1px solid var(--dsw-alias-border-l4, rgba(127,127,127,.35))', background: 'var(--dsw-alias-bg-layer-2, transparent)', color: 'inherit', fontSize: '13px', cursor: 'pointer', boxSizing: 'border-box', whiteSpace: 'nowrap' },
      dateIcon: { flex: 'none', width: '14px', height: '14px', opacity: 0.6 },
      dateLabel: { flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis', fontVariantNumeric: 'tabular-nums' },
      // `Canvas`/`CanvasText` are system colours, so the popover follows the
      // host theme instead of flashing white in a dark one.
      calendar: { position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 40, width: '272px', padding: '10px', borderRadius: '10px', border: '1px solid var(--dsw-alias-border-l3, rgba(127,127,127,.2))', background: 'var(--dsw-alias-bg-layer-1, Canvas)', color: 'var(--dsw-alias-label-primary, CanvasText)', boxShadow: '0 12px 32px rgba(0,0,0,.16), 0 2px 8px rgba(0,0,0,.08)', boxSizing: 'border-box', textAlign: 'left' },
      calHead: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' },
      calNav: { width: '26px', height: '26px', flex: 'none', padding: 0, border: 0, borderRadius: '7px', background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: '15px', lineHeight: 1, opacity: 0.7 },
      calMonth: { flex: '1 1 auto', textAlign: 'center', fontSize: '13px', fontWeight: 600, letterSpacing: '0.02em' },
      calWeek: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' },
      calWeekday: { textAlign: 'center', fontSize: '10px', fontWeight: 500, opacity: 0.45, padding: '2px 0', letterSpacing: '0.04em' },
      calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' },
      calCell: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1px', height: '34px', padding: 0, border: '1px solid transparent', borderRadius: '7px', background: 'transparent', color: 'inherit', cursor: 'pointer', font: 'inherit', boxSizing: 'border-box', transition: 'background-color 90ms ease' },
      calCellHover: { background: 'rgba(127,127,127,.12)' },
      calCellIn: { background: 'color-mix(in srgb, var(--dsw-alias-button-primary-fill, #4f7cff) 13%, transparent)' },
      calCellEdge: { borderColor: 'var(--dsw-alias-button-primary-fill, #4f7cff)', background: 'var(--dsw-alias-button-primary-fill, #4f7cff)', color: 'var(--dsw-alias-label-primary-foreground, #fff)' },
      calBlank: { height: '34px' },
      calDay: { fontSize: '12px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
      calDayToday: { color: 'var(--dsw-alias-button-primary-fill, #4f7cff)', fontWeight: 700 },
      calCount: { fontSize: '9px', lineHeight: 1, fontWeight: 600, opacity: 0.7, fontVariantNumeric: 'tabular-nums' },
      calFoot: { display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.18))' },
      calQuick: { height: '25px', padding: '0 9px', borderRadius: '999px', border: '1px solid var(--dsw-alias-border-l4, rgba(127,127,127,.3))', background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: '11px', whiteSpace: 'nowrap', transition: 'background-color 90ms ease' },
      calQuickHover: { background: 'rgba(127,127,127,.12)' },
      // Selection strip: its own row between the filters and the table, tinted
      // with the accent colour. Appearing in the filter row made it look like a
      // fourth filter and it wrapped away from the button it belongs to.
      selectionBar: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', padding: '7px 10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid var(--dsw-alias-button-primary-fill, #4f7cff)', background: 'color-mix(in srgb, var(--dsw-alias-button-primary-fill, #4f7cff) 9%, transparent)' },
      selectionCount: { fontSize: '13px', fontWeight: 600, marginRight: 'auto', whiteSpace: 'nowrap' },
      button: { height: '30px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--dsw-alias-border-l4, rgba(127,127,127,.35))', background: 'var(--dsw-alias-bg-layer-2, transparent)', color: 'inherit', cursor: 'pointer', fontSize: '13px', boxSizing: 'border-box', whiteSpace: 'nowrap' },
      primary: { height: '30px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--dsw-alias-button-primary-fill, #4f7cff)', background: 'var(--dsw-alias-button-primary-fill, #4f7cff)', color: 'var(--dsw-alias-label-primary-foreground, #fff)', cursor: 'pointer', fontSize: '13px', boxSizing: 'border-box', whiteSpace: 'nowrap' },
      dangerSolid: { height: '30px', padding: '0 12px', borderRadius: '8px', border: '1px solid rgba(229,72,77,.9)', background: 'rgba(229,72,77,.12)', color: '#e5484d', cursor: 'pointer', fontSize: '13px', boxSizing: 'border-box', whiteSpace: 'nowrap' },
      muted: { opacity: 0.6, fontSize: '12px' },
      table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px', tableLayout: 'fixed' },
      th: { textAlign: 'left', padding: '7px 6px', borderBottom: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.25))', fontWeight: 500, opacity: 0.8, whiteSpace: 'nowrap' },
      td: { padding: '7px 6px', borderBottom: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.14))', verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
      ellipsis: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 },
      actions: { display: 'flex', gap: '6px', justifyContent: 'flex-end' },
      // Pager: record count on the left, controls on the right, so "where am I"
      // and "how much is here" are answered without reading a centred sentence.
      pager: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' },
      pagerInfo: { fontSize: '12px', opacity: 0.65, whiteSpace: 'nowrap' },
      // Icon-sized controls: the action column is the tightest one and a text
      // button would not fit next to two of them at this width.
      iconButton: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '24px', padding: 0, borderRadius: '6px', border: '1px solid var(--dsw-alias-border-l4, rgba(127,127,127,.35))', background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: '13px', lineHeight: 1 },
      iconDanger: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '24px', padding: 0, borderRadius: '6px', border: '1px solid rgba(229,72,77,.5)', background: 'transparent', color: '#e5484d', cursor: 'pointer', fontSize: '13px', lineHeight: 1 },
      // Shared disabled treatment: a greyed button whose cursor still promises a
      // click reads as broken, not as unavailable.
      disabled: { opacity: 0.45, cursor: 'default' },
      row: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
      // Data rows are click targets now, not just containers for a checkbox: a
      // 13px box is a small target inside a ~44px row, and the row is what the
      // eye actually aims at. The row therefore carries its own hover, selected
      // and keyboard-focus states, so the hit area is legible before the click.
      // A focused table-row is painted by the browser as its default focus ring
      // around the whole row box, which on a collapsed-border table reads as a
      // heavy black frame. The row therefore suppresses the native ring outright
      // and shows focus as a tinted background plus a bar on the first cell.
      dataRow: { cursor: 'pointer', transition: 'background-color 120ms ease', outline: 'none', userSelect: 'none' },
      dataRowHover: { background: 'rgba(127,127,127,.075)' },
      dataRowSelected: { background: 'color-mix(in srgb, var(--dsw-alias-button-primary-fill, #4f7cff) 9%, transparent)' },
      dataRowSelectedHover: { background: 'color-mix(in srgb, var(--dsw-alias-button-primary-fill, #4f7cff) 14%, transparent)' },
      dataRowFocused: { background: 'color-mix(in srgb, var(--dsw-alias-button-primary-fill, #4f7cff) 7%, transparent)' },
      tdFocused: { boxShadow: 'inset 3px 0 0 0 var(--dsw-alias-button-primary-fill, #4f7cff)' },
      // The platform draws native checkboxes in its own accent blue, which does
      // not match the panel's primary colour.
      checkbox: { margin: 0, cursor: 'pointer', accentColor: 'var(--dsw-alias-button-primary-fill, #4f7cff)' },
      // Settings block: mirrors the host's own settings rows (13px label over a
      // 12px secondary hint, control right-aligned) so this section reads as
      // part of the dialog instead of a bolt-on with oversized text.
      sectionTitle: { fontSize: '14px', fontWeight: 600, lineHeight: '20px', marginBottom: '4px' },
      settingRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', padding: '11px 0', borderBottom: '0.5px solid var(--dsw-alias-border-l2, rgba(127,127,127,.2))' },
      settingText: { display: 'flex', flexDirection: 'column', minWidth: 0 },
      settingLabel: { fontSize: '13px', lineHeight: '20px' },
      settingHint: { fontSize: '12px', lineHeight: '18px', color: 'var(--dsw-alias-label-secondary, currentColor)', opacity: 0.85 },
      numberWrap: { display: 'flex', alignItems: 'center', gap: '6px', flex: 'none' },
      number: { width: '64px', padding: '0 8px', textAlign: 'right', fontSize: '13px' },
      unit: { fontSize: '12px', opacity: 0.7, minWidth: '26px' },
      // Action feedback: sticky at the foot of the settings card so it stays
      // readable whatever part of the page the user scrolled to when clicking.
      notice: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.25))', background: 'var(--dsw-alias-bg-layer-2, transparent)', fontSize: '12px', lineHeight: '18px', position: 'sticky', bottom: 0, zIndex: 1 },
      staleBar: { marginBottom: '10px', padding: '7px 10px', borderRadius: '8px', border: '1px solid color-mix(in srgb, #d9a406 45%, transparent)', background: 'color-mix(in srgb, #d9a406 12%, transparent)', color: 'var(--dsw-alias-label-primary, inherit)', fontSize: '12px', lineHeight: '18px' },
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

    /** `YYYY-MM-DD` for a calendar day, in local time. */
    function isoOf(date) {
      return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
    }

    function addDays(iso, delta) {
      const [year, month, day] = iso.split('-').map(Number)
      return isoOf(new Date(year, month - 1, day + delta))
    }

    function todayIso() {
      return isoOf(new Date())
    }

    function shiftMonth(state, delta) {
      const month = state.month + delta
      return {
        year: state.year + Math.floor((month - 1) / 12),
        month: ((month - 1) % 12 + 12) % 12 + 1,
      }
    }

    /**
     * Date range picker: a month grid whose cells carry the number of sessions
     * on that day, so a window can be chosen from what is actually there.
     *
     * Two clicks make a range: the first anchors a day, the second extends to
     * whichever end was clicked; a third click starts over. Hovering previews
     * the extension, because a range without a preview is a guess.
     */
    function DateRangeField(props) {
      const { t, from, to, dates, onChange } = props
      const [open, setOpen] = React.useState(false)
      const [preview, setPreview] = React.useState(null)
      const [hoverQuick, setHoverQuick] = React.useState(null)
      // The first click only plants an anchor; nothing is reported to the page
      // until the second click completes the range. Committing on the first
      // click is what made this feel like a single-day picker.
      const [anchor, setAnchor] = React.useState(null)
      const boxRef = React.useRef(null)
      const counts = React.useMemo(() => {
        const map = new Map()
        for (const bucket of Array.isArray(dates) ? dates : []) {
          if (bucket !== null && typeof bucket.date === 'string') map.set(bucket.date, bucket.count ?? 0)
        }
        return map
      }, [dates])
      // Open on the month the user is looking at: the anchor, else the newest day
      // that has sessions, else today.
      const [cursor, setCursor] = React.useState(() => {
        const anchor = from !== '' ? from : (Array.isArray(dates) && dates.length > 0 ? dates[0].date : todayIso())
        const parts = /^(\d{4})-(\d{2})-\d{2}$/.exec(anchor)
        const now = new Date()
        return parts === null
          ? { year: now.getFullYear(), month: now.getMonth() + 1 }
          : { year: Number(parts[1]), month: Number(parts[2]) }
      })

      // Closing without a completed range discards the anchor, so reopening never
      // resumes a half-finished selection the user has already forgotten.
      const close = () => {
        setOpen(false)
        setAnchor(null)
        setPreview(null)
      }

      React.useEffect(() => {
        if (!open || typeof document === 'undefined') return undefined
        const onPointerDown = (event) => {
          if (boxRef.current !== null && boxRef.current.contains(event.target)) return
          setOpen(false)
          setAnchor(null)
          setPreview(null)
        }
        const onKeyDown = (event) => {
          if (event.key === 'Escape') {
            setOpen(false)
            setAnchor(null)
            setPreview(null)
          }
        }
        document.addEventListener('mousedown', onPointerDown)
        document.addEventListener('keydown', onKeyDown)
        return () => {
          document.removeEventListener('mousedown', onPointerDown)
          document.removeEventListener('keydown', onKeyDown)
        }
      }, [open])

      const pick = (iso) => {
        // First click plants the anchor; the page keeps its old range until the
        // second click says where the range ends.
        if (anchor === null) {
          setAnchor(iso)
          return
        }
        if (iso >= anchor) onChange(anchor, iso)
        else onChange(iso, anchor)
        setAnchor(null)
        setOpen(false)
      }

      const applyQuick = (days) => {
        if (days === 0) {
          onChange('', '')
        } else {
          const end = todayIso()
          onChange(addDays(end, -(days - 1)), end)
        }
        setOpen(false)
        setAnchor(null)
      }

      const quick = (key, label, days) => h('button', {
        key,
        type: 'button',
        style: hoverQuick === key ? { ...styles.calQuick, ...styles.calQuickHover } : styles.calQuick,
        onMouseEnter: () => setHoverQuick(key),
        onMouseLeave: () => setHoverQuick(null),
        onClick: () => applyQuick(days),
      }, label)

      // While an anchor waits for its second click, the hovered day completes a
      // provisional range so the user can see what is about to be selected.
      const pickEnd = preview !== null ? preview : anchor
      const rangeFrom = anchor === null ? from : (pickEnd < anchor ? pickEnd : anchor)
      const rangeTo = anchor === null ? to : (pickEnd > anchor ? pickEnd : anchor)

      const renderCell = (iso) => {
        const count = counts.get(iso) ?? 0
        const isEdge = anchor === null
          ? (iso === from || iso === to)
          : (iso === anchor || iso === preview)
        const inRange = rangeFrom !== '' && rangeTo !== '' && iso >= rangeFrom && iso <= rangeTo
        const style = { ...styles.calCell }
        if (inRange) Object.assign(style, styles.calCellIn)
        if (anchor === null && iso === preview) Object.assign(style, styles.calCellHover)
        if (isEdge) Object.assign(style, styles.calCellEdge)
        return h('button', {
          key: iso,
          type: 'button',
          style,
          title: count > 0 ? format(t('panel.date.count'), { count }) : iso,
          'aria-label': count > 0 ? iso + ' (' + count + ')' : iso,
          'aria-pressed': iso === from || iso === to,
          onClick: () => pick(iso),
          onMouseEnter: () => setPreview(iso),
          onMouseLeave: () => setPreview(null),
        },
          // A day is only "today" when its cell is not already the accent-filled
          // end of the selection, which owns the colour in that case.
          h('span', { style: iso === todayIso() && !isEdge ? { ...styles.calDay, ...styles.calDayToday } : styles.calDay }, String(Number(iso.slice(8, 10)))),
          count > 0 ? h('span', { style: styles.calCount }, String(count)) : null)
      }

      // The button stays short: a range of the same year drops the years, which
      // is what keeps it from crowding the search field.
      const label = from === '' && to === ''
        ? t('panel.date.all')
        : from === to
          ? from
          : from.slice(0, 4) === to.slice(0, 4)
            ? from.slice(5) + ' → ' + to.slice(5)
            : from.slice(2) + ' → ' + to.slice(2)

      const monthStart = new Date(cursor.year, cursor.month - 1, 1)
      // Monday-first grid, so the weekend stays together at the right end.
      const lead = (monthStart.getDay() + 6) % 7
      const length = new Date(cursor.year, cursor.month, 0).getDate()
      const cells = []
      for (let index = 0; index < 42; index += 1) {
        const day = index - lead + 1
        cells.push(day < 1 || day > length
          ? h('span', { key: 'blank-' + index, style: styles.calBlank, 'aria-hidden': 'true' })
          : renderCell(isoOf(new Date(cursor.year, cursor.month - 1, day))))
      }

      return h('div', { style: styles.dateField, ref: boxRef },
        h('button', {
          type: 'button',
          style: styles.dateButton,
          'aria-label': t('panel.date.label'),
          'aria-expanded': open,
          title: label,
          onClick: () => {
            if (open) close()
            else setOpen(true)
          },
        },
        h('svg', {
          style: styles.dateIcon,
          viewBox: '0 0 16 16',
          fill: 'none',
          'aria-hidden': 'true',
        },
        h('rect', { x: 2, y: 3.5, width: 12, height: 10.5, rx: 2, stroke: 'currentColor', strokeWidth: '1.4' }),
        h('path', { d: 'M2 6.5h12', stroke: 'currentColor', strokeWidth: '1.4' }),
        h('path', { d: 'M5.5 2v3M10.5 2v3', stroke: 'currentColor', strokeWidth: '1.4', strokeLinecap: 'round' })),
        h('span', { style: styles.dateLabel }, label),
        h('span', { style: styles.selectCaret, 'aria-hidden': 'true' }, '▾')),
        open
          ? h('div', { style: styles.calendar, role: 'dialog', 'aria-label': t('panel.date.label') },
            h('div', { style: styles.calHead },
              h('button', {
                type: 'button',
                style: styles.calNav,
                'aria-label': t('panel.date.prev'),
                onClick: () => setCursor((current) => shiftMonth(current, -1)),
              }, '‹'),
              h('span', { style: styles.calMonth }, format(t('panel.date.month'), { year: cursor.year, month: cursor.month })),
              h('button', {
                type: 'button',
                style: styles.calNav,
                'aria-label': t('panel.date.next'),
                onClick: () => setCursor((current) => shiftMonth(current, 1)),
              }, '›')),
            h('div', { style: styles.calWeek },
              ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((key) =>
                h('span', { key, style: styles.calWeekday }, t('panel.date.wd.' + key)))),
            h('div', { style: styles.calGrid }, cells),
            h('div', { style: styles.calFoot },
              quick(0, t('panel.date.all'), 0),
              quick(1, t('panel.date.today'), 1),
              quick(7, t('panel.date.last7'), 7),
              quick(30, t('panel.date.last30'), 30)))
          : null)
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
      const [filter, setFilter] = React.useState({ dateFrom: '', dateTo: '', workspaceId: '', search: '', includeSubagents: false })
      const [page, setPage] = React.useState(1)
      const [selected, setSelected] = React.useState(() => new Set())
      // Inline styles have no pseudo-classes, so the hovered and keyboard-focused
      // row ids are tracked in state to render their visual states.
      const [hoverId, setHoverId] = React.useState(null)
      const [focusId, setFocusId] = React.useState(null)
      const selectAllRef = React.useRef(null)
      // Days that had sessions in the previous listing, so "this day is gone"
      // can be told apart from "this day never had anything".
      const knownDays = React.useRef(null)
      // Clicking a row focuses it as well; the focus treatment exists for keyboard
      // users, so a recent pointer press suppresses it (inline styles cannot use
      // :focus-visible).
      const pointerDownAt = React.useRef(0)
      const [settings, setSettings] = React.useState(null)
      const [notice, setNotice] = React.useState(null)
      const [busy, setBusy] = React.useState(false)
      const [api, setApi] = React.useState(() => getApi())
      const [apiMissing, setApiMissing] = React.useState(false)
      /**
       * True when the host half predates `supportsRange`. The client bundle is
       * re-read on every page load while the host is only loaded at process
       * start, so this combination is common and, without a notice, looks
       * exactly like "the range filter is broken".
       */
      const [hostStale, setHostStale] = React.useState(false)

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
        setHostStale(value.supportsRange !== true)
        const days = Array.isArray(value.dates) ? value.dates : []
        const present = new Set(days.map((bucket) => bucket.date))
        const previous = knownDays.current
        knownDays.current = present
        // Only a day that *had* sessions and lost them is reset. A day the user
        // deliberately picks out of an empty stretch was never in `dates`, and
        // resetting that would answer a request for one day with the whole
        // archive — the exact opposite of what was asked.
        if (filter.dateFrom !== ''
          && filter.dateFrom === filter.dateTo
          && previous !== null
          && previous.has(filter.dateFrom)
          && !present.has(filter.dateFrom)) {
          setFilter((current) => ({ ...current, dateFrom: '', dateTo: '' }))
        }
        // The host clamps an out-of-range page; follow it instead of asking for
        // a page that no longer exists on every subsequent request.
        if (typeof value.page === 'number' && value.page !== page) setPage(value.page)
      }, [filter.dateFrom, filter.dateTo, page])

      /**
       * A host from before 0.1.8 only understands a single `date`. Sending it
       * alongside the range keeps a not-yet-restarted host filtering instead of
       * silently returning everything; the new host prefers `dateFrom`.
       */
      const requestFilter = (current) => ({
        ...current,
        date: current.dateFrom !== '' && current.dateFrom === current.dateTo ? current.dateFrom : '',
      })

      const load = React.useCallback(async () => {
        if (api === undefined) return
        setState((current) => ({ ...current, loading: true, error: null }))
        try {
          const result = await api.list({ filter: requestFilter(filter), page, pageSize: 25 })
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
          const result = await api.list({ filter: requestFilter(filter), page, pageSize: 25 })
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
      // "Nothing archived" and "nothing matches these filters" are different
      // answers; showing the first when the second is true reads as a bug.
      const narrowed = filter.dateFrom !== '' || filter.dateTo !== '' || filter.search !== '' || filter.workspaceId !== ''

      // Selection and keyboard focus outrank hover; focus outranks a plain hover
      // because it is the state that answers "which row do the arrow-free keys
      // act on".
      const rowVisual = (selectedNow, hovered, focused) => {
        const style = { ...styles.dataRow }
        if (selectedNow) Object.assign(style, hovered ? styles.dataRowSelectedHover : styles.dataRowSelected)
        else if (focused) Object.assign(style, styles.dataRowFocused)
        else if (hovered) Object.assign(style, styles.dataRowHover)
        return style
      }

      const selectedOnPage = rows.filter((row) => selected.has(row.id)).length
      const allOnPage = rows.length > 0 && selectedOnPage === rows.length

      // A half-selected page looks like "nothing selected" without the native
      // indeterminate dash, which can only be set as a DOM property.
      React.useEffect(() => {
        const box = selectAllRef.current
        if (box !== null) box.indeterminate = selectedOnPage > 0 && !allOnPage
      }, [selectedOnPage, allOnPage, rows.length])

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
          // A session whose log is already gone is not a failure: the Host
          // retires its archive entry instead, and the count is reported
          // separately so "deleted 0" plus no failures never reads as a no-op.
          const repaired = Array.isArray(value.orphans) ? value.orphans.length : 0
          notify({
            kind: failures.length > 0 ? 'error' : 'ok',
            text: format(t('panel.deleted'), { count: value.deleted, failed: failures.length })
              + (repaired > 0 ? format(t('panel.repaired'), { count: repaired }) : '')
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

      // Selection gets its own strip above the table. Inside the filter row it
      // looked like a fourth filter, wrapped away from the table it acts on, and
      // disappeared from view the moment the row wrapped to two lines.
      const selectionBar = selected.size === 0 ? null : h('div', { style: styles.selectionBar, role: 'status' },
        h('span', { style: styles.selectionCount }, format(t('panel.selected'), { count: selected.size })),
        h('button', { type: 'button', style: styles.button, disabled: busy, onClick: () => setSelected(new Set()) },
          t('panel.clearSelection')),
        h('button', { type: 'button', style: styles.primary, disabled: busy, onClick: () => unarchive([...selected]) },
          format(t('panel.unarchiveMany'), { count: selected.size })),
        h('button', { type: 'button', style: styles.dangerSolid, disabled: busy, onClick: () => remove([...selected]) },
          format(t('panel.deleteMany'), { count: selected.size })))

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
          // Search owns the flexible width; the two selects keep their intrinsic
          // size. The magnifier and the clear button sit inside the field, which
          // is what makes it read as a search box rather than as a bare input.
          h('div', { style: styles.search },
            h('svg', { style: styles.searchIcon, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' },
              h('circle', { cx: '7', cy: '7', r: '4.5', stroke: 'currentColor', strokeWidth: '1.5' }),
              h('path', { d: 'M10.5 10.5 L14 14', stroke: 'currentColor', strokeWidth: '1.5', strokeLinecap: 'round' })),
            h('input', {
              style: { ...styles.input, ...styles.searchInput },
              type: 'text',
              'aria-label': t('panel.search'),
              placeholder: t('panel.search'),
              value: filter.search,
              onChange: (event) => {
                const value = event.target.value
                setFilter((current) => ({ ...current, search: value }))
                setPage(1)
              },
            }),
            filter.search === ''
              ? null
              : h('button', {
                type: 'button',
                style: styles.clearButton,
                title: t('panel.clearSearch'),
                'aria-label': t('panel.clearSearch'),
                onClick: () => {
                  setFilter((current) => ({ ...current, search: '' }))
                  setPage(1)
                },
              }, '✕')),
          h(DateRangeField, {
            t,
            from: filter.dateFrom,
            to: filter.dateTo,
            dates,
            onChange: (nextFrom, nextTo) => {
              setFilter((current) => ({ ...current, dateFrom: nextFrom, dateTo: nextTo }))
              setPage(1)
            },
          }),
          h('div', { style: { ...styles.selectWrap, flex: '0 1 auto', minWidth: '96px' } },
            h('select', {
              style: styles.select,
              // Truncated pickers still explain themselves on hover.
              title: filter.workspaceId === '' ? t('panel.workspace.all') : filter.workspaceId,
              'aria-label': t('panel.workspace.all'),
              value: filter.workspaceId,
              onChange: (event) => {
                const value = event.target.value
                setFilter((current) => ({ ...current, workspaceId: value }))
                setPage(1)
              },
            },
            h('option', { value: '' }, t('panel.workspace.all')),
            Object.keys(workspaces).map((id) => h('option', { key: id, value: id }, workspaces[id]))),
            h('span', { style: styles.selectCaret, 'aria-hidden': 'true' }, '▾')),
          h('label', { style: { ...styles.switchPill, ...(filter.includeSubagents ? styles.switchPillOn : {}) } },
            h('input', {
              type: 'checkbox',
              checked: filter.includeSubagents,
              onChange: (event) => {
                const checked = event.target.checked
                setFilter((current) => ({ ...current, includeSubagents: checked }))
                setPage(1)
              },
            }),
            h('span', null, t('panel.subagents')))),
        hostStale
          ? h('div', { style: styles.staleBar, role: 'status' }, t('panel.hostStale'))
          : null,
        selectionBar,
          rows.length === 0
            ? h('div', { style: { ...styles.muted, padding: '18px 0', textAlign: 'center' } },
              state.loading ? '…' : t(narrowed ? 'panel.emptyFiltered' : 'panel.empty'))
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
                      ref: selectAllRef,
                      style: styles.checkbox,
                      'aria-label': t('panel.selectAll'),
                      checked: allOnPage,
                      onChange: (event) => {
                        if (event.target.checked) setSelected(new Set(rows.map((row) => row.id)))
                        else setSelected(new Set())
                      },
                    })),
                  h('th', { style: styles.th }, t('panel.colTitle')),
                  h('th', { style: styles.th }, t('panel.colWorkspace')),
                  h('th', { style: styles.th }, t('panel.colActivity')),
                  h('th', { style: { ...styles.th, textAlign: 'right' } }, t('panel.colAction')))),
                // The whole row is the selection target now; the checkbox stays a
                // real control (tabbable, announced) instead of the only way in.
                h('tbody', null, rows.map((row) => h('tr', {
                  key: row.id,
                  role: 'row',
                  'aria-selected': selected.has(row.id),
                  tabIndex: 0,
                  style: rowVisual(selected.has(row.id), hoverId === row.id, focusId === row.id),
                  onClick: () => toggle(row.id),
                  onKeyDown: (event) => {
                    // Space on a checkbox or a button belongs to that control: the
                    // row only toggles when it is itself the event target.
                    if (event.target !== event.currentTarget) return
                    if (event.key !== ' ' && event.key !== 'Enter') return
                    event.preventDefault()
                    toggle(row.id)
                  },
                  onMouseEnter: () => setHoverId(row.id),
                  onMouseLeave: () => setHoverId((current) => (current === row.id ? null : current)),
                  onMouseDown: () => { pointerDownAt.current = Date.now() },
                  onFocus: () => {
                    if (Date.now() - pointerDownAt.current < 600) return
                    setFocusId(row.id)
                  },
                  onBlur: () => setFocusId((current) => (current === row.id ? null : current)),
                },
                  h('td', { style: focusId === row.id ? { ...styles.td, ...styles.tdFocused } : styles.td },
                    h('input', {
                      type: 'checkbox',
                      style: styles.checkbox,
                      'aria-label': t('panel.selectRow'),
                      checked: selected.has(row.id),
                      // Without this the click would toggle once here and once more
                      // through the row handler, cancelling itself out.
                      onClick: (event) => event.stopPropagation(),
                      onChange: () => toggle(row.id),
                    })),
                  h('td', { style: { ...styles.td, whiteSpace: 'normal' } },
                    // The title is what identifies a conversation, so it owns the
                    // flexible column; an untitled session says so and shows a
                    // de-emphasised id instead of competing with the titles.
                    h('div', { style: { ...styles.ellipsis, fontSize: '13px' }, title: row.title || row.id },
                      row.title || h('span', { style: styles.muted }, t('panel.untitled') + ' ' + row.id)),
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
                      // Row clicks toggle selection; the action buttons must not
                      // also select the row they are about to act on.
                      h('button', { type: 'button', style: styles.iconButton, disabled: busy, title: t('panel.unarchive'), onClick: (event) => { event.stopPropagation(); unarchive([row.id]) } }, '↩'),
                      h('button', { type: 'button', style: styles.iconDanger, disabled: busy, title: t('panel.delete'), onClick: (event) => { event.stopPropagation(); remove([row.id]) } }, '✕')))))))),
          h('div', { style: styles.pager },
            h('span', { style: styles.pagerInfo }, format(t('panel.page'), { page: page, pages: pageCount })),
            h('button', { type: 'button', style: { ...styles.button, marginLeft: 'auto', ...(page <= 1 ? styles.disabled : {}) }, disabled: page <= 1, onClick: () => setPage(page - 1) }, t('panel.prev')),
            h('button', { type: 'button', style: { ...styles.button, ...(page >= pageCount ? styles.disabled : {}) }, disabled: page >= pageCount, onClick: () => setPage(page + 1) }, t('panel.next')))),
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
