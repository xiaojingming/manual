# 更新日志

本文档记录 CSC (CoStrict CLI) 项目的所有重要变更。

---

## [4.2.1] - 2026-06-10

### ✨ 新功能
- **Agent Detail Panel**: agent row 增强显示上下文使用量和模型信息。

### 🐛 问题修复
- **Agent Panel**: 修正模型名称显示并优化 context row 布局。
- **Agent Panel**: 将 completed agent row 中的中文标签替换为英文。
- **UI**: 为 slash command suggestion panel 添加上方间距。
- **Session Resume**: 改进错误处理和退出诊断。

### 🏗️ 构建与 CI
- **Matrix Tactical**: 从 statusline 中移除 `[STAT]` 标签和 cost 显示。

### 🔒 安全
- **依赖升级**: 升级漏洞依赖（`shell-quote`、`exporter-prometheus`、`tmp`）。

---

## [4.2.0] - 2026-06-09

### ✨ 新功能
- **Legacy Compatibility**: 为会话扫描、文件历史、粘贴缓存、统计缓存、会话环境、insights 和 transcript reader 全面添加旧版 `~/.claude/` 目录回退支持。
- **Session Management**: `applySortAndLimit` 现在对会话 ID 去重，并确保主目录优先。

### 🐛 问题修复
- **API**: 在流式 API 错误时触发 `session.error`，并支持流消息跟踪。
- **Legacy Compatibility**: 为用户 `CLAUDE.md` 和规则发现添加旧版回退。
- **Legacy Compatibility**: `stats.ts` 和 `cleanup.ts` 现在扫描旧版 `~/.claude/projects/` 以获取会话统计和清理。
- **Legacy Compatibility**: 将硬编码的 `~/.claude/history.jsonl` 路径替换为配置主目录解析。
- **Legacy Compatibility**: 在 `findMostRecentBackup` 中添加旧版 `~/.claude/backups/` 回退。
- **Legacy Compatibility**: 为市场配置添加旧版 `~/.claude/plugins/` 回退。
- **Legacy Compatibility**: 为 6 个子系统和内存目录添加旧版 `~/.claude/` 读取回退。
- **Memory Panel**: 修复 `/memory` 面板中 `CLAUDE.md`/`AGENTS.md` 的路径不匹配问题。

### 🏗️ 构建与 CI
- **Workspace**: 将 workspace scope 从 `@ant`/`@anthropic-ai` 迁移到 `@costrict`。

### 🧹 清理与杂项
- 简化 `package.json` 中的 self-verify 脚本。
- 移除 `listSessionsImpl.ts` 中未使用的 `basename` 导入。

---

## [4.1.12] - 2026-06-08

### ✨ 新功能
- **Self-Verify**: 新增 `--only` 过滤器以运行特定场景子集，并将默认行为切换为运行完整场景套件。
- **Self-Verify**: 支持从 `settings.json` 环境变量配置区自动加载凭证，并支持检测 `ANTHROPIC_AUTH_TOKEN`。
- **Self-Verify**: 制品默认保留；在 Windows 上重试清理以避免权限错误。

### 🐛 问题修复
- **Build**: 修复本地开发构建，将 `ripgrep` 二进制文件复制到 `dist/vendor`。
- **Self-Verify**: 修复 `stdout`/`stderr` 竞态条件，并正确应用 `timeoutMultiplier`。

### 🧹 清理与杂项
- **Brand Compliance**: 清理过期的功能标志，并新增 `LODESTONE` / `CHICAGO_MCP` 标志。
- **Docs**: 移除 CSC 系统架构文档，并将 self-verify 设计文档移至仓库根目录。

---

## [4.1.11] - 2026-06-08

