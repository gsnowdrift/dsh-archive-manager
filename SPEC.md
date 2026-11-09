# 会话归档管理中心插件 — 需求规格与方案

## 1. 目标
为 DSH Web GUI 增加一个「已归档会话」管理中心：筛选（按日期/工作区/关键词/运行状态）、列表展示、自动清理、批量取消归档。

## 2. 平台约束（已调研确认）
- 会话**没有删除能力**：`dsh-session-persistence` 明确「无删除或保留接口」；官方 UI 明确「没有 Session 删除」。归档 = 从侧栏隐藏，历史与位置保留。
- 因此删除走**插件自己解析落盘路径再删除**的绕行方案（`deleteSessions`：经持久化后端的 `locate()` 定位、只删 sessions 根目录内的会话目录）；归档/取消归档仍是可逆操作，删除不可逆。
- 「已归档」是有序 id 集合，由 `ctx.workspaceRegistry` 持久化，经 `remote.workspace.follow()` 流同步；归档集合里**没有归档时间戳**，需要插件自己记录归档时刻。

## 3. 功能设计
### F1 归档列表
- 表格：标题、工作区、归档时刻、创建时刻、最后活动、消息数、状态（运行中/空闲/需要迁移）
- 排序：归档时间（默认新→旧）/ 创建时间 / 标题
### F2 筛选
- 日期范围（按归档日）+ 快捷项：今天 / 最近 7 天 / 最近 30 天 / 更早 / 全部
- 关键词（标题/工作区/会话 id）、工作区下拉、分页
### F3 批量操作
- 批量取消归档（还原到侧栏原位）、单条取消归档、打开会话（自动先取消归档）
### F4 自动清理（可调策略，默认关闭）
- `auto-archive`：自动归档 N 天未活动的会话（`autoArchiveDays`，0 关闭）
- `auto-delete`：归档超过 N 天的会话自动删除（`autoDeleteDays`，含手动归档的，按各自归档时刻起算）；0 = 归档时立即删除（含手动归档，插件启动前已归档的旧条目不受影响）
- 预览按钮（只算不执行）+ 立即执行；执行记录写入状态；运行中会话一律跳过
### F5 设置
- 启用定时清理（总开关）、自动归档闲置会话（天）、自动删除归档会话（天）

## 4. 技术方案
- 单 npm 包、单行挂载：`@gsnowdrift/dsh-archive-manager`，Host 半 + `./client` 客户端半（浏览器原生 ESM，无构建步骤）
- **Host 半**：`Service` + `TypertRemoteService`，命名空间 `archiveManager`；订阅 `workspace/follow-equivalent`（`ctx.workspaceRegistry`）与 `ctx.sessionQuery`（列表/统计），记录归档时间与自动归档标记，定时器执行清理策略
- **Client 半**：`settings.section` 分区（"归档会话"）；列表为按归档日分组的会话卡片（Mantine 7），通过 `ctx.remote.archiveManager` 调用；`src/client.jsx` 经 esbuild 打包为 `lib/client.js`，React/react-dom 走宿主 seed 不打包
- **状态持久化**：`ctx.storage`（或插件自有 JSON 文件），保存在 `$DSH_HOME` 下

## 5. 风险
- 运行时里没有 `@deepseek-ai/dsh-client-ui-primitives` 包体（被 Vite 打进前端），插件不能 require 它们 ⇒ 客户端半自行打包开源组件库（Mantine 7）；`react` / `react-dom` / `react/jsx-runtime` 是平台 seed word（React 18.3.1），必须保持 external，否则会出现第二个 dispatcher、hooks 全崩
- Host 半被 Loader 从 profile 的 node_modules 解析依赖 ⇒ 安装为 profile 的 `link:` 依赖，peer 依赖需在此环境可解析