### ✨ 新功能
- **API**: 通过 HTTP 头在所有 LLM 提供商之间传递 `parentAgentId` 和 `agentId`；移除 Grok 和 OpenAI 的客户端缓存。
- **Session Warm Pool**: 预生成子进程连接以减少冷启动延迟。
- **Self-Verify**: 实现设计规范中的缺失项 —— 提供商检测、凭证预检、stderr 严重级别分类以及隔离审计。
- **Brand Compliance**: 为旧版 `~/.claude/` 配置路径、`CLAUDE_CODE_*` / `ANTHROPIC_*` 环境变量以及 `OAUTH_CLIENT_ID` 旧版映射添加向后兼容性，并支持 `COSTRICT_` 前缀。
- **Model Options**: 在模型能力中新增 `supportsImages` 标志。
- **Security**: 新增预发布安全扫描命令，以防止 npm 依赖投毒。
- **Self-Verify**: 新增完整 release-p0 场景（16 个场景）、冒烟场景（version、help、model、config-isolation）以及报告模块（JSON、Markdown、console、redaction）。

### 🐛 问题修复
- **Costrict Core**: 递归剥离 `tool_result` 内容中不支持的图像块。
- **Sessions**: 正确处理已停止的会话状态，并将 `eventBus` 传递给 `ssePrompt`。
- **Brand Compliance**: 在 `loadSkillsDir.ts`、核心上下文加载、打包 skill 提示词、CLI 输出、插件管理 UI、memory/skills/TUI/doctor/rawDump UI、agent 向导标签、核心路径常量以及权限系统中替换硬编码的 `.claude` 路径。
- **Brand Compliance**: 将归属邮箱从 `anthropic.com` 更新为 `costrict.ai`；恢复登录/认证中被过度替换的 Anthropic 品牌，并添加自动模型别名。
- **Build**: 解决由 rawDump worker 中的顶层 await 导致的 Bun 构建失败。
- **Brand Compliance**: 移除提示词注册表、Ink 组件、UI 字符串、环境变量以及工具 UI 中剩余的 Claude 品牌引用。
- **API**: 恢复 CoStrict 环境兼容性，并修复之前 sed 替换损坏的剩余 `antModel` 导入。

### 🏗️ 构建与 CI
- **Brand Compliance**: 新增 CoStrict 品牌合规性集成测试套件。

### 🧹 清理与杂项
- 移除品牌合规性测试报告和根因分析文档。
- 更新贡献者列表。

---

## [4.1.10] - 2026-06-04

### ✨ 新功能
- **Matrix Tactical**: 在矩阵状态栏中新增权限模式循环提示。
- **Docs**: 新增架构概述和 self-verify 设计文档。
- **Raw Dump**: 实现完整的对话历史报告，并支持去重以最小化重复上传。
- **Raw Dump**: 将 `commit` 和 `statistics` 拆分为独立的定时器。

### 🐛 问题修复
- **Matrix Tactical**: 优化 API 错误渲染。
- **UI**: 移除 CachePill 倒计时器，防止终端回滚。
- **UI**: 为主题提示输入应用主题文本颜色。
- **Plugins**: 修正 `cospowers` 市场自动更新名称。
- **Matrix Tactical**: 提升 theme hook 并集成状态字段扩展。
- **Raw Dump**: 修复数据一致性问题（P0/P1）、错误的 `incomplete` 计数，以及 summary/statistics/conversation 报告后的负计数器。
- **Raw Dump**: `saveTasks` 现在重新计算 `incomplete` 以避免同步漂移。
- **Matrix Tactical**: 优化颜色 token、战术提示展示和主题感知。

### 🧹 清理与杂项
- 撤销对 `.husky/pre-commit` shebang 的意外添加。
- 移除冗余代码。
- 更新贡献者列表。

---

## [4.1.9] - 2026-06-01

### 🐛 问题修复
- **Matrix Tactical**: 将权限审查横幅中的中文文本替换为英文。
- **Matrix Tactical**: 将背景颜色与主题基础对齐，以移除可见的色块。
- **Intranet**: 修复测试 mock 污染并添加 `require()` 注释。
- **Date Switching**: 修复切换日期时缺失的昨日变更统计。

### ✨ 新功能
- **Poor Mode**: 新增三态语义，支持内网默认配置。
- **Intranet**: 新增 CoStrict 内网检测助手和启动缓存。
- **Matrix Tactical**: 新增分段状态着色、正确的提示宽度、左边框、语气到文本颜色映射、权限框架的琥珀色双边框，以及按指标类型分段的状态栏颜色。

### 🧹 清理与杂项
- 取消跟踪本地计划和规格文件的分支跟踪。
- 更新贡献者列表。

---

## [4.1.8] - 2026-05-29

### ✨ 新功能
- **Server**: 将待处理查询异步化，并支持基于 CWD 的会话过滤。
- **Plugins**: 无需重启即可热重载云端收藏插件。
- **Matrix Tactical**: 新增提示页脚样式、状态栏展示、工具使用行、权限框架、欢迎展示、带闪烁光标的括号框架加载格式、三角形 glyph 旋转器以及展示助手。
- **Server**: 规范化 SSE 事件数据，并自动注入 `type` 字段。
- **Matrix Tactical**: 注册 CLI 主题并迁移默认主题配置。
- **Raw Dump**: 启动时自动创建 `raw-dump` 目录。
- **Compaction**: 为紧凑事件适配 SSE 转换层。
- **API Errors**: 新增友好的错误消息和可操作的重置建议。

### 🐛 问题修复
- **Serve**: 当 `tool_result` 未通过 stdout 到达时，为工具发出完成事件。
- **Costrict**: 在启动期间缓存内网基础 URL，作为 `poorMode` 默认值。
- **Matrix Tactical**: 修正工具类别颜色值和匹配优先级。
- **Matrix Tactical**: 对 `displayMessage` 进行记忆化，并修复括号格式的微光宽度。
- **Matrix Tactical**: 为非矩阵主题恢复提示边框。
- **Matrix Tactical**: 保留状态重置元数据，并保持页脚提示内联。
- **Matrix Tactical**: 刷新状态重置倒计时。
- **Matrix Tactical**: 将状态栏边框与提示边缘对齐。
- **Matrix Tactical**: 强化展示助手并对齐展示框。
- **Matrix Tactical**: 截断展示框标题。
- **Matrix Tactical**: 在文本外部渲染工具标签并保留工具状态布局元数据。
- **Matrix Tactical**: 在旋转 glyph 测试中使用显式 `ThemeProvider`。
- **Config**: 在配置保存期间使用原始迁移并持久化主题迁移保护。
- **Raw Dump**: 修复匿名报告 URL 错误，增强差异构建的健壮性，并添加异常处理。
- **Sessions**: 解决会话状态更新和权限 API 错误。
- **Events**: 移除 `AskUserQuestion` 和引导的重复 `control_request` 事件。
- **Build**: 禁用代码拆分和后台完成缓存更新。

### 🧹 清理与杂项
- 更新贡献者列表。
- 从分支跟踪中移除 docs/superpowers 计划和规格。
- 修复控制台版本显示文本。

---

## [4.1.7] - 2026-05-28

### ✨ 新功能
- **Matrix Tactical**: 提取停滞旋转器颜色并支持主题感知，将状态栏和提示页脚集成到主题中，集中操作前缀，并将矩阵感知扩展到错误/思考消息。
- **Raw Dump**: 新增统计报告和死信日志，用于记录超过最大重试次数的消息；提高重试队列可靠性并修复对话报告遗漏。
- **Refactor**: 将 `X-Request-ID` 从 UUID v4 切换为 UUID v7。
- **Matrix Tactical**: 用会话上下文替换静态欢迎信息。

### 🐛 问题修复
- **Raw Dump**: 修复任务 `incomplete` 计数双重递增问题和队列空完成检查。
- **Matrix Tactical**: 修复一系列报告失败。
- **Raw Dump**: 修复统计报告中的日期格式问题，并修正 `.claude` 目录的 JSONL 解析。

### 🧹 清理与杂项
- 更新贡献者列表。

---

## [4.1.6] - 2026-05-25

### ✨ 新功能
- **Plugin Marketplace Reconciliation**: 云端收藏插件现在自动对账到本地 `/plugin` 面板。取消收藏插件会在本地卸载，移除云端收藏会触发自动同步卸载。
- **Aggregated Marketplace**: 插件对账现在使用聚合的 `costrict-plugins` 市场以获得更广泛的覆盖。
- **Session ID Tracking**: 在 CoStrict 和 OpenAI 提供商请求中添加 `X-Session-Id` 头以提高可追踪性。
- **Stream Input Preview**: 流事件中现在显示早期工具输入预览以提供更快的反馈。

### 🐛 问题修复
- **Session Status Management**: 改进会话状态处理，防止陈旧或不一致的状态。
- **React Compiler Stability**: 在 `processBashCommand` 中将 JSX 替换为 `React.createElement` 以防止 React Compiler 崩溃。
- **Plugin Reconcile Hardening**: 根据代码审查反馈强化插件对账逻辑。

---

## [4.1.5] - 2026-05-22

### ✨ 新功能
- **Tabbed `/hub` Interface**: 将 `/hub` 命令重构为带分类标签的选项卡界面，以便更轻松地导航。
- **Memory Cloud Sync**: 将内存云端同步添加到 `costrict-web` API。
- **Permission Input Normalization**: 为权限元数据添加输入规范化以实现更一致的处理。

### 🐛 问题修复
- **Session Delete Event Scope**: 将 `session.deleted` 事件限制为仅 API DELETE 操作，防止意外触发。
- **Raw-Mode Bash Input**: 在 raw 模式 bash 输入中剥离 `!` 前缀，并添加纵深防御保护。
- **Cloud Command Stdin**: 通过切换到快速路径执行模型解决云命令中的 stdin 问题。
- **File Handle Cleanup**: 将 `await using` 替换为手动 `try-finally` 以实现更可靠的文件句柄清理。
- **Serve Mode Tool Events**: 修复 serve 模式下的工具事件发射以实现正确的 UI 渲染。
- **Search Extra Tools Schema**: `search-extra-tools` 现在在发现模式结果中返回正确的输入 schema。

### 🧹 清理与杂项
- 将构建产物添加到 `.gitignore`。

---

## [4.1.4] - 2026-05-21

### ✨ 新功能
- **Standalone Auto-Update**: 新增独立的自动更新机制，实现更平滑的升级。
- **Command Execution Logging**: 为云命令添加执行日志以辅助调试。
- **Subagent Status in Messages API**: Messages API 现在返回带有准确 `running` 状态的部分，用于活跃的子 agent。
- **Cost-Optimized Auxiliary Tasks**: CoStrict 现在使用最便宜的模型（按 `creditConsumption`）执行 haiku 级别的辅助任务。

### 🚀 优化与重构
- **Cloud Spawn Performance**: 优化 `cs-cloud` 生成性能并移除多余的调试日志。
- **Execution Log Level**: 将执行日志输出从 `debug` 级别更改为 `info` 级别以提高可见性。
- **Subagent Transcript Lookup**: 通过缓存、基于元数据的解析和启动索引优化子 agent 记录查找。

### 🐛 问题修复
- **Linux Cloud Command Hangs**: 防止云命令在 Linux 上挂起。
- **Task Updates Without Tool Calls**: 恢复缺失关联工具调用的任务更新。
- **Tool Use Status Default**: 在记录分解期间将 `tool_use` 状态默认设置为 `completed`。
- **Task Progress Part Matching**: 使用 `callID` 匹配以实现更可靠的任务进度部分更新。
- **Tool Name Normalization**: 规范化工具名称，并从 `running`/`completed` 事件中移除 `metadata.sessionId`。
- **Favorite List Filtering**: 收藏列表路由现在正确遵守 `type` 查询参数。
- **WeChat Startup Guard**: 当未配置微信账号时避免启动初始化。
- **Ctrl+Enter Terminal Behavior**: 修复 Ctrl+Enter 在标准终端中插入换行而不是发送消息。
- **OpenAI Reasoning Fallback**: 在 OpenAI 流适配器中为非标准的 `reasoning` / `reasoning_details` 字段添加回退处理。

### 🏗️ 构建与 CI
- **Serve Event Standardization**: 添加 serve 事件标准化和消费者能力的文档。

---

## [4.1.3] - 2026-05-19

### ✨ 新功能
- **Raw Dump Parent IDs**: 在 raw-dump commit 负载中添加 `parent_ids` 以实现更丰富的谱系追踪。

### 🐛 问题修复
- **Image Input Compatibility**: 在 CoStrict 中处理图像输入以支持更广泛的模型兼容性。
- **Windows LSP ENOENT**: 修复 Windows 上的 LSP 服务器启动 `ENOENT` 错误。
- **Bun YAML Parser Guard**: 添加 Bun YAML 解析器可用性保护以防止运行时错误。

---

## [4.1.2] - 2026-05-18

### 🚀 优化与重构
- **Feature Flag Unification**: `dev.ts` 和 `build.ts` 现在统一从 `defines.ts` 导入功能标志。

### 🐛 问题修复
- **OpenAI Streamed Tool Arguments**: 拒绝无效的流式工具参数以防止下游错误。
- **Cloud Favorite Lifecycle**: 修复云端收藏状态优先级和运行时生命周期处理。
- **Git Bash Raw Input**: 恢复 Ink 终端中 Git Bash 的原始输入处理。
- **Context Collapse**: 禁用 `CONTEXT_COLLAPSE` 以修复自动压缩未触发的问题。
- **Missing Task Tool Call Failures**: 显示缺失任务工具调用的失败，而不是静默丢弃。
- **Marketplace Auto-Update Config**: 默认使市场自动更新可配置。

### 🏗️ 构建与 CI
- **Contributors Documentation**: 更新贡献者文档。

---

## [4.1.1] - 2026-05-16

### 🐛 问题修复
- **Empty Agent Definitions**: 在菜单中正确重新加载空的 agent 定义。
- **Hub Skills in Command List**: 确保 `/hub` 启用的技能立即出现在命令列表中。
- **OpenAI Missing Streamed Tool Calls**: 从 OpenAI 适配器恢复缺失的流式工具调用。
- **Ink UI Cleanup**: 在 REPL 关闭时清除 Ink UI 以防止视觉伪影。
- **Serve Thinking Fragments**: 在 serve 模式下跳过仅思考的片段消息，以防止 `cs-cloud` 中的重复响应。

---

## [4.1.0] - 2026-05-15

### ✨ 新功能
- **Footer Memory/PID Toggle**: 新增 `showMemoryPid` 设置以切换页脚内存和 PID 显示。

### 🐛 问题修复
- **MCP Server Availability Hints**: 在列表面板中为失败的 MCP 服务器添加可用性提示。
- **Favorite Sync State**: 同步收藏的加载/卸载状态并提高错误可见性。
- **Update Failure Diagnostics**: 增强更新失败诊断并防止意外删除 `claude` 符号链接。
- **Raw Dump Commit Order**: 反转 raw-dump 中的 commit 顺序以防止重复上传。
- **cs-cloud Linux Hang**: 使用 `process.argv` 获取 `cs-cloud` 的原始参数，修复 Linux 挂起问题。
- **Raw Dump User-Agent**: 为 raw-dump worker 请求添加 `User-Agent` 头。
- **UUID Type Guards**: 为 snip 功能中的 UUID 处理添加类型保护和空值检查。
- **Windows Terminal Startup**: 防止 Windows 上的终端启动失败。
- **SnipTool Undefined Messages**: 处理 `SnipTool.call()` 中未定义的 `message_ids`。
- **Agent Team Idle Coordination**: 修复 agent 团队中的空闲队友协调失败。
- **Bash Foreground Task Wake**: 修复自动后台化后的前台任务唤醒行为。
- **Cursor ANSI Offset Recovery**: 处理 ANSI 换行偏移恢复以改进终端光标定位。

### 🚀 优化与重构
- **Upgrade Command Simplification**: 移除对升级命令的特殊处理，简化逻辑。

---

## [4.0.26] - 2026-05-15

### 🐛 问题修复
- **Dependencies**: 将 `semver` 从 `devDependencies` 移至 `dependencies` 以修复运行时问题。

---

## [4.0.25] - 2026-05-15

### 🏗️ 构建与 CI
- **NPM Publish**: 从发布命令中移除 `--ignore-scripts` 以确保 post-install 钩子正确运行。
- **Build Switch**: 从 Vite 构建切换为默认构建以提高稳定性。

---

## [4.0.24] - 2026-05-15

### 🐛 问题修复
- **Ink Terminal**: 将换行符视为回车，并在 TUI 中抑制收藏获取错误。

### 🏗️ 构建与 CI
- **Binary Publish**: 新增发布二进制工作流以实现自动化二进制发布。

---

## [4.0.23] - 2026-05-14

### 🏗️ 构建与 CI
- **NPM Publish**: 固定 Bun 版本，添加 Vite 构建，并在发布时忽略脚本以确保可复现性。

---

## [4.0.22] - 2026-05-14

### 🐛 问题修复
- **Node.js v20 Compatibility**: 将 `using` 语法替换为 `withDisposable` 以兼容 Node.js v20。
- **Built-in Skills**: 修复 `listBuiltinSkills` 导入名称不匹配。

### ✨ 新功能
- **Cloud Command**: 恢复云子命令注册。

---

## [4.0.21] - 2026-05-14

### ✨ 新功能
- **Favorites**: 优化收藏列表缓存并扩展 MCP 类型支持。

### 🏗️ 构建与 CI
- **NPM Publish**: 为版本提升步骤添加调试输出和容错能力。
- **CI Tags**: 如果标签指向旧提交则重新创建。

---

## [4.0.20] - 2026-05-14

### 🏗️ 构建与 CI
- **NPM Publish**: 在发布工作流中添加 SSH 设置和 review builtin 生成。
- **Tags**: 从标签中移除 `v` 前缀，并在发布工作流中跳过测试。
- **Workflow**: 修正工作流调度输入的布尔条件。

### 🐛 问题修复
- **Auth Path**: 将凭证路径注释更新为 `~/.costrict/share/auth.json`。
- **Serve Binary**: 修复由未知 `--feature` 选项导致的编译二进制 serve 子进程崩溃。

---

### 🏗️ 构建与 CI
- **NPM Publish**: 限制为手动触发，添加 dry-run 支持，规范化版本输入，并自动创建缺失的标签。

### ✨ 新功能
- **Auth Branding**: 更新 OAuth 流程消息以引用 Costrict 品牌。
- **Third-Party Provider Gating**: 添加远程 API 控制配置以限制第三方提供商。

### 🐛 问题修复
- **Serve Command**: 将虚假的服务器命令存根替换为真正的 serve 实现。
- **Permission Events**: 修复权限事件被 serve 模式中的 `shouldAvoidPermissionPrompts` 吞掉的问题。

---

### ✨ 新功能
- **Raw Dump**: 默认启用 raw dump，并支持本地模式和去重的报告模块。
- **Server**: 优化子进程管理和消息可靠性（灵感来自 vibe-kanban 架构）。
- **Compact Mode**: 添加 CoStrict 模型支持并防止无限压缩循环。

### 🚀 优化
- **Raw Dump Performance**: 降低 CPU 使用率并修复 worker 生成可靠性。

### 🐛 问题修复
- **CoStrict Provider**: 修复子 agent 模型别名从父模型继承的问题。
- **Server Agent Switch**: 修复切换内置 agent 时缺失的系统提示注入，并防止 `@agent` 出现在用户消息中。
- **Review Skills**: 在提取 review skills 前清理目标目录。
- **Session Transcripts**: 删除历史会话时同时删除磁盘记录文件。
- **Windows**: 修复 Windows 上 `generate-review-builtin` 的 cwd 路径。

---
